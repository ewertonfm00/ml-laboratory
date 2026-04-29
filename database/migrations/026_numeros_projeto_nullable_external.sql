-- Migration 026: Suporte a parceiros externos (webhook /ml/external/{slug})
-- 1) Permitir numero_whatsapp e instancia_id nullable em numeros_projeto
--    (parceiros externos não usam Evolution API)
-- 2) UNIQUE constraint em agentes_humanos (projeto_id, identificador_externo)
--    para suportar ON CONFLICT na criação de atendentes externos

ALTER TABLE _plataforma.numeros_projeto
  ALTER COLUMN numero_whatsapp DROP NOT NULL,
  ALTER COLUMN instancia_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS agentes_humanos_projeto_identificador_unique
  ON _plataforma.agentes_humanos (projeto_id, identificador_externo);
