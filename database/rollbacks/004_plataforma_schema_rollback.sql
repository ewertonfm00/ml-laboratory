-- =============================================================================
-- Rollback: 004_plataforma_schema_rollback.sql
-- ATENÇÃO: Remove schema _plataforma e TODOS os dados de gestão da plataforma.
--          Execute SOMENTE se precisar reverter completamente a migration 004.
--          Depende: 005 deve ser revertido ANTES deste.
-- =============================================================================
BEGIN;
REVOKE ALL ON SCHEMA _plataforma FROM ml_app;
DROP SCHEMA IF EXISTS _plataforma CASCADE;
COMMIT;
