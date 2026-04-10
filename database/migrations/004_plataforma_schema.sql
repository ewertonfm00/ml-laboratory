-- =============================================================================
-- Migration: 004_plataforma_schema.sql
-- Projeto:   GLOBAL (serve todos os projetos da plataforma)
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-09
-- Purpose:   Schema central de gestão — usuários, projetos, permissões,
--            números conectados, agentes humanos e instâncias Evolution API
--
-- NOTA: Este schema NÃO usa prefixo ml_ — é global e serve todos os projetos.
-- Rollback: rollbacks/004_plataforma_schema_rollback.sql
-- =============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS _plataforma;
COMMENT ON SCHEMA _plataforma IS 'Schema global da plataforma — gestão de usuários, projetos, números e permissões';

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE _plataforma.role_global AS ENUM ('master', 'project_admin', 'contributor', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.setor_tipo AS ENUM (
    'comercial', 'atendimento', 'operacional', 'financeiro', 'marketing', 'pessoas'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.status_numero AS ENUM ('ativo', 'inativo', 'teste', 'erro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- _plataforma.usuarios
-- Todos os usuários da plataforma (master + admins + contribuidores + viewers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS _plataforma.usuarios (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  senha_hash        TEXT        NOT NULL,
  is_master         BOOLEAN     NOT NULL DEFAULT false,
  ativo             BOOLEAN     NOT NULL DEFAULT true,
  ultimo_acesso     TIMESTAMPTZ,
  avatar_url        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _plataforma.usuarios           IS 'Usuários da plataforma — master e usuários de projeto';
COMMENT ON COLUMN _plataforma.usuarios.is_master IS 'true = acesso total à plataforma inteira';

CREATE INDEX IF NOT EXISTS idx_usuarios_email  ON _plataforma.usuarios (email);
CREATE INDEX IF NOT EXISTS idx_usuarios_master ON _plataforma.usuarios (is_master) WHERE is_master = true;

-- ============================================================================
-- _plataforma.projetos
-- Cada projeto é um contexto independente (ex: Machine Learning, Outro Projeto)
-- ============================================================================
CREATE TABLE IF NOT EXISTS _plataforma.projetos (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome              VARCHAR(255) NOT NULL,
  slug              VARCHAR(100) NOT NULL UNIQUE,  -- ex: machine-learning, outro-projeto
  descricao         TEXT,
  schema_prefix     VARCHAR(20) NOT NULL,           -- ex: ml (mapeia para schemas ml_*)
  cor_tema          VARCHAR(7)  DEFAULT '#6366f1',  -- hex color para o portal
  ativo             BOOLEAN     NOT NULL DEFAULT true,
  criado_por        UUID        REFERENCES _plataforma.usuarios(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _plataforma.projetos             IS 'Projetos da plataforma — cada um com isolamento total';
COMMENT ON COLUMN _plataforma.projetos.schema_prefix IS 'Prefixo dos schemas Postgres deste projeto (ex: ml → ml_comercial)';

CREATE INDEX IF NOT EXISTS idx_projetos_slug ON _plataforma.projetos (slug);

-- ============================================================================
-- _plataforma.projeto_usuarios
-- Relacionamento usuário ↔ projeto com permissões granulares
-- ============================================================================
CREATE TABLE IF NOT EXISTS _plataforma.projeto_usuarios (
  id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id              UUID        NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,
  usuario_id              UUID        NOT NULL REFERENCES _plataforma.usuarios(id) ON DELETE CASCADE,
  role                    _plataforma.role_global NOT NULL DEFAULT 'viewer',

  -- Permissões granulares (definidas pelo project_admin ao cadastrar usuário)
  pode_validar            BOOLEAN     NOT NULL DEFAULT false,  -- validar respostas na fila
  pode_corrigir           BOOLEAN     NOT NULL DEFAULT false,  -- fazer correções
  correcao_atualiza_base  BOOLEAN     NOT NULL DEFAULT false,  -- correção atualiza lab automaticamente
  pode_cadastrar_usuarios BOOLEAN     NOT NULL DEFAULT false,  -- convidar novos usuários
  pode_ver_relatorios     BOOLEAN     NOT NULL DEFAULT true,   -- acessar dashboards
  pode_gerir_numeros      BOOLEAN     NOT NULL DEFAULT false,  -- conectar/desconectar números
  pode_upload_documentos  BOOLEAN     NOT NULL DEFAULT false,  -- upload de docs de produto

  liberado_por            UUID        REFERENCES _plataforma.usuarios(id),
  ativo                   BOOLEAN     NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (projeto_id, usuario_id)
);

COMMENT ON TABLE  _plataforma.projeto_usuarios                       IS 'Permissões granulares por usuário por projeto';
COMMENT ON COLUMN _plataforma.projeto_usuarios.correcao_atualiza_base IS 'Se true, correções aprovadas atualizam a base do laboratório automaticamente';

CREATE INDEX IF NOT EXISTS idx_proj_usr_projeto  ON _plataforma.projeto_usuarios (projeto_id);
CREATE INDEX IF NOT EXISTS idx_proj_usr_usuario  ON _plataforma.projeto_usuarios (usuario_id);

-- ============================================================================
-- _plataforma.instancias_evolution
-- Instâncias da Evolution API por projeto
-- ============================================================================
CREATE TABLE IF NOT EXISTS _plataforma.instancias_evolution (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id        UUID        NOT NULL REFERENCES _plataforma.projetos(id),
  instance_name     VARCHAR(255) NOT NULL UNIQUE,   -- ex: ml-omega-laser
  api_url           TEXT        NOT NULL,
  api_key_ref       VARCHAR(255) NOT NULL,           -- nome da var de ambiente (não o valor)
  webhook_path      TEXT        NOT NULL,            -- ex: /ml/webhook/whatsapp
  status            VARCHAR(30) NOT NULL DEFAULT 'ativo',
  ultima_atividade  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _plataforma.instancias_evolution          IS 'Instâncias Evolution API por projeto';
COMMENT ON COLUMN _plataforma.instancias_evolution.api_key_ref IS 'Nome da variável de ambiente — nunca armazenar o valor direto';

-- ============================================================================
-- _plataforma.numeros_projeto
-- Números WhatsApp conectados, com configuração de setor e produto
-- ============================================================================
CREATE TABLE IF NOT EXISTS _plataforma.numeros_projeto (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  instancia_id          UUID        NOT NULL REFERENCES _plataforma.instancias_evolution(id),
  projeto_id            UUID        NOT NULL REFERENCES _plataforma.projetos(id),
  numero_whatsapp       VARCHAR(50) NOT NULL,
  jid                   VARCHAR(255),                 -- JID completo @s.whatsapp.net
  nome_identificador    VARCHAR(255) NOT NULL,         -- ex: "Omega Laser - Produto"
  setor                 _plataforma.setor_tipo NOT NULL,
  tipo_produto_servico  VARCHAR(255),                 -- ex: Equipamentos, Locação, Dermocosméticos
  descricao             TEXT,

  -- Multi-agente
  multi_agente          BOOLEAN     NOT NULL DEFAULT false,  -- número compartilhado por vários humanos
  ferramenta_multiagente VARCHAR(100),                       -- ex: Redrive, Kommo, etc.

  -- Teste de identificação de agente humano
  teste_identificacao_agente  BOOLEAN     NOT NULL DEFAULT false,  -- validação feita após conexão
  teste_identificacao_status  VARCHAR(50) DEFAULT 'pendente',       -- pendente|ok|falhou
  teste_identificacao_em      TIMESTAMPTZ,
  teste_identificacao_notas   TEXT,

  status                _plataforma.status_numero NOT NULL DEFAULT 'teste',
  ativo                 BOOLEAN     NOT NULL DEFAULT true,
  total_mensagens       INTEGER     NOT NULL DEFAULT 0,
  ultima_mensagem_em    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _plataforma.numeros_projeto                      IS 'Números WhatsApp conectados por projeto com config de setor';
COMMENT ON COLUMN _plataforma.numeros_projeto.multi_agente         IS 'true = número compartilhado por vários atendentes humanos';
COMMENT ON COLUMN _plataforma.numeros_projeto.teste_identificacao_agente IS 'Primeira validação obrigatória: Redrive identifica o agente humano corretamente?';

CREATE INDEX IF NOT EXISTS idx_numeros_projeto_id  ON _plataforma.numeros_projeto (projeto_id);
CREATE INDEX IF NOT EXISTS idx_numeros_instancia   ON _plataforma.numeros_projeto (instancia_id);
CREATE INDEX IF NOT EXISTS idx_numeros_jid         ON _plataforma.numeros_projeto (jid);
CREATE INDEX IF NOT EXISTS idx_numeros_setor       ON _plataforma.numeros_projeto (setor);

-- ============================================================================
-- _plataforma.agentes_humanos
-- Pessoas que operam números multi-agente
-- ============================================================================
CREATE TABLE IF NOT EXISTS _plataforma.agentes_humanos (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_id             UUID        NOT NULL REFERENCES _plataforma.numeros_projeto(id),
  projeto_id            UUID        NOT NULL REFERENCES _plataforma.projetos(id),
  nome                  VARCHAR(255) NOT NULL,
  identificador_externo VARCHAR(255),    -- como o Redrive/ferramenta identifica este agente
  email                 VARCHAR(255),
  ativo                 BOOLEAN     NOT NULL DEFAULT true,
  total_conversas       INTEGER     NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _plataforma.agentes_humanos                   IS 'Agentes humanos que operam números multi-agente';
COMMENT ON COLUMN _plataforma.agentes_humanos.identificador_externo IS 'ID/nome usado pela ferramenta (Redrive) para identificar este agente';

CREATE INDEX IF NOT EXISTS idx_agentes_numero   ON _plataforma.agentes_humanos (numero_id);
CREATE INDEX IF NOT EXISTS idx_agentes_projeto  ON _plataforma.agentes_humanos (projeto_id);

-- ============================================================================
-- _plataforma.audit_log
-- Log de todas as ações relevantes (segurança + rastreabilidade)
-- ============================================================================
CREATE TABLE IF NOT EXISTS _plataforma.audit_log (
  id          BIGSERIAL   PRIMARY KEY,
  usuario_id  UUID        REFERENCES _plataforma.usuarios(id),
  projeto_id  UUID        REFERENCES _plataforma.projetos(id),
  acao        VARCHAR(100) NOT NULL,     -- ex: usuario.criado, numero.conectado, correcao.aplicada
  entidade    VARCHAR(100),              -- ex: numeros_projeto, usuarios
  entidade_id UUID,
  detalhes    JSONB       NOT NULL DEFAULT '{}',
  ip          INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE _plataforma.audit_log IS 'Auditoria completa de ações na plataforma';

CREATE INDEX IF NOT EXISTS idx_audit_usuario   ON _plataforma.audit_log (usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_projeto   ON _plataforma.audit_log (projeto_id);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON _plataforma.audit_log (created_at DESC);

-- ============================================================================
-- Triggers: updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION _plataforma.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['usuarios','projetos','projeto_usuarios',
    'instancias_evolution','numeros_projeto','agentes_humanos'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON _plataforma.%1$s;
       CREATE TRIGGER trg_%1$s_updated_at
         BEFORE UPDATE ON _plataforma.%1$s
         FOR EACH ROW EXECUTE FUNCTION _plataforma.set_updated_at();', t);
  END LOOP;
END $$;

-- ============================================================================
-- GRANTS para ml_app
-- ml_app lê dados de projeto/número para correlacionar com dados ml_*
-- Sem acesso a senhas (coluna senha_hash excluída via view se necessário)
-- ============================================================================
GRANT USAGE ON SCHEMA _plataforma TO ml_app;

-- Leitura (ml_app precisa saber projeto, número, setor para rotear dados)
GRANT SELECT ON _plataforma.projetos            TO ml_app;
GRANT SELECT ON _plataforma.numeros_projeto     TO ml_app;
GRANT SELECT ON _plataforma.instancias_evolution TO ml_app;
GRANT SELECT ON _plataforma.agentes_humanos     TO ml_app;

-- Escrita controlada (n8n atualiza atividade e contadores)
GRANT UPDATE (ultima_atividade, updated_at)
  ON _plataforma.instancias_evolution             TO ml_app;
GRANT UPDATE (total_mensagens, ultima_mensagem_em, status, updated_at)
  ON _plataforma.numeros_projeto                  TO ml_app;
GRANT UPDATE (total_conversas, updated_at)
  ON _plataforma.agentes_humanos                  TO ml_app;

-- Audit log: apenas insert (append-only)
GRANT INSERT ON _plataforma.audit_log             TO ml_app;
GRANT USAGE  ON SEQUENCE _plataforma.audit_log_id_seq TO ml_app;

-- Segurança: ml_app NÃO acessa usuarios, projeto_usuarios (dados sensíveis)
-- Acesso a usuários é exclusivo do backend do portal (role separada: portal_app)

-- ============================================================================
-- Seed: projeto Machine Learning + usuário master placeholder
-- (atualizar via portal após deploy)
-- ============================================================================
INSERT INTO _plataforma.projetos (nome, slug, descricao, schema_prefix)
VALUES ('Machine Learning', 'machine-learning',
        'Laboratório de Inteligência Aplicada a Negócios — Omega Laser (Fase 1)', 'ml')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
