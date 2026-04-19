-- ============================================================
-- Migration 018: Adicionar coluna responsavel em _plataforma.projetos
-- Author:    @dev (Dex)
-- Date:      2026-04-18
-- Purpose:   Persistir o nome do responsável pelo cadastro,
--            coletado no formulário de onboarding ML-ONBOARDING-conectar-cliente
-- Rollback:  rollbacks/018_projetos_responsavel_rollback.sql
-- ============================================================

BEGIN;

ALTER TABLE _plataforma.projetos
  ADD COLUMN IF NOT EXISTS responsavel VARCHAR(255);

COMMENT ON COLUMN _plataforma.projetos.responsavel
  IS 'Nome do responsável pelo cadastro, preenchido no formulário de onboarding';

COMMIT;
