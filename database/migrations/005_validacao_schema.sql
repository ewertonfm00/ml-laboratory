-- =============================================================================
-- Migration: 005_validacao_schema.sql
-- Projeto:   GLOBAL (serve todos os projetos)
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-09
-- Purpose:   Sistema de validação híbrida (agente + humano) para respostas
--            sobre produto/serviço, com rastreamento de erros e correções
--
-- Depends:   004_plataforma_schema.sql
-- Rollback:  rollbacks/005_validacao_schema_rollback.sql
-- =============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS _validacao;
COMMENT ON SCHEMA _validacao IS 'Sistema de validação de respostas — agente automático + fila humana + correções';

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE _validacao.tipo_fonte_doc AS ENUM ('upload', 'url', 'api');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _validacao.tipo_documento AS ENUM (
    'pdf', 'docx', 'txt', 'url', 'csv', 'xlsx', 'markdown', 'json'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _validacao.status_fila AS ENUM (
    'pendente_agente',   -- aguardando validação do agente
    'pendente_humano',   -- agente não encontrou info → humano valida
    'aprovada',          -- resposta correta (agente ou humano)
    'corrigida',         -- resposta incorreta → correção aplicada
    'ignorada'           -- descartada manualmente
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _validacao.resultado_validacao AS ENUM (
    'correta',           -- resposta está correta
    'incorreta',         -- resposta está errada
    'sem_informacao'     -- não encontrou base para validar → vai para humano
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _validacao.tipo_erro_produto AS ENUM (
    'info_incorreta',    -- informação errada sobre o produto
    'info_desatualizada',-- informação correta mas desatualizada
    'info_inexistente',  -- produto/serviço não existe na base
    'preco_incorreto',   -- erro específico de preço/valor
    'spec_incorreta'     -- especificação técnica errada
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- _validacao.documentos_produto
-- Documentação dos produtos/serviços usada pelo agente validador
-- Suporta 3 fontes: upload direto, URL, API
-- ============================================================================
CREATE TABLE IF NOT EXISTS _validacao.documentos_produto (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id            UUID        NOT NULL REFERENCES _plataforma.projetos(id),
  numero_id             UUID        REFERENCES _plataforma.numeros_projeto(id),  -- null = vale p/ todo o projeto

  produto_servico_nome  VARCHAR(255) NOT NULL,
  descricao_produto     TEXT,

  -- Tipo de fonte
  tipo_fonte            _validacao.tipo_fonte_doc NOT NULL,
  tipo_documento        _validacao.tipo_documento,

  -- Fonte: upload
  arquivo_nome          VARCHAR(500),
  arquivo_path          TEXT,                    -- caminho ou URL de storage
  arquivo_tamanho_kb    INTEGER,

  -- Fonte: URL (Google Drive, site, Notion, etc.)
  url_fonte             TEXT,
  url_tipo_sugestao     VARCHAR(100),            -- ex: PDF, Google Doc, Notion, Site

  -- Fonte: API (ERP, PIM, sistema grande)
  api_endpoint          TEXT,
  api_metodo            VARCHAR(10) DEFAULT 'GET',
  api_headers           JSONB       DEFAULT '{}',  -- sem valores sensíveis — refs a env vars
  api_auth_env_ref      VARCHAR(255),              -- nome da var de ambiente com a chave
  api_response_path     TEXT,                      -- JSONPath para extrair o conteúdo

  -- Conteúdo processado (texto extraído para o agente buscar)
  conteudo_texto        TEXT,                    -- texto limpo extraído do documento
  conteudo_embedding    TEXT,                    -- placeholder para futura busca semântica

  -- Metadados
  versao               INTEGER     NOT NULL DEFAULT 1,
  ativo                BOOLEAN     NOT NULL DEFAULT true,
  ultima_sincronizacao TIMESTAMPTZ,
  proxima_sincronizacao TIMESTAMPTZ,             -- para fontes URL/API com refresh automático
  sincronizacao_auto   BOOLEAN     NOT NULL DEFAULT false,
  intervalo_sync_horas INTEGER     DEFAULT 24,

  criado_por           UUID        REFERENCES _plataforma.usuarios(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _validacao.documentos_produto             IS 'Documentação de produto/serviço usada pelo agente validador';
COMMENT ON COLUMN _validacao.documentos_produto.tipo_fonte  IS 'upload=arquivo local | url=link externo | api=integração ERP/PIM';
COMMENT ON COLUMN _validacao.documentos_produto.numero_id   IS 'null = documento vale para todo o projeto; preenchido = específico para aquele número/setor';
COMMENT ON COLUMN _validacao.documentos_produto.conteudo_texto IS 'Texto extraído do documento — o agente faz busca textual aqui';
COMMENT ON COLUMN _validacao.documentos_produto.api_auth_env_ref IS 'Nome da var de ambiente com credencial — nunca armazenar o valor';

CREATE INDEX IF NOT EXISTS idx_docs_projeto       ON _validacao.documentos_produto (projeto_id);
CREATE INDEX IF NOT EXISTS idx_docs_numero        ON _validacao.documentos_produto (numero_id);
CREATE INDEX IF NOT EXISTS idx_docs_produto       ON _validacao.documentos_produto (produto_servico_nome);
CREATE INDEX IF NOT EXISTS idx_docs_tipo_fonte    ON _validacao.documentos_produto (tipo_fonte);
CREATE INDEX IF NOT EXISTS idx_docs_sync_auto     ON _validacao.documentos_produto (sincronizacao_auto, proxima_sincronizacao)
  WHERE sincronizacao_auto = true;

-- Índice de busca textual no conteúdo
CREATE INDEX IF NOT EXISTS idx_docs_conteudo_fts  ON _validacao.documentos_produto
  USING GIN (to_tsvector('portuguese', coalesce(conteudo_texto, '')));

-- ============================================================================
-- _validacao.fila_validacao
-- Fila central de respostas aguardando validação (agente ou humano)
-- ============================================================================
CREATE TABLE IF NOT EXISTS _validacao.fila_validacao (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id            UUID        NOT NULL REFERENCES _plataforma.projetos(id),
  numero_id             UUID        REFERENCES _plataforma.numeros_projeto(id),
  agente_humano_id      UUID        REFERENCES _plataforma.agentes_humanos(id),  -- quem enviou a resposta

  -- Referências à conversa e mensagem originais
  mensagem_id           UUID,         -- ref ml_captura.mensagens_raw.id (cross-schema)
  conversa_id           UUID,         -- ref ml_comercial.conversas.id
  sessao_id             UUID,         -- ref ml_captura.sessoes_conversa.id

  -- Resposta sendo validada
  resposta_texto        TEXT        NOT NULL,
  contexto_conversa     TEXT,         -- trecho da conversa para contexto
  produto_servico_detectado VARCHAR(255),  -- produto/serviço detectado na resposta
  confianca_deteccao    NUMERIC(4,3), -- confiança da detecção de info de produto (0-1)

  -- Status e fluxo
  status                _validacao.status_fila NOT NULL DEFAULT 'pendente_agente',
  tentativas_agente     INTEGER     NOT NULL DEFAULT 0,
  max_tentativas_agente INTEGER     NOT NULL DEFAULT 2,
  documento_usado_id    UUID        REFERENCES _validacao.documentos_produto(id),

  -- Atribuição humana (quando vai para fila humana)
  atribuido_a           UUID        REFERENCES _plataforma.usuarios(id),
  atribuido_em          TIMESTAMPTZ,
  prazo_validacao       TIMESTAMPTZ,  -- SLA de validação humana

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _validacao.fila_validacao                      IS 'Fila de respostas aguardando validação — agente primeiro, humano se necessário';
COMMENT ON COLUMN _validacao.fila_validacao.produto_servico_detectado IS 'Produto/serviço detectado automaticamente na resposta';
COMMENT ON COLUMN _validacao.fila_validacao.tentativas_agente    IS 'Quantas vezes o agente tentou validar — após max_tentativas vai para humano';

CREATE INDEX IF NOT EXISTS idx_fila_projeto       ON _validacao.fila_validacao (projeto_id);
CREATE INDEX IF NOT EXISTS idx_fila_status        ON _validacao.fila_validacao (status);
CREATE INDEX IF NOT EXISTS idx_fila_pendente_humano ON _validacao.fila_validacao (status, atribuido_a)
  WHERE status = 'pendente_humano';
CREATE INDEX IF NOT EXISTS idx_fila_produto       ON _validacao.fila_validacao (produto_servico_detectado);
CREATE INDEX IF NOT EXISTS idx_fila_created       ON _validacao.fila_validacao (created_at DESC);

-- ============================================================================
-- _validacao.validacoes
-- Resultado de cada tentativa de validação (agente ou humano)
-- ============================================================================
CREATE TABLE IF NOT EXISTS _validacao.validacoes (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  fila_id           UUID        NOT NULL REFERENCES _validacao.fila_validacao(id),
  projeto_id        UUID        NOT NULL REFERENCES _plataforma.projetos(id),

  -- Quem validou
  tipo_validador    VARCHAR(20) NOT NULL CHECK (tipo_validador IN ('agente', 'humano')),
  validador_usuario_id UUID     REFERENCES _plataforma.usuarios(id),  -- preenchido se humano
  modelo_ia         VARCHAR(100),  -- preenchido se agente (ex: claude-haiku-4-5)

  -- Resultado
  resultado         _validacao.resultado_validacao NOT NULL,
  confianca_agente  NUMERIC(4,3),  -- score de confiança se validador=agente
  trecho_base       TEXT,          -- trecho do documento que embasou a validação
  observacao        TEXT,          -- comentário do validador humano
  sugestao_correcao TEXT,          -- agente ou humano sugere a resposta correta

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _validacao.validacoes                    IS 'Histórico de todas as tentativas de validação por fila item';
COMMENT ON COLUMN _validacao.validacoes.trecho_base        IS 'Trecho exato do documento que foi usado para validar a resposta';

CREATE INDEX IF NOT EXISTS idx_validacoes_fila     ON _validacao.validacoes (fila_id);
CREATE INDEX IF NOT EXISTS idx_validacoes_projeto  ON _validacao.validacoes (projeto_id);
CREATE INDEX IF NOT EXISTS idx_validacoes_resultado ON _validacao.validacoes (resultado);

-- ============================================================================
-- _validacao.erros_produto
-- Rastreamento contínuo de erros por produto até correção definitiva
-- ============================================================================
CREATE TABLE IF NOT EXISTS _validacao.erros_produto (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  projeto_id            UUID        NOT NULL REFERENCES _plataforma.projetos(id),
  numero_id             UUID        REFERENCES _plataforma.numeros_projeto(id),
  produto_servico_nome  VARCHAR(255) NOT NULL,
  tipo_erro             _validacao.tipo_erro_produto NOT NULL,

  descricao_erro        TEXT        NOT NULL,   -- o que está errado
  resposta_incorreta_exemplo TEXT,              -- exemplo real de resposta errada
  resposta_correta_esperada  TEXT,              -- o que deveria ser respondido

  -- Frequência e rastreamento (acumulado até correção definitiva)
  frequencia            INTEGER     NOT NULL DEFAULT 1,
  primeira_ocorrencia   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultima_ocorrencia     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fila_ids              UUID[]      NOT NULL DEFAULT '{}',  -- todas as ocorrências

  -- Status e correção
  status                VARCHAR(30) NOT NULL DEFAULT 'ativo',  -- ativo | corrigido
  corrigido_em          TIMESTAMPTZ,
  correcao_id           UUID,        -- ref para _validacao.correcoes

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _validacao.erros_produto            IS 'Rastreamento contínuo de erros por produto — frequência até correção definitiva';
COMMENT ON COLUMN _validacao.erros_produto.frequencia IS 'Contador acumulado — nunca resetado, apenas marcado como corrigido';
COMMENT ON COLUMN _validacao.erros_produto.fila_ids   IS 'IDs de todos os itens da fila onde este erro apareceu';

CREATE INDEX IF NOT EXISTS idx_erros_projeto  ON _validacao.erros_produto (projeto_id);
CREATE INDEX IF NOT EXISTS idx_erros_produto  ON _validacao.erros_produto (produto_servico_nome);
CREATE INDEX IF NOT EXISTS idx_erros_status   ON _validacao.erros_produto (status);
CREATE INDEX IF NOT EXISTS idx_erros_ativos   ON _validacao.erros_produto (frequencia DESC)
  WHERE status = 'ativo';

-- ============================================================================
-- _validacao.correcoes
-- Registro de todas as correções aplicadas (quem, quando, o quê, impacto)
-- ============================================================================
CREATE TABLE IF NOT EXISTS _validacao.correcoes (
  id                        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  fila_id                   UUID        NOT NULL REFERENCES _validacao.fila_validacao(id),
  erro_id                   UUID        REFERENCES _validacao.erros_produto(id),
  projeto_id                UUID        NOT NULL REFERENCES _plataforma.projetos(id),

  -- Quem corrigiu
  corrigido_por             UUID        NOT NULL REFERENCES _plataforma.usuarios(id),

  -- O que foi corrigido
  produto_servico_nome      VARCHAR(255) NOT NULL,
  texto_incorreto           TEXT        NOT NULL,
  texto_correto             TEXT        NOT NULL,
  justificativa             TEXT,

  -- Impacto na base do laboratório
  atualiza_base_automatico  BOOLEAN     NOT NULL DEFAULT false,  -- conforme permissão do usuário
  base_atualizada           BOOLEAN     NOT NULL DEFAULT false,
  base_atualizada_em        TIMESTAMPTZ,
  base_atualizada_tabela    VARCHAR(100),  -- ex: ml_comercial.abordagens_produto
  base_atualizada_id        UUID,

  -- Aprovação adicional (quando atualiza_base_automatico = false)
  requer_aprovacao          BOOLEAN     NOT NULL DEFAULT false,
  aprovado_por              UUID        REFERENCES _plataforma.usuarios(id),
  aprovado_em               TIMESTAMPTZ,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  _validacao.correcoes                          IS 'Histórico completo de correções aplicadas com rastreamento de impacto na base';
COMMENT ON COLUMN _validacao.correcoes.atualiza_base_automatico IS 'Definido pela permissão correcao_atualiza_base do usuário no momento da correção';

CREATE INDEX IF NOT EXISTS idx_correcoes_projeto   ON _validacao.correcoes (projeto_id);
CREATE INDEX IF NOT EXISTS idx_correcoes_produto   ON _validacao.correcoes (produto_servico_nome);
CREATE INDEX IF NOT EXISTS idx_correcoes_usuario   ON _validacao.correcoes (corrigido_por);
CREATE INDEX IF NOT EXISTS idx_correcoes_pendentes ON _validacao.correcoes (requer_aprovacao, aprovado_em)
  WHERE requer_aprovacao = true AND aprovado_em IS NULL;

-- ============================================================================
-- Triggers: updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION _validacao.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['documentos_produto','fila_validacao','erros_produto'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON _validacao.%1$s;
       CREATE TRIGGER trg_%1$s_updated_at
         BEFORE UPDATE ON _validacao.%1$s
         FOR EACH ROW EXECUTE FUNCTION _validacao.set_updated_at();', t);
  END LOOP;
END $$;

-- ============================================================================
-- GRANTS para ml_app
-- n8n (ml_app) alimenta a fila de validação e registra erros
-- ============================================================================
GRANT USAGE ON SCHEMA _validacao TO ml_app;

-- Documentos: leitura para o agente validador buscar conteúdo
GRANT SELECT ON _validacao.documentos_produto TO ml_app;

-- Fila: insert (n8n detecta resposta de produto e enfileira)
--       update restrito (n8n atualiza status e tentativas)
GRANT SELECT, INSERT ON _validacao.fila_validacao TO ml_app;
GRANT UPDATE (status, tentativas_agente, documento_usado_id, atribuido_a, atribuido_em, updated_at)
  ON _validacao.fila_validacao TO ml_app;

-- Validações: insert (n8n registra resultado do agente)
GRANT SELECT, INSERT ON _validacao.validacoes TO ml_app;

-- Erros: insert + update de frequência (n8n incrementa automaticamente)
GRANT SELECT, INSERT ON _validacao.erros_produto TO ml_app;
GRANT UPDATE (frequencia, ultima_ocorrencia, fila_ids, updated_at)
  ON _validacao.erros_produto TO ml_app;

-- Correções: apenas leitura (escrita exclusiva do portal via portal_app)
GRANT SELECT ON _validacao.correcoes TO ml_app;

-- Segurança: ml_app NÃO pode fazer DELETE em nenhuma tabela de _validacao
-- Correções e validações são append-only por design

COMMIT;
