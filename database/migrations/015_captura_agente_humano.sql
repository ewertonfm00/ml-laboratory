-- =============================================================================
-- Migration: 015_captura_agente_humano.sql
-- Projeto:   ML Laboratory — Machine Learning
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-19
-- Purpose:   Rastreabilidade do atendente humano nas sessões de conversa
--
--            1. Adiciona `tipo` e `agente_default_id` em _plataforma.numeros_projeto
--               para distinguir números mono-agente (1 pessoa fixa) de multi-agente
--               (N atendentes via Redrive ou similar).
--
--            2. Adiciona `agente_humano_id` em ml_captura.sessoes_conversa
--               para registrar qual atendente operou cada conversa.
--
-- Depends:   004_plataforma_schema.sql, 002_ml_captura_tables.sql
-- Rollback:  rollbacks/015_captura_agente_humano_rollback.sql
-- Story:     1.1 — Identificação do Atendente nas Conversas Capturadas
-- =============================================================================

BEGIN;

-- =============================================================================
-- _plataforma.numeros_projeto — novos campos
-- =============================================================================

-- tipo: identifica se o número é operado por uma pessoa fixa (mono) ou por
-- múltiplos atendentes via plataforma externa como Redrive (multi).
ALTER TABLE _plataforma.numeros_projeto
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(10) NOT NULL DEFAULT 'mono'
    CHECK (tipo IN ('mono', 'multi'));

COMMENT ON COLUMN _plataforma.numeros_projeto.tipo
  IS 'Modelo de operação do número: mono = 1 atendente fixo, multi = N atendentes via ferramenta externa (ex: Redrive)';

-- agente_default_id: apenas preenchido quando tipo = mono.
-- Aponta para o atendente fixo daquele número.
ALTER TABLE _plataforma.numeros_projeto
  ADD COLUMN IF NOT EXISTS agente_default_id UUID
    REFERENCES _plataforma.agentes_humanos(id);

COMMENT ON COLUMN _plataforma.numeros_projeto.agente_default_id
  IS 'FK para agentes_humanos — preenchido somente quando tipo = mono. Define o atendente padrão do número.';

-- =============================================================================
-- ml_captura.sessoes_conversa — novo campo
-- =============================================================================

-- agente_humano_id: atendente que operou esta sessão específica.
-- Nullable por design: sessões capturadas antes do cadastro ou de configuração
-- do número ficam com null (não retroativo — AC6 da story 1.1).
ALTER TABLE ml_captura.sessoes_conversa
  ADD COLUMN IF NOT EXISTS agente_humano_id UUID
    REFERENCES _plataforma.agentes_humanos(id);

COMMENT ON COLUMN ml_captura.sessoes_conversa.agente_humano_id
  IS 'Atendente humano que operou esta conversa. Null quando não identificado (mono sem agente_default, multi com identificador_externo desconhecido, ou sessão histórica).';

-- Índice para consultas por atendente (dashboards de performance)
CREATE INDEX IF NOT EXISTS idx_sessoes_agente
  ON ml_captura.sessoes_conversa (agente_humano_id);

COMMIT;
