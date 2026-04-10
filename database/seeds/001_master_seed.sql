-- =============================================================================
-- Seed 001: Usuário MASTER e Projeto Omega Laser
-- =============================================================================
-- INSTRUÇÕES:
--   1. Substitua os valores abaixo antes de executar:
--      - <EMAIL_MASTER>  → email real do usuário master (ex: admin@omegatech.com.br)
--      - <BCRYPT_HASH>   → hash bcrypt da senha (gere via: node -e "require('bcrypt').hash('SuaSenha', 10).then(console.log)")
--   2. Execute diretamente no Railway:
--      psql $DATABASE_URL < database/seeds/001_master_seed.sql
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Usuário MASTER
-- -----------------------------------------------------------------------------
-- TODO: Substitua <EMAIL_MASTER> e <BCRYPT_HASH> antes de executar
INSERT INTO _plataforma.usuarios (
  id,
  nome,
  email,
  senha_hash,
  is_master,
  ativo
) VALUES (
  gen_random_uuid(),
  'Administrador Master',
  '<EMAIL_MASTER>',       -- TODO: substituir pelo email real
  '<BCRYPT_HASH>',        -- TODO: substituir pelo hash bcrypt da senha
  true,
  true
)
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Projeto: Machine Learning — Omega Laser
-- -----------------------------------------------------------------------------
INSERT INTO _plataforma.projetos (
  id,
  nome,
  slug,
  descricao,
  schema_prefix,
  ativo
) VALUES (
  gen_random_uuid(),
  'Machine Learning — Omega Laser',
  'omega-laser',
  'Laboratório de IA para análise de conversas WhatsApp — Omega Laser Estética Avançada',
  'ml',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Associar usuário MASTER ao projeto como project_admin
-- -----------------------------------------------------------------------------
INSERT INTO _plataforma.projeto_usuarios (
  id,
  projeto_id,
  usuario_id,
  role,
  pode_validar,
  pode_corrigir,
  correcao_atualiza_base,
  pode_cadastrar_usuarios,
  pode_ver_relatorios,
  pode_gerir_numeros,
  pode_upload_documentos,
  liberado_por,
  ativo
)
SELECT
  gen_random_uuid(),
  p.id,
  u.id,
  'project_admin'::role_global,
  true,   -- pode_validar
  true,   -- pode_corrigir
  true,   -- correcao_atualiza_base
  true,   -- pode_cadastrar_usuarios
  true,   -- pode_ver_relatorios
  true,   -- pode_gerir_numeros
  true,   -- pode_upload_documentos
  u.id,   -- liberado_por (auto-referência para o master)
  true    -- ativo
FROM
  _plataforma.projetos p,
  _plataforma.usuarios u
WHERE
  p.slug = 'omega-laser'
  AND u.email = '<EMAIL_MASTER>'   -- TODO: mesmo email do usuário master acima
ON CONFLICT DO NOTHING;

COMMIT;

-- =============================================================================
-- Verificação (opcional — execute após o seed para confirmar):
-- =============================================================================
-- SELECT u.nome, u.email, u.is_master, p.nome AS projeto, pu.role
-- FROM _plataforma.usuarios u
-- JOIN _plataforma.projeto_usuarios pu ON pu.usuario_id = u.id
-- JOIN _plataforma.projetos p ON p.id = pu.projeto_id
-- WHERE p.slug = 'omega-laser';
