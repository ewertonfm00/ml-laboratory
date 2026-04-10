-- Rollback: 010_ml_marketing_pessoas_tables_rollback.sql
BEGIN;
DROP TABLE IF EXISTS ml_pessoas.planos_desenvolvimento  CASCADE;
DROP TABLE IF EXISTS ml_pessoas.analises_engajamento    CASCADE;
DROP TABLE IF EXISTS ml_pessoas.perfis_colaborador      CASCADE;
DROP FUNCTION IF EXISTS ml_pessoas.set_updated_at CASCADE;
DROP TABLE IF EXISTS ml_marketing.timing_insights   CASCADE;
DROP TABLE IF EXISTS ml_marketing.segmentos         CASCADE;
DROP TABLE IF EXISTS ml_marketing.analises_campanha CASCADE;
DROP FUNCTION IF EXISTS ml_marketing.set_updated_at CASCADE;
COMMIT;
