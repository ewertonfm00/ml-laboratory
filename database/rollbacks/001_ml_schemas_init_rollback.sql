-- =============================================================================
-- Rollback: 001_ml_schemas_init_rollback.sql
-- ATENÇÃO: Destrói TODOS os schemas ml_* e todos os dados neles.
--          Execute SOMENTE se precisar reverter a migration 001 completamente.
-- =============================================================================

-- Remover schemas em ordem reversa de dependência
DROP SCHEMA IF EXISTS ml_pessoas     CASCADE;
DROP SCHEMA IF EXISTS ml_marketing   CASCADE;
DROP SCHEMA IF EXISTS ml_atendimento CASCADE;
DROP SCHEMA IF EXISTS ml_financeiro  CASCADE;
DROP SCHEMA IF EXISTS ml_operacional CASCADE;
DROP SCHEMA IF EXISTS ml_comercial   CASCADE;
DROP SCHEMA IF EXISTS ml_platform    CASCADE;
DROP SCHEMA IF EXISTS ml_skills      CASCADE;
DROP SCHEMA IF EXISTS ml_padroes     CASCADE;
DROP SCHEMA IF EXISTS ml_data_eng    CASCADE;
DROP SCHEMA IF EXISTS ml_captura     CASCADE;

-- Remover role
DROP ROLE IF EXISTS ml_app;
