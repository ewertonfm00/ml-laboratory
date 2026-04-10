-- ============================================================
-- Migration: 007_ml_operacional_tables.sql
-- Schema:    ml_operacional
-- Author:    @dev (Dex)
-- Date:      2026-04-09
-- Purpose:   Tabelas do Squad Operacional
-- Depends:   001_ml_schemas_init.sql
-- Rollback:  rollbacks/007_ml_operacional_tables_rollback.sql
-- ============================================================

BEGIN;

SET search_path = ml_operacional, public;

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION ml_operacional.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Processos mapeados
CREATE TABLE ml_operacional.processos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area             VARCHAR(100) NOT NULL,
  processo_nome    VARCHAR(200) NOT NULL,
  etapas           JSONB NOT NULL DEFAULT '[]',
  gargalos         JSONB NOT NULL DEFAULT '[]',
  inconsistencias  JSONB NOT NULL DEFAULT '[]',
  criticidade      VARCHAR(20) CHECK (criticidade IN ('baixa','media','alta','critica')),
  sessao_id        UUID,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Falhas operacionais detectadas
CREATE TABLE ml_operacional.falhas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area             VARCHAR(100) NOT NULL,
  tipo_falha       VARCHAR(200) NOT NULL,
  descricao        TEXT,
  frequencia       INT NOT NULL DEFAULT 1,
  condicoes        JSONB NOT NULL DEFAULT '{}',  -- horário, turno, carga
  impacto_estimado NUMERIC(10,2),
  primeira_ocorrencia TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultima_ocorrencia   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status           VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','resolvido','monitorando')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recomendações de otimização
CREATE TABLE ml_operacional.recomendacoes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area             VARCHAR(100) NOT NULL,
  titulo           VARCHAR(300) NOT NULL,
  descricao        TEXT NOT NULL,
  tipo             VARCHAR(50) CHECK (tipo IN ('quick_win','medio_prazo','longo_prazo')),
  impacto_estimado TEXT,
  complexidade     VARCHAR(20) CHECK (complexidade IN ('baixa','media','alta')),
  status           VARCHAR(30) NOT NULL DEFAULT 'proposta' CHECK (status IN ('proposta','em_andamento','implementada','descartada')),
  falha_origem_id  UUID REFERENCES ml_operacional.falhas(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ml_oper_falhas_area    ON ml_operacional.falhas(area);
CREATE INDEX idx_ml_oper_falhas_status  ON ml_operacional.falhas(status);
CREATE INDEX idx_ml_oper_rec_tipo       ON ml_operacional.recomendacoes(tipo);

-- Triggers
CREATE TRIGGER trg_processos_upd     BEFORE UPDATE ON ml_operacional.processos     FOR EACH ROW EXECUTE FUNCTION ml_operacional.set_updated_at();
CREATE TRIGGER trg_falhas_upd        BEFORE UPDATE ON ml_operacional.falhas        FOR EACH ROW EXECUTE FUNCTION ml_operacional.set_updated_at();
CREATE TRIGGER trg_recomendacoes_upd BEFORE UPDATE ON ml_operacional.recomendacoes FOR EACH ROW EXECUTE FUNCTION ml_operacional.set_updated_at();

-- Grants
GRANT SELECT, INSERT, UPDATE ON ml_operacional.processos      TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_operacional.falhas         TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_operacional.recomendacoes  TO ml_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA ml_operacional TO ml_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ml_operacional TO portal_app;

COMMIT;
