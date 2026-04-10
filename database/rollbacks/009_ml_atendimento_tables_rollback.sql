-- Rollback: 009_ml_atendimento_tables_rollback.sql
BEGIN;
DROP TABLE IF EXISTS ml_atendimento.avaliacoes_qualidade  CASCADE;
DROP TABLE IF EXISTS ml_atendimento.estrategias_retencao  CASCADE;
DROP TABLE IF EXISTS ml_atendimento.analises_satisfacao   CASCADE;
DROP FUNCTION IF EXISTS ml_atendimento.set_updated_at CASCADE;
COMMIT;
