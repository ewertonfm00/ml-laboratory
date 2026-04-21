---
id: generate-forecast
name: Generate Consolidated Financial Forecast
squad: ml-financeiro-squad
agent: cashflow-predictor
icon: "📉"
---

# generate-forecast

Gerar relatório de previsão financeira consolidado para gestão com cenários otimista, realista e pessimista, principais riscos identificados e recomendações de provisão.

## Pré-condições

- Previsões individuais de clientes geradas pelo analyze-cashflow no período
- Scores de risco do detect-financial-risk disponíveis para ajuste dos cenários
- Histórico de sazonalidade dos últimos 12 meses disponível
- Schema `ml_financeiro.relatorios_previsao` criado e acessível

## Passos

1. Agregar previsões individuais de recebimento por cliente para o período consolidado
2. Aplicar fatores sazonais identificados no histórico dos últimos 12 meses (ajuste por mês/trimestre)
3. Aplicar fatores de risco do risk-analyzer: reduzir probabilidade de recebimento para clientes com score alto/crítico
4. Calcular 3 cenários consolidados: otimista (todos pagam no vencimento + sazonalidade positiva) / realista (probabilidades calculadas) / pessimista (clientes de risco não pagam)
5. Identificar principais riscos: concentração de receivables em clientes de alto risco, semanas com gap crítico, sazonalidade negativa esperada
6. Identificar oportunidades: semanas com folga de caixa para antecipação de investimentos
7. Gerar recomendações de gestão: provisão para devedores duvidosos, necessidade de capital de giro, ações de cobrança prioritárias
8. Formatar relatório executivo e persistir em `ml_financeiro.relatorios_previsao`

## Outputs

- `previsao_consolidada`: Previsão de caixa consolidada com valores por semana/mês
- `cenarios`: Objeto com valores para os 3 cenários (otimista/realista/pessimista) com premissas
- `principais_riscos`: Lista dos riscos financeiros mais relevantes do período
- `recomendacoes_gestao`: Ações recomendadas com impacto estimado e prazo de implementação

## Critérios de sucesso

- 3 cenários definidos com premissas explícitas e documentadas
- Recomendações acionáveis com responsável e prazo definidos
- Consolidado cobre >= 90% do receivables total do período
