-- ============================================================
-- Migration: 009_ml_atendimento_tables.sql
-- Schema:    ml_atendimento
-- Author:    @dev (Dex)
-- Date:      2026-04-09
-- Purpose:   Tabelas do Squad Atendimento
-- Depends:   001_ml_schemas_init.sql
-- Rollback:  rollbacks/009_ml_atendimento_tables_rollback.sql
-- ============================================================

BEGIN;

SET search_path = ml_atendimento, public;

CREATE OR REPLACE FUNCTION ml_atendimento.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Análises de satisfação por conversa
CREATE TABLE ml_atendimento.analises_satisfacao (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id         UUID NOT NULL,
  cliente_id          VARCHAR(200) NOT NULL,
  canal               VARCHAR(50) NOT NULL,
  tom_emocional       VARCHAR(20) NOT NULL CHECK (tom_emocional IN ('satisfeito','neutro','frustrado','furioso')),
  causas_insatisfacao JSONB NOT NULL DEFAULT '[]',
  risco_churn         VARCHAR(20) CHECK (risco_churn IN ('baixo','medio','alto')),
  nps_comportamental  SMALLINT CHECK (nps_comportamental BETWEEN -100 AND 100),
  momento_critico     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Estratégias de retenção por cliente
CREATE TABLE ml_atendimento.estrategias_retencao (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id           VARCHAR(200) NOT NULL,
  estrategia           TEXT NOT NULL,
  oferta_personalizada TEXT,
  prioridade_score     NUMERIC(8,2),
  prazo_acao           VARCHAR(50),
  resultado_aplicado   VARCHAR(50),  -- retido | perdido | em_andamento | nao_abordado
  satisfacao_id        UUID REFERENCES ml_atendimento.analises_satisfacao(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Avaliações de qualidade por atendimento
CREATE TABLE ml_atendimento.avaliacoes_qualidade (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id      UUID NOT NULL,
  atendente_id     VARCHAR(200) NOT NULL,
  score_qualidade  NUMERIC(4,2) CHECK (score_qualidade BETWEEN 0 AND 10),
  criterios        JSONB NOT NULL DEFAULT '{}',
  boas_praticas    JSONB NOT NULL DEFAULT '[]',
  pontos_melhoria  JSONB NOT NULL DEFAULT '[]',
  sla_cumprido     BOOLEAN,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ml_ate_sat_cliente   ON ml_atendimento.analises_satisfacao(cliente_id);
CREATE INDEX idx_ml_ate_sat_churn     ON ml_atendimento.analises_satisfacao(risco_churn);
CREATE INDEX idx_ml_ate_qual_atend    ON ml_atendimento.avaliacoes_qualidade(atendente_id);

-- Triggers
CREATE TRIGGER trg_sat_upd    BEFORE UPDATE ON ml_atendimento.analises_satisfacao   FOR EACH ROW EXECUTE FUNCTION ml_atendimento.set_updated_at();
CREATE TRIGGER trg_ret_upd    BEFORE UPDATE ON ml_atendimento.estrategias_retencao  FOR EACH ROW EXECUTE FUNCTION ml_atendimento.set_updated_at();
CREATE TRIGGER trg_qual_upd   BEFORE UPDATE ON ml_atendimento.avaliacoes_qualidade  FOR EACH ROW EXECUTE FUNCTION ml_atendimento.set_updated_at();

-- Grants
GRANT SELECT, INSERT, UPDATE ON ml_atendimento.analises_satisfacao  TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_atendimento.estrategias_retencao TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_atendimento.avaliacoes_qualidade TO ml_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA ml_atendimento TO ml_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ml_atendimento TO portal_app;

COMMIT;
