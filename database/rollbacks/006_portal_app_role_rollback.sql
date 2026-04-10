-- Rollback: 006_portal_app_role_rollback.sql
-- ATENÇÃO: Remove role portal_app e o usuário MASTER seed.
--          Execute SOMENTE se precisar reverter a migration 006.
BEGIN;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA _plataforma FROM portal_app;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA _validacao  FROM portal_app;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA ml_comercial FROM portal_app;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA ml_captura  FROM portal_app;
REVOKE USAGE ON SCHEMA _plataforma  FROM portal_app;
REVOKE USAGE ON SCHEMA _validacao   FROM portal_app;
REVOKE USAGE ON SCHEMA ml_comercial FROM portal_app;
REVOKE USAGE ON SCHEMA ml_captura   FROM portal_app;
DROP ROLE IF EXISTS portal_app;
COMMIT;
