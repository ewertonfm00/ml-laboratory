-- ============================================================
-- Migration 012: Sistema de Perfil de Agentes com DISC
-- Tabelas: agente_perfis, agente_analises_disc, agente_performance
-- Schema: _plataforma
-- ============================================================

-- ───── Enums ─────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE _plataforma.agente_tipo AS ENUM (
    'comercial', 'suporte', 'tecnico', 'atendimento_geral'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.disc_perfil AS ENUM ('D', 'I', 'S', 'C');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.agente_nivel AS ENUM (
    'iniciante', 'intermediario', 'avancado', 'expert'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.agente_tendencia AS ENUM (
    'melhorando', 'estavel', 'piorando'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.disc_fonte AS ENUM ('ia_analise', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ───── Tabela: agente_perfis ─────────────────────────────────
-- Perfil consolidado do agente: tipo, DISC, performance geral

CREATE TABLE IF NOT EXISTS _plataforma.agente_perfis (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id          UUID NOT NULL REFERENCES _plataforma.agentes_humanos(id) ON DELETE CASCADE,
  projeto_id         UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,

  -- Tipo e classificação
  tipo_agente        _plataforma.agente_tipo NOT NULL DEFAULT 'atendimento_geral',
  nivel              _plataforma.agente_nivel NOT NULL DEFAULT 'iniciante',

  -- DISC — scores individuais 0–100
  disc_d             NUMERIC(5,2) CHECK (disc_d BETWEEN 0 AND 100),
  disc_i             NUMERIC(5,2) CHECK (disc_i BETWEEN 0 AND 100),
  disc_s             NUMERIC(5,2) CHECK (disc_s BETWEEN 0 AND 100),
  disc_c             NUMERIC(5,2) CHECK (disc_c BETWEEN 0 AND 100),

  -- Perfil dominante e secundário
  perfil_primario    _plataforma.disc_perfil,
  perfil_secundario  _plataforma.disc_perfil,
  disc_fonte         _plataforma.disc_fonte NOT NULL DEFAULT 'ia_analise',
  disc_atualizado_em TIMESTAMPTZ,

  -- Performance consolidada
  nota_performance   NUMERIC(5,2) CHECK (nota_performance BETWEEN 0 AND 100),
  tendencia          _plataforma.agente_tendencia NOT NULL DEFAULT 'estavel',

  -- Controle
  ativo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (agente_id)
);

-- ───── Tabela: agente_analises_disc ──────────────────────────
-- Histórico de análises DISC por período (geradas pela IA)

CREATE TABLE IF NOT EXISTS _plataforma.agente_analises_disc (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id                  UUID NOT NULL REFERENCES _plataforma.agentes_humanos(id) ON DELETE CASCADE,
  projeto_id                 UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,

  -- Janela analisada
  periodo_inicio             TIMESTAMPTZ NOT NULL,
  periodo_fim                TIMESTAMPTZ NOT NULL,

  -- Scores DISC do período
  disc_d                     NUMERIC(5,2) CHECK (disc_d BETWEEN 0 AND 100),
  disc_i                     NUMERIC(5,2) CHECK (disc_i BETWEEN 0 AND 100),
  disc_s                     NUMERIC(5,2) CHECK (disc_s BETWEEN 0 AND 100),
  disc_c                     NUMERIC(5,2) CHECK (disc_c BETWEEN 0 AND 100),
  perfil_primario            _plataforma.disc_perfil,
  perfil_secundario          _plataforma.disc_perfil,

  -- Base da análise
  total_conversas_analisadas INTEGER NOT NULL DEFAULT 0,

  -- Narrativa gerada pela IA
  descricao_perfil           TEXT,                         -- resumo do perfil identificado
  pontos_fortes              TEXT[],                       -- comportamentos positivos
  pontos_de_atencao          TEXT[],                       -- gaps ou riscos
  sugestoes                  TEXT[],                       -- ações de desenvolvimento
  conversas_exemplo          UUID[],                       -- IDs de conversas que embasaram

  -- Metadados
  modelo_ia                  VARCHAR(100),
  metadados                  JSONB,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Tabela: agente_performance ────────────────────────────
-- Análise de performance periódica (especialmente comercial)

CREATE TABLE IF NOT EXISTS _plataforma.agente_performance (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id            UUID NOT NULL REFERENCES _plataforma.agentes_humanos(id) ON DELETE CASCADE,
  projeto_id           UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,

  -- Janela analisada
  periodo_inicio       TIMESTAMPTZ NOT NULL,
  periodo_fim          TIMESTAMPTZ NOT NULL,

  -- Notas por dimensão (0–100)
  nota_geral           NUMERIC(5,2) CHECK (nota_geral BETWEEN 0 AND 100),
  nota_conversao       NUMERIC(5,2) CHECK (nota_conversao BETWEEN 0 AND 100),     -- % fechamentos (comercial)
  nota_satisfacao      NUMERIC(5,2) CHECK (nota_satisfacao BETWEEN 0 AND 100),    -- correlação NPS/satisfação
  nota_tempo_resposta  NUMERIC(5,2) CHECK (nota_tempo_resposta BETWEEN 0 AND 100),-- agilidade
  nota_resolucao       NUMERIC(5,2) CHECK (nota_resolucao BETWEEN 0 AND 100),     -- % resolvidos sem escalar

  -- Métricas brutas
  total_conversas      INTEGER NOT NULL DEFAULT 0,
  taxa_conversao       NUMERIC(5,2),                       -- % (comercial)
  tempo_medio_resposta INTERVAL,
  total_escalamentos   INTEGER DEFAULT 0,

  -- Narrativa
  pontos_fortes        TEXT[],
  pontos_fracos        TEXT[],
  sugestoes            TEXT[],
  conversas_exemplo    UUID[],

  -- Tendência vs período anterior
  variacao_nota_geral  NUMERIC(5,2),                       -- positivo = melhora
  tendencia            _plataforma.agente_tendencia NOT NULL DEFAULT 'estavel',

  -- Metadados
  modelo_ia            VARCHAR(100),
  metadados            JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Índices ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_agente_perfis_agente
  ON _plataforma.agente_perfis(agente_id);

CREATE INDEX IF NOT EXISTS idx_agente_perfis_projeto
  ON _plataforma.agente_perfis(projeto_id);

CREATE INDEX IF NOT EXISTS idx_agente_analises_disc_agente_periodo
  ON _plataforma.agente_analises_disc(agente_id, periodo_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_agente_performance_agente_periodo
  ON _plataforma.agente_performance(agente_id, periodo_inicio DESC);

-- ───── Trigger updated_at ────────────────────────────────────

CREATE OR REPLACE FUNCTION _plataforma.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_agente_perfis_updated_at ON _plataforma.agente_perfis;
CREATE TRIGGER trg_agente_perfis_updated_at
  BEFORE UPDATE ON _plataforma.agente_perfis
  FOR EACH ROW EXECUTE FUNCTION _plataforma.set_updated_at();

-- ───── Permissões ────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE ON _plataforma.agente_perfis TO portal_app;
GRANT SELECT, INSERT ON _plataforma.agente_analises_disc TO portal_app;
GRANT SELECT, INSERT ON _plataforma.agente_performance TO portal_app;
