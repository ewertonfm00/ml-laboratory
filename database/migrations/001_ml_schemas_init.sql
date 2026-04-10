-- =============================================================================
-- Migration: 001_ml_schemas_init.sql
-- Project:   Machine Learning Laboratory
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-09
-- Purpose:   Criar todos os schemas isolados do projeto ML
--
-- ISOLAMENTO: Todos os schemas usam prefixo ml_ para total independência
--             de outros projetos que usem a mesma instância Postgres.
--
-- Rollback:  rollbacks/001_ml_schemas_init_rollback.sql
-- =============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- SCHEMAS — um por área do laboratório
-- ----------------------------------------------------------------------------

-- Nível 2: Schemas de construção (infraestrutura do laboratório)
CREATE SCHEMA IF NOT EXISTS ml_captura;
COMMENT ON SCHEMA ml_captura IS 'ML Lab — Camada 1: Coleta de dados brutos (WhatsApp, áudio, eventos)';

CREATE SCHEMA IF NOT EXISTS ml_data_eng;
COMMENT ON SCHEMA ml_data_eng IS 'ML Lab — Camada 2: Estruturação, ETL e classificação de dados';

CREATE SCHEMA IF NOT EXISTS ml_padroes;
COMMENT ON SCHEMA ml_padroes IS 'ML Lab — Camada 3: Refinamento e identificação de padrões';

CREATE SCHEMA IF NOT EXISTS ml_skills;
COMMENT ON SCHEMA ml_skills IS 'ML Lab — Camada 4: Skills de agentes geradas a partir de padrões';

CREATE SCHEMA IF NOT EXISTS ml_platform;
COMMENT ON SCHEMA ml_platform IS 'ML Lab — Plataforma: Monitoramento, logs e estado da infraestrutura';

-- Nível 1: Schemas operacionais (um por área de negócio)
CREATE SCHEMA IF NOT EXISTS ml_comercial;
COMMENT ON SCHEMA ml_comercial IS 'ML Lab — Operacional: Área comercial (conversas, perfis, abordagens, objeções)';

CREATE SCHEMA IF NOT EXISTS ml_operacional;
COMMENT ON SCHEMA ml_operacional IS 'ML Lab — Operacional: Área de operações (processos, SLA, gargalos)';

CREATE SCHEMA IF NOT EXISTS ml_financeiro;
COMMENT ON SCHEMA ml_financeiro IS 'ML Lab — Operacional: Área financeira (fluxo, risco, previsibilidade)';

CREATE SCHEMA IF NOT EXISTS ml_atendimento;
COMMENT ON SCHEMA ml_atendimento IS 'ML Lab — Operacional: Área de atendimento (satisfação, NPS, churn)';

CREATE SCHEMA IF NOT EXISTS ml_marketing;
COMMENT ON SCHEMA ml_marketing IS 'ML Lab — Operacional: Área de marketing (campanhas, segmentação, timing)';

CREATE SCHEMA IF NOT EXISTS ml_pessoas;
COMMENT ON SCHEMA ml_pessoas IS 'ML Lab — Operacional: Área de pessoas (perfis, engajamento, onboarding)';

-- ----------------------------------------------------------------------------
-- ROLE isolada para o projeto ML
-- Garante que o usuário da aplicação só acessa schemas ml_*
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ml_app') THEN
    CREATE ROLE ml_app WITH LOGIN PASSWORD 'CHANGE_ME_IN_ENV';
    COMMENT ON ROLE ml_app IS 'ML Lab — Role da aplicação com acesso restrito a schemas ml_*';
  END IF;
END $$;

-- Grants por schema
GRANT USAGE ON SCHEMA ml_captura   TO ml_app;
GRANT USAGE ON SCHEMA ml_data_eng  TO ml_app;
GRANT USAGE ON SCHEMA ml_padroes   TO ml_app;
GRANT USAGE ON SCHEMA ml_skills    TO ml_app;
GRANT USAGE ON SCHEMA ml_platform  TO ml_app;
GRANT USAGE ON SCHEMA ml_comercial TO ml_app;
GRANT USAGE ON SCHEMA ml_operacional TO ml_app;
GRANT USAGE ON SCHEMA ml_financeiro TO ml_app;
GRANT USAGE ON SCHEMA ml_atendimento TO ml_app;
GRANT USAGE ON SCHEMA ml_marketing TO ml_app;
GRANT USAGE ON SCHEMA ml_pessoas   TO ml_app;

COMMIT;
