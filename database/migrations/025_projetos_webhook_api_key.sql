-- Migration 025: campo webhook_api_key em _plataforma.projetos
-- Armazena a API key gerada pelo sistema do parceiro para autenticar webhooks de saída

ALTER TABLE _plataforma.projetos
  ADD COLUMN IF NOT EXISTS webhook_api_key VARCHAR(255);
