-- ============================================================
-- Migration: 010_ml_marketing_pessoas_tables.sql
-- Schemas:   ml_marketing + ml_pessoas
-- Author:    @dev (Dex)
-- Date:      2026-04-09
-- Purpose:   Tabelas dos Squads Marketing e Pessoas
-- Depends:   001_ml_schemas_init.sql
-- Rollback:  rollbacks/010_ml_marketing_pessoas_tables_rollback.sql
-- ============================================================

BEGIN;

-- ============================================================
-- SCHEMA: ml_marketing
-- ============================================================

CREATE OR REPLACE FUNCTION ml_marketing.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Análises de campanha
CREATE TABLE ml_marketing.analises_campanha (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id             VARCHAR(200) NOT NULL,
  campanha_nome           VARCHAR(300),
  total_enviados          INT NOT NULL DEFAULT 0,
  total_responderam       INT NOT NULL DEFAULT 0,
  taxa_resposta           NUMERIC(5,2),
  sentimento_positivo_pct NUMERIC(5,2),
  sentimento_neutro_pct   NUMERIC(5,2),
  sentimento_negativo_pct NUMERIC(5,2),
  elementos_efetivos      JSONB NOT NULL DEFAULT '[]',
  elementos_rejeitados    JSONB NOT NULL DEFAULT '[]',
  score_campanha          NUMERIC(4,2) CHECK (score_campanha BETWEEN 0 AND 10),
  aprendizados            JSONB NOT NULL DEFAULT '[]',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Segmentos de clientes
CREATE TABLE ml_marketing.segmentos (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                   VARCHAR(200) NOT NULL,
  descricao              TEXT,
  criterios              JSONB NOT NULL DEFAULT '{}',
  tamanho_estimado       INT,
  perfil_comportamental  JSONB NOT NULL DEFAULT '{}',
  recomendacao_abordagem TEXT,
  ativo                  BOOLEAN NOT NULL DEFAULT TRUE,
  versao                 SMALLINT NOT NULL DEFAULT 1,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timing insights por segmento
CREATE TABLE ml_marketing.timing_insights (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segmento_id       UUID REFERENCES ml_marketing.segmentos(id),
  tipo_mensagem     VARCHAR(50) CHECK (tipo_mensagem IN ('oferta','informacao','relacionamento')),
  janelas_otimas    JSONB NOT NULL DEFAULT '[]',   -- [{dia_semana, hora_inicio, hora_fim, score}]
  janelas_evitar    JSONB NOT NULL DEFAULT '[]',
  confianca_modelo  NUMERIC(5,2),
  baseado_em_envios INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices marketing
CREATE INDEX idx_ml_mkt_campanha_id  ON ml_marketing.analises_campanha(campanha_id);
CREATE INDEX idx_ml_mkt_seg_ativo    ON ml_marketing.segmentos(ativo);

-- Triggers marketing
CREATE TRIGGER trg_camp_upd    BEFORE UPDATE ON ml_marketing.analises_campanha FOR EACH ROW EXECUTE FUNCTION ml_marketing.set_updated_at();
CREATE TRIGGER trg_seg_upd     BEFORE UPDATE ON ml_marketing.segmentos          FOR EACH ROW EXECUTE FUNCTION ml_marketing.set_updated_at();
CREATE TRIGGER trg_timing_upd  BEFORE UPDATE ON ml_marketing.timing_insights    FOR EACH ROW EXECUTE FUNCTION ml_marketing.set_updated_at();

-- Grants marketing
GRANT SELECT, INSERT, UPDATE ON ml_marketing.analises_campanha TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_marketing.segmentos         TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_marketing.timing_insights   TO ml_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA ml_marketing TO ml_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ml_marketing TO portal_app;


-- ============================================================
-- SCHEMA: ml_pessoas
-- ============================================================

CREATE OR REPLACE FUNCTION ml_pessoas.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Perfis comportamentais de colaboradores
CREATE TABLE ml_pessoas.perfis_colaborador (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id    VARCHAR(200) NOT NULL,
  funcao            VARCHAR(200) NOT NULL,
  dimensoes         JSONB NOT NULL DEFAULT '{}',   -- comunicacao, execucao, iniciativa, qualidade, relacionamento
  score_aderencia   NUMERIC(5,2) CHECK (score_aderencia BETWEEN 0 AND 100),
  pontos_fortes     JSONB NOT NULL DEFAULT '[]',
  gaps_identificados JSONB NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Análises de engajamento
CREATE TABLE ml_pessoas.analises_engajamento (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id    VARCHAR(200) NOT NULL,
  nivel_engajamento VARCHAR(20) NOT NULL CHECK (nivel_engajamento IN ('alto','medio','baixo','critico')),
  sinais_detectados JSONB NOT NULL DEFAULT '[]',
  risco_saida       NUMERIC(5,2) CHECK (risco_saida BETWEEN 0 AND 100),
  fatores_risco     JSONB NOT NULL DEFAULT '[]',
  acoes_recomendadas JSONB NOT NULL DEFAULT '[]',
  periodo_analise   DATERANGE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Planos de desenvolvimento e onboarding
CREATE TABLE ml_pessoas.planos_desenvolvimento (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id         VARCHAR(200) NOT NULL,
  tipo                   VARCHAR(30) NOT NULL CHECK (tipo IN ('onboarding','desenvolvimento','melhoria_performance')),
  trilha                 JSONB NOT NULL DEFAULT '[]',
  prioridades            JSONB NOT NULL DEFAULT '[]',
  mentor_sugerido_id     VARCHAR(200),
  marcos_progresso       JSONB NOT NULL DEFAULT '[]',
  progresso_pct          NUMERIC(5,2) NOT NULL DEFAULT 0,
  status                 VARCHAR(30) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','concluido','pausado','cancelado')),
  perfil_id              UUID REFERENCES ml_pessoas.perfis_colaborador(id),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices pessoas
CREATE INDEX idx_ml_pes_perfil_colab   ON ml_pessoas.perfis_colaborador(colaborador_id);
CREATE INDEX idx_ml_pes_eng_colab      ON ml_pessoas.analises_engajamento(colaborador_id);
CREATE INDEX idx_ml_pes_eng_risco      ON ml_pessoas.analises_engajamento(risco_saida);
CREATE INDEX idx_ml_pes_plano_status   ON ml_pessoas.planos_desenvolvimento(status);

-- Triggers pessoas
CREATE TRIGGER trg_perfil_upd  BEFORE UPDATE ON ml_pessoas.perfis_colaborador    FOR EACH ROW EXECUTE FUNCTION ml_pessoas.set_updated_at();
CREATE TRIGGER trg_eng_upd     BEFORE UPDATE ON ml_pessoas.analises_engajamento  FOR EACH ROW EXECUTE FUNCTION ml_pessoas.set_updated_at();
CREATE TRIGGER trg_plano_upd   BEFORE UPDATE ON ml_pessoas.planos_desenvolvimento FOR EACH ROW EXECUTE FUNCTION ml_pessoas.set_updated_at();

-- Grants pessoas
GRANT SELECT, INSERT, UPDATE ON ml_pessoas.perfis_colaborador     TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_pessoas.analises_engajamento   TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_pessoas.planos_desenvolvimento TO ml_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA ml_pessoas TO ml_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ml_pessoas TO portal_app;

COMMIT;
