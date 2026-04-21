---
id: detect-financial-risk
name: Detect Financial Risk Signals
task: Detect Financial Risk Signals
squad: ml-financeiro-squad
agent: risk-analyzer
icon: "🚨"
atomic_layer: task
elicit: false
responsavel: risk-analyzer
responsavel_type: agent
Entrada: |
  - conversas_analisadas: Conversas com menções a pagamento, cobrança e negociação extraídas
  - historico_pagamentos: Histórico de pagamentos dos clientes em ml_financeiro.historico_pagamentos
  - cliente_id: Identificador do cliente (ou lista de clientes a avaliar)
Saida: |
  - scores_risco: Score de risco financeiro calculado por cliente (0-100)
  - clientes_alto_risco: Lista de clientes com classificação alto ou crítico
  - sinais_detectados: Sinais específicos que contribuíram para o score de cada cliente
  - tempo_estimado_inadimplencia: Estimativa de semanas até possível inadimplência por cliente
Checklist:
  - "[ ] Analisar conversas com menção a termos financeiros (pagamento, cobrança, atraso, etc.)"
  - "[ ] Identificar padrões linguísticos de dificuldade financeira"
  - "[ ] Cruzar sinais de conversas com histórico de pagamentos"
  - "[ ] Calcular score de risco por cliente (40% histórico + 40% conversas + 20% tendência)"
  - "[ ] Classificar risco (baixo/médio/alto/crítico)"
  - "[ ] Gerar lista de clientes para ação preventiva com sinais e tempo estimado"
  - "[ ] Encaminhar casos críticos (>= 80) para collections-advisor e persistir scores"
---

# detect-financial-risk

Detectar sinais de risco financeiro em conversas e dados históricos para antecipar inadimplência e acionar ação preventiva com antecedência mínima de 2 semanas.

## Pré-condições

- Conversas analisadas com extração de menções a pagamento, cobrança e negociação
- Histórico de pagamentos dos clientes disponível em ml_financeiro.historico_pagamentos
- Schema `ml_financeiro.scores_risco` criado e acessível
- collections-advisor disponível para receber casos críticos

## Passos

1. Analisar conversas com menção a termos financeiros: pagamento, cobrança, parcela, atraso, negociação, dificuldade
2. Identificar padrões linguísticos de dificuldade financeira: evasão de assunto, promessas vagas, pedidos de prazo recorrentes
3. Cruzar sinais de conversas com histórico de pagamentos: cliente que começou a atrasar + sinaliza dificuldade verbalmente
4. Calcular score de risco por cliente (0-100): 40% histórico de pagamentos + 40% sinais em conversas + 20% tendência recente
5. Classificar risco: baixo (0-39) / médio (40-59) / alto (60-79) / crítico (80-100)
6. Gerar lista de clientes para ação preventiva (alto + crítico) com sinais detectados e tempo estimado até inadimplência
7. Encaminhar casos críticos (score >= 80) para collections-advisor com urgência imediata
8. Persistir scores em `ml_financeiro.scores_risco` com timestamp, sinais e classificação

## Outputs

- `scores_risco`: Score de risco financeiro calculado por cliente
- `clientes_alto_risco`: Lista de clientes com classificação alto ou crítico
- `sinais_detectados`: Sinais específicos que contribuíram para o score de cada cliente
- `tempo_estimado_inadimplencia`: Estimativa de semanas até possível inadimplência por cliente

## Critérios de sucesso

- Clientes de alto risco identificados com >= 2 semanas de antecedência
- Score calculado cruzando dados de conversas E histórico financeiro
- Casos críticos encaminhados para collections-advisor em < 30 minutos após detecção
