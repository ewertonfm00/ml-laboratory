-- ============================================================
-- Migration 014: Análise de Conversas + Materiais + Metodologias
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ml_analise;

-- Materiais técnicos por projeto/número
CREATE TABLE IF NOT EXISTS ml_clinica.materiais_tecnicos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,
  numero_id  UUID REFERENCES _plataforma.numeros_projeto(id) ON DELETE SET NULL,
  titulo     TEXT NOT NULL,
  tipo       TEXT NOT NULL DEFAULT 'geral',
  conteudo   TEXT NOT NULL,
  ativo      BOOLEAN DEFAULT true,
  ordem      INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metodologias de vendas (global)
CREATE TABLE IF NOT EXISTS ml_clinica.metodologias_vendas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  descricao   TEXT,
  principios  TEXT,
  tecnicas    TEXT,
  quando_usar TEXT,
  ativo       BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Análise por conversa
CREATE TABLE IF NOT EXISTS ml_analise.analise_conversa (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id            UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,
  sessao_id             TEXT,
  numero_whatsapp       TEXT,
  agente_nome           TEXT,
  data_conversa         TIMESTAMPTZ,
  perfil_comunicacao    TEXT,
  perfil_comportamental TEXT,
  disc_identificado     TEXT,
  estilo_venda          TEXT,
  pontos_fortes         TEXT,
  pontos_melhoria       TEXT,
  nota_comercial        NUMERIC(3,1),
  produto_servico       TEXT,
  nota_tecnica          NUMERIC(3,1),
  assertividade_descricao TEXT,
  tem_sinalizacao       BOOLEAN DEFAULT false,
  revisado              BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sinalizações de respostas inadequadas
CREATE TABLE IF NOT EXISTS ml_analise.sinalizacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analise_id       UUID NOT NULL REFERENCES ml_analise.analise_conversa(id) ON DELETE CASCADE,
  tipo             TEXT NOT NULL,
  severidade       TEXT NOT NULL DEFAULT 'alerta',
  descricao        TEXT NOT NULL,
  resposta_dada    TEXT,
  resposta_sugerida TEXT,
  resolvido        BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_materiais_projeto ON ml_clinica.materiais_tecnicos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_materiais_numero ON ml_clinica.materiais_tecnicos(numero_id);
CREATE INDEX IF NOT EXISTS idx_analise_projeto ON ml_analise.analise_conversa(projeto_id);
CREATE INDEX IF NOT EXISTS idx_analise_sessao ON ml_analise.analise_conversa(sessao_id);
CREATE INDEX IF NOT EXISTS idx_analise_agente ON ml_analise.analise_conversa(agente_nome);
CREATE INDEX IF NOT EXISTS idx_sinalizacoes_analise ON ml_analise.sinalizacoes(analise_id);

-- Triggers updated_at
CREATE OR REPLACE FUNCTION ml_analise.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_materiais_updated_at ON ml_clinica.materiais_tecnicos;
CREATE TRIGGER trg_materiais_updated_at BEFORE UPDATE ON ml_clinica.materiais_tecnicos FOR EACH ROW EXECUTE FUNCTION ml_clinica.set_updated_at();

DROP TRIGGER IF EXISTS trg_analise_updated_at ON ml_analise.analise_conversa;
CREATE TRIGGER trg_analise_updated_at BEFORE UPDATE ON ml_analise.analise_conversa FOR EACH ROW EXECUTE FUNCTION ml_analise.set_updated_at();

-- Permissões
GRANT USAGE ON SCHEMA ml_analise TO portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_clinica.materiais_tecnicos TO portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_clinica.metodologias_vendas TO portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_analise.analise_conversa TO portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_analise.sinalizacoes TO portal_app;
