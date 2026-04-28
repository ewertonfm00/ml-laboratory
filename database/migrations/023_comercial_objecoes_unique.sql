-- =============================================================================
-- Migration: 023_comercial_objecoes_unique.sql
-- Project:   Machine Learning Laboratory
-- Schema:    ml_comercial
-- Author:    @dev (Dex)
-- Date:      2026-04-28
-- Purpose:   Adiciona unique constraint em ml_comercial.objecoes
--            (tipo_objecao, texto_objecao) para permitir upsert via
--            ON CONFLICT no pipeline ML-ANALISE
--
-- Depends:   005_ml_comercial_tables.sql
-- Rollback:  rollbacks/023_comercial_objecoes_unique_rollback.sql
-- =============================================================================

BEGIN;

ALTER TABLE ml_comercial.objecoes
    ADD CONSTRAINT uq_objecoes_tipo_texto
    UNIQUE (tipo_objecao, texto_objecao);

COMMIT;
