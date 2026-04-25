-- Rollback: 021_orquestrador_segment_catalog
BEGIN;
DROP TABLE IF EXISTS ml_orquestrador.segment_catalog CASCADE;
DROP FUNCTION IF EXISTS ml_orquestrador.set_updated_at() CASCADE;
DROP SCHEMA IF EXISTS ml_orquestrador CASCADE;
COMMIT;
