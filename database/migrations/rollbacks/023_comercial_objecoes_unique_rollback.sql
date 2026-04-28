-- =============================================================================
-- Rollback: 023_comercial_objecoes_unique_rollback.sql
-- =============================================================================

BEGIN;

ALTER TABLE ml_comercial.objecoes
    DROP CONSTRAINT IF EXISTS uq_objecoes_tipo_texto;

COMMIT;
