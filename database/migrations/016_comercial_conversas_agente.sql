-- =============================================================================
-- Migration: 016_comercial_conversas_agente.sql
-- Project:   Machine Learning Laboratory
-- Schema:    ml_comercial
-- Author:    @data-engineer (Dara) + @dev (Dex)
-- Date:      2026-04-19
-- Purpose:   Propagar agente_humano_id para ml_comercial.conversas
--            Garante rastreabilidade do atendente até as tabelas derivadas
--            consumidas pelos agentes ML (behavioral-profiler, performance-reporter)
--
-- Depends:   003_ml_comercial_tables.sql, 015_captura_agente_humano.sql
-- Rollback:  rollbacks/016_comercial_conversas_agente_rollback.sql
-- =============================================================================

BEGIN;

-- ============================================================================
-- Adicionar coluna agente_humano_id em ml_comercial.conversas
-- FK para _plataforma.agentes_humanos — nullable (sessões sem atendente resolvido)
-- ============================================================================
ALTER TABLE ml_comercial.conversas
    ADD COLUMN IF NOT EXISTS agente_humano_id UUID
        REFERENCES _plataforma.agentes_humanos(id);

COMMENT ON COLUMN ml_comercial.conversas.agente_humano_id
    IS 'Atendente que operava o WhatsApp durante a conversa — propagado de ml_captura.sessoes_conversa.agente_humano_id pelo workflow ML-COMERCIAL-analise-conversa';

-- ============================================================================
-- Índice para acelerar filtros e JOINs por atendente nas análises downstream
-- (behavioral-profiler, performance-reporter, relatórios por agente)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_conversas_agente
    ON ml_comercial.conversas (agente_humano_id);

COMMIT;
