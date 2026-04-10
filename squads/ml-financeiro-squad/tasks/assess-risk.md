---
task: Avaliar Risco Financeiro de Cliente
agent: risk-analyzer
squad: ml-financeiro-squad
atomic_layer: task
elicit: false
Entrada: |
  - conversa_raw: Conversa sobre pagamentos ou financeiro
  - historico_pagamentos: Histórico do cliente
  - cliente_id: Identificador do cliente
Saida: |
  - nivel_risco: baixo | médio | alto | crítico
  - sinais_detectados: Lista de sinais de risco
  - probabilidade_inadimplencia: Score 0-100
  - acoes_recomendadas: Próximos passos
Checklist:
  - "[ ] Identificar menções a dificuldade de pagamento na conversa"
  - "[ ] Verificar histórico de atrasos no banco"
  - "[ ] Detectar padrão de comportamento (pagador pontual, eventual, atrasado)"
  - "[ ] Calcular probabilidade de inadimplência"
  - "[ ] Classificar nível de risco"
  - "[ ] Gerar recomendações de ação"
  - "[ ] Persistir análise em ml_financeiro.analises_risco"
---

# assess-risk

Avalia o risco financeiro de um cliente combinando sinais da conversa com histórico de pagamentos para antecipar inadimplência.

## Processo

1. Extrair sinais de risco da conversa (menções a dificuldade, atraso, renegociação)
2. Cruzar com histórico de pagamentos do banco
3. Calcular score de probabilidade de inadimplência (0-100)
4. Classificar nível de risco
5. Gerar recomendações de ação imediata
6. Persistir no banco

## Output Schema

```json
{
  "cliente_id": "string",
  "nivel_risco": "baixo|medio|alto|critico",
  "sinais_detectados": [],
  "probabilidade_inadimplencia": 0,
  "acoes_recomendadas": [],
  "analisado_em": "ISO8601"
}
```
