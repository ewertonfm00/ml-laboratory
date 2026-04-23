---
id: detect-churn-signals
name: Detect Churn Risk Signals
task: Detect Churn Risk Signals
squad: ml-atendimento-squad
agent: churn-detector
icon: "⚠️"
atomic_layer: task
elicit: false
responsavel: churn-detector
responsavel_type: agent
Entrada: |
  - historico_interacoes: Histórico de interações dos clientes ativos (mínimo 30 dias)
  - modelo_config: Configuração do modelo de churn score em ml_atendimento.churn_model_config
  - cliente_id: Identificador do cliente a ser avaliado (ou lista de clientes ativos)
Saida: |
  - lista_clientes_risco: Lista de clientes em risco ordenada por churn score descendente
  - churn_scores: Score calculado por cliente com justificativa
  - nivel_urgencia_por_cliente: Classificação de urgência de intervenção (imediata/próxima semana/monitorar)
  - sinais_detectados_por_cliente: Sinais específicos que contribuíram para o score de cada cliente
Checklist:
  - "[ ] Calcular churn score para todos os clientes ativos usando histórico de interações"
  - "[ ] Filtrar clientes com score >= 70 (alto risco)"
  - "[ ] Analisar sinais específicos de cada cliente em risco"
  - "[ ] Classificar urgência de intervenção por cliente (imediata/próxima semana/monitorar)"
  - "[ ] Encaminhar lista priorizada para retention-advisor com detalhes dos sinais"
  - "[ ] Registrar scores e sinais em ml_atendimento.churn_scores com timestamp"
  - "[ ] Validar taxa de falsos positivos < 20%"
---

# detect-churn-signals

Identificar e pontuar clientes com sinais de risco de churn no período, priorizando intervenções por urgência e encaminhando lista para o retention-advisor.

## Pré-condições

- Histórico de interações dos clientes ativos disponível (mínimo 30 dias)
- Modelo de churn score configurado em `ml_atendimento.churn_model_config`
- Schema `ml_atendimento.churn_scores` criado e acessível
- retention-advisor disponível para receber lista de clientes em risco

## Passos

1. Calcular churn score para todos os clientes ativos usando histórico de interações (frequência, sentimento, reclamações, silêncio prolongado)
2. Filtrar clientes com score >= 70 (classificados como alto risco)
3. Analisar sinais específicos de cada cliente em risco: queda de engajamento, reclamações recentes, menção a concorrentes, mudança de tom
4. Classificar urgência de intervenção por cliente: imediata (score >= 90), próxima semana (70-89), monitorar (50-69)
5. Encaminhar lista priorizada por urgência para retention-advisor com detalhes dos sinais detectados
6. Registrar scores e sinais em `ml_atendimento.churn_scores` com timestamp e status da intervenção

## Outputs

- `lista_clientes_risco`: Lista de clientes em risco ordenada por churn score descendente
- `churn_scores`: Score calculado por cliente com justificativa
- `nivel_urgencia_por_cliente`: Classificação de urgência de intervenção (imediata/próxima semana/monitorar)
- `sinais_detectados_por_cliente`: Sinais específicos que contribuíram para o score de cada cliente

## Critérios de sucesso

- Score calculado para 100% dos clientes ativos no período
- Falsos positivos < 20%: clientes classificados como risco que não sinalizaram intenção de saída
- Lista entregue ao retention-advisor com antecedência >= 1 semana para casos de urgência normal
