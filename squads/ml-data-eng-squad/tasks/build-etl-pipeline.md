---
id: build-etl-pipeline
name: Build ETL Pipeline n8n
task: Build ETL Pipeline n8n
squad: ml-data-eng-squad
agent: etl-engineer
icon: "🔄"
atomic_layer: task
elicit: false
responsavel: etl-engineer
responsavel_type: agent
Entrada: |
  - schema_origem: Schema de origem (ml_captura.*) com tabelas e campos mapeados
  - schema_destino: Schema destino do squad operacional definido e criado
  - regras_transformacao: Regras de transformação documentadas para cada campo
  - trigger_ativacao: Trigger definido (schedule ou evento por inserção)
Saida: |
  - workflow_n8n_id: ID do workflow criado/atualizado no n8n
  - pipeline_config: Configuração resumida com mapeamentos, frequência e modo de trigger
  - registros_processados: Número de registros processados no último ciclo de teste
Checklist:
  - "[ ] Mapear campos da tabela de origem para o schema destino"
  - "[ ] Definir transformações necessárias (normalização, enriquecimento, agregação, conversão)"
  - "[ ] Criar workflow n8n (Trigger → Extract → Transform → Load)"
  - "[ ] Configurar tratamento de erros (try/catch, dead-letter queue no Redis)"
  - "[ ] Configurar retry automático (3 tentativas com backoff exponencial)"
  - "[ ] Testar pipeline com amostra de dados reais e validar integridade"
  - "[ ] Ativar workflow com schedule ou trigger por evento de inserção"
---

# build-etl-pipeline

Construir ou atualizar pipeline ETL no n8n para transformar dados brutos de `ml_captura.*` em dados estruturados no schema destino do squad operacional.

## Pré-condições

- Schema de origem (`ml_captura.*`) e destino definidos e criados
- n8n acessível com credenciais de Postgres configuradas
- Regras de transformação documentadas para cada campo
- Trigger de ativação definido: schedule ou evento por inserção

## Passos

1. Mapear campos da tabela de origem (ml_captura.*) para o schema destino do squad operacional
2. Definir transformações necessárias: normalização, enriquecimento, agregação e conversão de tipos
3. Criar workflow n8n com nodes: Trigger → Extract (Postgres query) → Transform (Function node) → Load (Postgres insert/upsert)
4. Configurar tratamento de erros: try/catch nos Function nodes, dead-letter queue no Redis para registros com falha
5. Configurar retry automático (3 tentativas com backoff exponencial) para falhas transitórias
6. Testar pipeline com amostra de dados reais e validar integridade dos dados no destino
7. Ativar workflow com schedule configurado ou trigger por evento de inserção na tabela de origem

## Outputs

- `workflow_n8n_id`: ID do workflow criado/atualizado no n8n
- `pipeline_config`: Configuração resumida com mapeamentos, frequência e modo de trigger
- `registros_processados`: Número de registros processados no último ciclo de teste

## Critérios de sucesso

- Pipeline processa sem erros em dados reais
- Dados chegam no schema destino com integridade referencial mantida
- Falhas isoladas não interrompem o processamento do batch completo
- Latência de processamento dentro do SLA definido para o squad
