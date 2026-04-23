---
task: Analisar Conversa Comercial
agent: conversation-analyst
squad: ml-comercial-squad
atomic_layer: task
elicit: false
responsavel: conversation-analyst
responsavel_type: agent
Entrada: |
  - conversa_raw: Texto transcrito da conversa
  - vendedor_id: ID do vendedor
  - produto: Produto discutido
  - tipo_venda: varejo | consultiva | despertar_desejo
Saida: |
  - analise_estruturada: JSON com fases, argumentos, tom e resultado
  - padrao_detectado: Padrão comportamental identificado
  - score_qualidade: Pontuação 0-10
  - flags: Alertas identificados
Checklist:
  - "[ ] Identificar fases da conversa (abordagem, apresentação, objeção, fechamento)"
  - "[ ] Classificar tom predominante (técnico, emocional, relacional, direto)"
  - "[ ] Extrair argumentos usados e mapear efetividade"
  - "[ ] Identificar objeções e como foram tratadas"
  - "[ ] Registrar resultado (converteu, perdeu, pendente)"
  - "[ ] Calcular score de qualidade"
  - "[ ] Gerar flags de alerta se aplicável"
  - "[ ] Persistir análise no Postgres ml_comercial.conversas"
---

# analyze-conversation

Analisa uma conversa comercial transcrita e extrai insights estruturados para alimentar o laboratório de inteligência.

## Processo

1. Receber conversa transcrita (texto plano ou JSON do n8n)
2. Segmentar em fases (abertura, descoberta, apresentação, objeção, fechamento)
3. Classificar cada fase por qualidade e técnica usada
4. Extrair argumentos e mapear resultado de cada um
5. Identificar objeções e classificar resposta do vendedor
6. Calcular score geral (0-10)
7. Persistir no banco com metadados completos

## Output Schema

```json
{
  "conversa_id": "uuid",
  "vendedor_id": "string",
  "produto": "string",
  "tipo_venda": "varejo|consultiva|despertar_desejo",
  "resultado": "converteu|perdeu|pendente",
  "score_qualidade": 0.0,
  "fases": [],
  "argumentos": [],
  "objecoes": [],
  "tom_predominante": "string",
  "flags": [],
  "analisado_em": "ISO8601"
}
```
