---
id: analyze-cashflow
name: Analyze Cash Flow Patterns and Forecast
squad: ml-financeiro-squad
agent: cashflow-predictor
icon: "💰"
---

# analyze-cashflow

Analisar padrões históricos de pagamento e gerar previsão de fluxo de caixa para as próximas 8 semanas, identificando semanas de risco com antecedência.

## Pré-condições

- Histórico de pagamentos dos últimos 90 dias disponível em `ml_financeiro.historico_pagamentos`
- Carteira de clientes ativos com faturas em aberto mapeada
- Schema `ml_financeiro.previsoes_cashflow` criado e acessível
- Thresholds de semana de risco configurados (valor mínimo de caixa esperado)

## Passos

1. Carregar histórico de pagamentos dos últimos 90 dias: valor, data de vencimento, data de pagamento real, cliente
2. Identificar sazonalidade: padrões de pagamento por dia da semana, semana do mês e mês do ano
3. Identificar padrões por tipo de cliente: paga no vencimento / atrasa X dias em média / paga adiantado
4. Calcular probabilidade de recebimento por fatura em aberto: baseada no perfil histórico de cada cliente
5. Agregar previsão semanal das próximas 8 semanas: valor esperado + intervalo de confiança (pessimista/realista/otimista)
6. Identificar semanas de risco: semanas com previsão realista abaixo do threshold mínimo de caixa
7. Gerar recomendações de ação para semanas críticas: antecipação de cobranças, negociação de prazo, etc.
8. Persistir previsão em `ml_financeiro.previsoes_cashflow` com data de geração e premissas

## Outputs

- `previsao_fluxo`: Previsão semanal para as próximas 8 semanas com 3 cenários
- `semanas_risco`: Lista de semanas com previsão abaixo do threshold com severidade
- `probabilidade_recebimento_por_cliente`: Score de probabilidade de pagamento por fatura em aberto
- `recomendacoes`: Ações recomendadas para semanas críticas com prazo e responsável

## Critérios de sucesso

- Previsão com intervalo de confiança calculado para cada semana
- Semanas de risco identificadas com antecedência >= 2 semanas
- Probabilidade de recebimento calculada com base em histórico real do cliente
