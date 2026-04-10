-- Rollback: 003_ml_comercial_tables_rollback.sql
BEGIN;
DROP TABLE IF EXISTS ml_comercial.relatorios_performance CASCADE;
DROP TABLE IF EXISTS ml_comercial.treinamentos           CASCADE;
DROP TABLE IF EXISTS ml_comercial.objecoes               CASCADE;
DROP TABLE IF EXISTS ml_comercial.abordagens_produto     CASCADE;
DROP TABLE IF EXISTS ml_comercial.perfis_vendedor        CASCADE;
DROP TABLE IF EXISTS ml_comercial.conversas              CASCADE;
DROP TABLE IF EXISTS ml_comercial.vendedores             CASCADE;
DROP FUNCTION IF EXISTS ml_comercial.set_updated_at      CASCADE;
DROP TYPE IF EXISTS ml_comercial.tipo_objecao            CASCADE;
DROP TYPE IF EXISTS ml_comercial.tom_comunicacao         CASCADE;
DROP TYPE IF EXISTS ml_comercial.resultado_conversa      CASCADE;
DROP TYPE IF EXISTS ml_comercial.tipo_venda              CASCADE;
COMMIT;
