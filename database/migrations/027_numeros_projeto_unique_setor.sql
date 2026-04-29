-- Migration 027: previne duplicação de (projeto_id, setor) em numeros_projeto ativos
-- Problema: o cadastro de parceiro multi-setor cria N entradas (1 por setor).
-- Sem UNIQUE, uma transação retentada pode produzir duplicatas (projeto_id, setor)
-- ativas — e o webhook /ml/external/:slug usa LIMIT 1 ao buscar pelo par,
-- mascarando a inconsistência.
--
-- Índice parcial: aplica somente onde ativo = true.
-- Isso permite:
--   - mesmo (projeto_id, setor) coexistir como inativo + ativo (histórico de
--     desativação/reativação preservado)
--   - múltiplos registros inativos com o mesmo par (registros congelados de
--     versões anteriores)
-- Mas garante:
--   - no máximo 1 registro ATIVO por (projeto_id, setor)

CREATE UNIQUE INDEX IF NOT EXISTS numeros_projeto_proj_setor_ativo_unique
  ON _plataforma.numeros_projeto (projeto_id, setor)
  WHERE ativo = true;

COMMENT ON INDEX _plataforma.numeros_projeto_proj_setor_ativo_unique IS
  'Garante no máximo 1 numero_projeto ATIVO por (projeto_id, setor). '
  'Inativos podem coexistir para preservar histórico.';
