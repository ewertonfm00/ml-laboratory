---
task: Analisar Resultado de Campanha de Marketing
agent: message-analyzer
squad: ml-marketing-squad
atomic_layer: task
elicit: false
responsavel: message-analyzer
responsavel_type: agent
Entrada: |
  - mensagens_enviadas: Lote de mensagens da campanha
  - respostas_clientes: Conversas geradas após o envio
  - campanha_id: Identificador da campanha
Saida: |
  - taxa_resposta: % de clientes que responderam
  - sentimento_respostas: Distribuição de sentimento
  - elementos_efetivos: O que funcionou na mensagem
  - elementos_rejeitados: O que causou rejeição
  - score_campanha: Pontuação geral 0-10
Checklist:
  - "[ ] Cruzar mensagens enviadas com respostas recebidas"
  - "[ ] Calcular taxa de resposta geral"
  - "[ ] Classificar sentimento de cada resposta"
  - "[ ] Identificar elementos da mensagem com maior engajamento"
  - "[ ] Identificar elementos que causaram rejeição ou silêncio"
  - "[ ] Calcular score geral da campanha"
  - "[ ] Extrair aprendizados para próximas campanhas"
  - "[ ] Persistir análise em ml_marketing.analises_campanha"
---

# analyze-campaign

Analisa o resultado real de uma campanha de marketing medindo engajamento, sentimento e efetividade das mensagens.

## Processo

1. Cruzar lista de envios com respostas no período pós-envio
2. Classificar cada resposta por sentimento
3. Identificar padrões de linguagem que geraram mais respostas
4. Comparar com campanhas anteriores
5. Extrair aprendizados acionáveis
6. Persistir no banco

## Output Schema

```json
{
  "campanha_id": "string",
  "total_enviados": 0,
  "total_responderam": 0,
  "taxa_resposta": 0.0,
  "sentimento_positivo_pct": 0.0,
  "sentimento_neutro_pct": 0.0,
  "sentimento_negativo_pct": 0.0,
  "elementos_efetivos": [],
  "elementos_rejeitados": [],
  "score_campanha": 0.0,
  "aprendizados": [],
  "analisado_em": "ISO8601"
}
```
