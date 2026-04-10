-- =============================================================================
-- Rollback: 005_validacao_schema_rollback.sql
-- ATENÇÃO: Remove schema _validacao e TODOS os dados de validação/correções.
--          Execute ANTES do rollback 004.
-- =============================================================================
BEGIN;
REVOKE ALL ON SCHEMA _validacao FROM ml_app;
DROP SCHEMA IF EXISTS _validacao CASCADE;
COMMIT;
