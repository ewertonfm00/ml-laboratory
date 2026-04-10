-- Rollback: 008_ml_financeiro_tables_rollback.sql
BEGIN;
DROP TABLE IF EXISTS ml_financeiro.estrategias_cobranca CASCADE;
DROP TABLE IF EXISTS ml_financeiro.previsoes_caixa      CASCADE;
DROP TABLE IF EXISTS ml_financeiro.analises_risco       CASCADE;
DROP FUNCTION IF EXISTS ml_financeiro.set_updated_at CASCADE;
COMMIT;
