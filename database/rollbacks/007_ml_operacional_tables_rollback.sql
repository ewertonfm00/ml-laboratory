-- Rollback: 007_ml_operacional_tables_rollback.sql
BEGIN;
DROP TABLE IF EXISTS ml_operacional.recomendacoes CASCADE;
DROP TABLE IF EXISTS ml_operacional.falhas         CASCADE;
DROP TABLE IF EXISTS ml_operacional.processos      CASCADE;
DROP FUNCTION IF EXISTS ml_operacional.set_updated_at CASCADE;
COMMIT;
