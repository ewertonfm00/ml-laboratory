-- ============================================================
-- Migration: 006_portal_app_role.sql
-- Projeto:   GLOBAL
-- Author:    @devops (Gage)
-- Date:      2026-04-09
-- Purpose:   Criar role portal_app para o Appsmith
--            ml_app = acesso n8n/workflows (sem usuarios)
--            portal_app = acesso Appsmith (com usuarios, gestão completa)
--
-- Depends:   004_plataforma_schema.sql, 005_validacao_schema.sql
-- Rollback:  rollbacks/006_portal_app_role_rollback.sql
-- ============================================================

BEGIN;

-- Criar role portal_app
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'portal_app') THEN
    CREATE ROLE portal_app LOGIN PASSWORD 'TROCAR_ANTES_DE_EXECUTAR';
    RAISE NOTICE 'Role portal_app criada. ATENÇÃO: trocar a senha imediatamente.';
  ELSE
    RAISE NOTICE 'Role portal_app já existe — pulando criação.';
  END IF;
END $$;

-- _plataforma: acesso completo ao que o portal precisa
GRANT USAGE ON SCHEMA _plataforma TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.usuarios             TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.projetos             TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.projeto_usuarios     TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.numeros_projeto      TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.instancias_evolution TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.agentes_humanos      TO portal_app;
GRANT SELECT, INSERT         ON _plataforma.audit_log            TO portal_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA _plataforma TO portal_app;

-- _validacao: portal gerencia fila, correções e documentos
GRANT USAGE ON SCHEMA _validacao TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _validacao.fila_validacao      TO portal_app;
GRANT SELECT, INSERT         ON _validacao.validacoes          TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _validacao.erros_produto       TO portal_app;
GRANT SELECT, INSERT         ON _validacao.correcoes           TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _validacao.documentos_produto  TO portal_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA _validacao TO portal_app;

-- ml_comercial: leitura para exibição no portal
GRANT USAGE ON SCHEMA ml_comercial TO portal_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ml_comercial TO portal_app;

-- ml_captura: leitura para tela de interações
GRANT USAGE ON SCHEMA ml_captura TO portal_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ml_captura TO portal_app;

-- Segurança: portal_app NÃO pode DROP, TRUNCATE ou DELETE em produção
-- Soft-delete via coluna ativo=false nos modelos que precisam

-- ============================================================
-- Seed: Usuário MASTER placeholder
-- ATENÇÃO: trocar email e senha_hash antes de executar em produção
-- Gerar hash: node -e "require('bcrypt').hash('SENHA',12).then(console.log)"
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM _plataforma.usuarios WHERE is_master = true) THEN
    INSERT INTO _plataforma.usuarios (nome, email, senha_hash, is_master, ativo)
    VALUES (
      'Master',
      'master@seudominio.com',
      '$2b$12$SUBSTITUIR_PELO_HASH_REAL',
      true,
      true
    );
    RAISE NOTICE 'Usuário MASTER placeholder criado. ATENÇÃO: atualizar email e senha_hash.';
  ELSE
    RAISE NOTICE 'Usuário MASTER já existe — pulando seed.';
  END IF;
END $$;

COMMIT;
