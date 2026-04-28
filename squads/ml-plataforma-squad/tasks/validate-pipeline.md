---
id: validate-pipeline
name: Validate Pipeline
task: Validate Pipeline
squad: ml-plataforma-squad
agent: monitor-agent
icon: "🔍"
atomic_layer: task
elicit: false
responsavel: monitor-agent
responsavel_type: agent
Entrada: |
  - ambiente: URL base do ambiente (Railway staging ou produção)
  - squads_ativos: Lista de squads ativos para verificar conectividade cross-squad
  - postgres_connection_string: String de conexão Postgres do cliente
  - redis_url: URL de conexão Redis com prefixo configurado
Saida: |
  - status_pipeline: Status geral do pipeline (HEALTHY / DEGRADED / DOWN)
  - relatorio_validacao: Relatório detalhado por componente (schemas, webhooks, filas, conectividade)
  - falhas_detectadas: Lista de falhas encontradas com componente, severidade e mensagem
  - recomendacoes: Lista de ações corretivas para falhas críticas
Checklist:
  - "[ ] Verificar conectividade com Postgres e validar existência dos schemas ml_*"
  - "[ ] Validar estrutura das tabelas críticas em ml_captura e ml_platform"
  - "[ ] Testar endpoint de webhook (POST /webhook/ml/captura/debug) com payload mínimo"
  - "[ ] Verificar conectividade Redis e testar operações básicas (SET/GET com prefixo)"
  - "[ ] Validar conectividade entre squads ativos (cross-squad queries)"
  - "[ ] Verificar status dos workflows n8n vinculados ao pipeline"
  - "[ ] Gerar relatório consolidado com status por componente e recomendações"
---

# validate-pipeline

Valida a integridade completa do pipeline ML após deploy ou mudança de configuração, verificando schemas, webhooks, filas Redis e conectividade entre squads.

## Pré-condições

- Infraestrutura provisionada (`setup-infrastructure` executado com sucesso)
- Credenciais de acesso a Postgres e Redis disponíveis
- Ambiente alvo acessível (Railway staging ou produção)
- Lista de squads ativos do cliente disponível em `ml_platform.infra_registry`

## Passos

1. Verificar conectividade com Postgres: testar conexão e listar schemas `ml_*` presentes no banco
2. Validar estrutura das tabelas críticas: verificar colunas, constraints e índices em `ml_captura.mensagens`, `ml_platform.numeros_projeto` e `ml_platform.infra_registry`
3. Testar endpoint de webhook com payload mínimo via POST `/webhook/ml/captura/debug` e validar resposta HTTP 200 e corpo esperado
4. Verificar conectividade Redis: testar operações SET/GET com o prefixo `ml:{cliente_id}:` e validar TTL de chaves de sessão
5. Validar conectividade cross-squad: executar queries que cruzam `ml_captura` com schemas dos squads ativos e verificar permissões corretas
6. Verificar status dos workflows n8n: checar se os workflows do pipeline estão ativos e sem erros de execução recentes
7. Gerar relatório consolidado com status HEALTHY/DEGRADED/DOWN por componente, lista de falhas e recomendações de ação

## Outputs

- `status_pipeline`: Status geral do pipeline (HEALTHY / DEGRADED / DOWN)
- `relatorio_validacao`: Relatório detalhado por componente (schemas, webhooks, filas, conectividade)
- `falhas_detectadas`: Lista de falhas encontradas com componente, severidade e mensagem
- `recomendacoes`: Lista de ações corretivas para falhas críticas

## Critérios de sucesso

- Status geral HEALTHY com todos os componentes verificados
- Nenhuma falha crítica sem recomendação de ação
- Endpoint de webhook respondendo com HTTP 200 ao payload de teste
- Conectividade cross-squad validada para todos os squads ativos
