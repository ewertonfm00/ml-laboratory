-- Rollback: 002_ml_captura_tables_rollback.sql
BEGIN;
DROP TABLE IF EXISTS ml_captura.transcricoes_audio CASCADE;
DROP TABLE IF EXISTS ml_captura.mensagens_raw      CASCADE;
DROP TABLE IF EXISTS ml_captura.sessoes_conversa   CASCADE;
DROP FUNCTION IF EXISTS ml_captura.set_updated_at  CASCADE;
COMMIT;
