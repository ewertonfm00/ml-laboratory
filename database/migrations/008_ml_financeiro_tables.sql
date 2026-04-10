-- ============================================================
-- Migration: 008_ml_financeiro_tables.sql
-- Schema:    ml_financeiro
-- Author:    @dev (Dex)
-- Date:      2026-04-09
-- Purpose:   Tabelas do Squad Financeiro
-- Depends:   001_ml_schemas_init.sql
-- Rollback:  rollbacks/008_ml_financeiro_tables_rollback.sql
-- ============================================================

BEGIN;

SET search_path = ml_financeiro, public;

CREATE OR REPLACE FUNCTION ml_financeiro.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Análises de risco financeiro por cliente
CREATE TABLE ml_financeiro.analises_risco (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id                 VARCHAR(200) NOT NULL,
  nivel_risco                VARCHAR(20) NOT NULL CHECK (nivel_risco IN ('baixo','medio','alto','critico')),
  sinais_detectados          JSONB NOT NULL DEFAULT '[]',
  probabilidade_inadimplencia NUMERIC(5,2) CHECK (probabilidade_inadimplencia BETWEEN 0 AND 100),
  acoes_recomendadas         JSONB NOT NULL DEFAULT '[]',
  historico_pagamentos_resumo JSONB,
  sessao_id                  UUID,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Previsões de fluxo de caixa
CREATE TABLE ml_financeiro.previsoes_caixa (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_inicio   DATE NOT NULL,
  periodo_fim      DATE NOT NULL,
  cenario          VARCHAR(20) NOT NULL CHECK (cenario IN ('otimista','realista','pessimista')),
  previsao_diaria  JSONB NOT NULL DEFAULT '[]',  -- [{data, valor_previsto}]
  gaps_detectados  JSONB NOT NULL DEFAULT '[]',
  confianca_modelo NUMERIC(5,2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Estratégias de cobrança
CREATE TABLE ml_financeiro.estrategias_cobranca (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id            VARCHAR(200) NOT NULL,
  canal_recomendado     VARCHAR(50),
  tom_recomendado       VARCHAR(50),
  timing_recomendado    VARCHAR(100),
  script_sugerido       TEXT,
  probabilidade_sucesso NUMERIC(5,2),
  resultado_aplicado    VARCHAR(50),  -- recuperado | negociado | sem_resposta | perdido
  nivel_risco_id        UUID REFERENCES ml_financeiro.analises_risco(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ml_fin_risco_cliente ON ml_financeiro.analises_risco(cliente_id);
CREATE INDEX idx_ml_fin_risco_nivel   ON ml_financeiro.analises_risco(nivel_risco);
CREATE INDEX idx_ml_fin_prev_periodo  ON ml_financeiro.previsoes_caixa(periodo_inicio, periodo_fim);

-- Triggers
CREATE TRIGGER trg_risco_upd      BEFORE UPDATE ON ml_financeiro.analises_risco      FOR EACH ROW EXECUTE FUNCTION ml_financeiro.set_updated_at();
CREATE TRIGGER trg_previsao_upd   BEFORE UPDATE ON ml_financeiro.previsoes_caixa     FOR EACH ROW EXECUTE FUNCTION ml_financeiro.set_updated_at();
CREATE TRIGGER trg_cobranca_upd   BEFORE UPDATE ON ml_financeiro.estrategias_cobranca FOR EACH ROW EXECUTE FUNCTION ml_financeiro.set_updated_at();

-- Grants
GRANT SELECT, INSERT, UPDATE ON ml_financeiro.analises_risco        TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_financeiro.previsoes_caixa       TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_financeiro.estrategias_cobranca  TO ml_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA ml_financeiro TO ml_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ml_financeiro TO portal_app;

COMMIT;
