-- =============================================================================
-- Migration: 021_orquestrador_segment_catalog.sql
-- Projeto:   ML Laboratory — Machine Learning
-- Schema:    ml_orquestrador
-- Author:    @dev (Dex)
-- Date:      2026-04-25
-- Purpose:   Cria schema ml_orquestrador e tabela segment_catalog.
--            Usado pelo segment-catalog-manager (Atlas) para manter o catálogo
--            de segmentos de mercado que alimenta a Saída 2 do laboratório
--            (perfil comportamental portável).
--
-- Depends:   001_extensions.sql
-- Rollback:  rollbacks/021_orquestrador_segment_catalog_rollback.sql
-- =============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Schema ml_orquestrador
-- ----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS ml_orquestrador;

COMMENT ON SCHEMA ml_orquestrador IS 'Orquestração cross-area: catálogo de segmentos, relatórios executivos, detecção de anomalias';

-- ----------------------------------------------------------------------------
-- ml_orquestrador.segment_catalog
-- Catálogo de segmentos de mercado para avaliação de portabilidade (Saída 2)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_orquestrador.segment_catalog (
    id                VARCHAR(100)  PRIMARY KEY,               -- slug: estetica-equipamentos
    nome              VARCHAR(255)  NOT NULL,
    descricao         TEXT,
    ciclo_venda       VARCHAR(20)   NOT NULL
                        CHECK (ciclo_venda IN ('curto', 'medio', 'longo')),
    nivel_tecnico     VARCHAR(20)   NOT NULL
                        CHECK (nivel_tecnico IN ('baixo', 'medio', 'alto')),
    decisao           VARCHAR(20)   NOT NULL
                        CHECK (decisao IN ('emocional', 'racional', 'misto')),
    relacionamento    VARCHAR(20)   NOT NULL
                        CHECK (relacionamento IN ('transacional', 'consultivo', 'relacional')),
    disc_preferido    TEXT[]        NOT NULL DEFAULT '{}',     -- ex: {D,I}
    metodologia       TEXT[]        NOT NULL DEFAULT '{}',     -- ex: {SPIN,"Challenger"}
    ticket_medio      VARCHAR(20)   NOT NULL
                        CHECK (ticket_medio IN ('baixo', 'medio', 'alto')),
    cases_validados   JSONB         NOT NULL DEFAULT '[]',     -- [{perfil_id, resultado, data}]
    dados_suficientes BOOLEAN       NOT NULL DEFAULT false,    -- false = score baixa confiança
    version           INTEGER       NOT NULL DEFAULT 1,
    ativo             BOOLEAN       NOT NULL DEFAULT true,
    metadados         JSONB         NOT NULL DEFAULT '{}',
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ml_orquestrador.segment_catalog                    IS 'Catálogo de segmentos de mercado — base da Saída 2 (perfil comportamental portável)';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.id                 IS 'Slug único do segmento (ex: estetica-equipamentos)';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.ciclo_venda        IS 'Duração típica do ciclo de venda: curto | medio | longo';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.nivel_tecnico      IS 'Complexidade técnica da decisão: baixo | medio | alto';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.decisao            IS 'Perfil da decisão de compra: emocional | racional | misto';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.relacionamento      IS 'Tipo de relacionamento comercial: transacional | consultivo | relacional';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.disc_preferido     IS 'Perfis DISC mais eficazes neste segmento';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.metodologia        IS 'Metodologias de venda recomendadas para o segmento';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.cases_validados    IS 'Lista de deploys reais validados: [{perfil_id, agente_id, resultado, data}]';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.dados_suficientes  IS 'false = menos de 3 cases validados → score com baixa confiabilidade';
COMMENT ON COLUMN ml_orquestrador.segment_catalog.version            IS 'Contador de versão para versionamento de mudanças';

CREATE INDEX IF NOT EXISTS idx_segment_catalog_ativo
    ON ml_orquestrador.segment_catalog (ativo);

CREATE INDEX IF NOT EXISTS idx_segment_catalog_dados_suficientes
    ON ml_orquestrador.segment_catalog (dados_suficientes);

-- ----------------------------------------------------------------------------
-- Trigger: updated_at automático
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ml_orquestrador.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_segment_catalog_updated_at ON ml_orquestrador.segment_catalog;
CREATE TRIGGER trg_segment_catalog_updated_at
    BEFORE UPDATE ON ml_orquestrador.segment_catalog
    FOR EACH ROW EXECUTE FUNCTION ml_orquestrador.set_updated_at();

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA ml_orquestrador TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_orquestrador.segment_catalog TO ml_app;

COMMIT;
