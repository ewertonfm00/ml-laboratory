---
task: Analisar Satisfação de Atendimento
agent: satisfaction-analyzer
squad: ml-atendimento-squad
atomic_layer: task
elicit: false
responsavel: satisfaction-analyzer
responsavel_type: agent
Entrada: |
  - conversa_raw: Conversa de atendimento transcrita
  - cliente_id: Identificador do cliente
  - canal: WhatsApp | email | telefone | chat
Saida: |
  - tom_emocional: satisfeito | neutro | frustrado | furioso
  - causas_insatisfacao: Lista de causas identificadas
  - risco_churn: baixo | médio | alto
  - nps_comportamental: Score -100 a 100
  - momento_critico: true | false
Checklist:
  - "[ ] Classificar tom emocional predominante da conversa"
  - "[ ] Identificar causas explícitas de insatisfação"
  - "[ ] Detectar sinais implícitos (linguagem passivo-agressiva, abandono, etc.)"
  - "[ ] Calcular NPS comportamental"
  - "[ ] Avaliar risco de churn"
  - "[ ] Marcar se é momento crítico de decisão"
  - "[ ] Persistir análise em ml_atendimento.analises_satisfacao"
---

# analyze-satisfaction

Analisa uma conversa de atendimento para extrair o estado emocional real do cliente e avaliar o risco para o relacionamento.

## Processo

1. Ler a conversa e identificar o estado emocional predominante
2. Extrair causas explícitas e implícitas de insatisfação
3. Cruzar com histórico de interações do cliente
4. Calcular NPS comportamental
5. Classificar risco de churn
6. Determinar se é momento crítico
7. Persistir no banco

## Output Schema

```json
{
  "conversa_id": "string",
  "cliente_id": "string",
  "tom_emocional": "satisfeito|neutro|frustrado|furioso",
  "causas_insatisfacao": [],
  "risco_churn": "baixo|medio|alto",
  "nps_comportamental": 0,
  "momento_critico": false,
  "analisado_em": "ISO8601"
}
```
