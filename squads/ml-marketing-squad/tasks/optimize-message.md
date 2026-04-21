---
id: optimize-message
name: Optimize Marketing Message
task: Optimize Marketing Message
squad: ml-marketing-squad
agent: message-analyzer
icon: "✉️"
atomic_layer: task
elicit: false
responsavel: message-analyzer
responsavel_type: agent
Entrada: |
  - historico_mensagens: Histórico de mensagens enviadas ao segmento com métricas de engajamento
  - mensagem_atual: Mensagem atual ou briefing da mensagem a otimizar
  - segmento_alvo: Segmento-alvo com características comportamentais definidas
Saida: |
  - mensagem_otimizada: Variação principal recomendada com justificativa baseada em dados
  - variacoes_alternativas: As 3 variações geradas para teste A/B
  - elementos_eficazes: Lista de elementos identificados como correlacionados com engajamento
  - engajamento_estimado: Score de engajamento estimado para cada variação (baseline e delta esperado)
Checklist:
  - "[ ] Analisar variações de mensagens enviadas anteriormente para o segmento"
  - "[ ] Identificar elementos que correlacionam positivamente com engajamento"
  - "[ ] Categorizar elementos eficazes (tom, estrutura, CTA, horário)"
  - "[ ] Aplicar elementos identificados à mensagem atual"
  - "[ ] Gerar 3 variações distintas (variação A: tom, B: estrutura, C: CTA)"
  - "[ ] Calcular score de engajamento esperado por variação"
  - "[ ] Persistir mensagens em ml_marketing.mensagens_otimizadas com scores"
---

# optimize-message

Otimizar mensagem de marketing para um segmento específico com base nos padrões de engajamento históricos, gerando 3 variações e recomendando a principal com justificativa.

## Pré-condições

- Histórico de mensagens enviadas para o segmento com métricas de engajamento (abertura, resposta, conversão)
- Mensagem atual ou briefing da mensagem a otimizar fornecido como entrada
- Segmento-alvo definido com características comportamentais
- Schema `ml_marketing.mensagens_otimizadas` criado e acessível

## Passos

1. Analisar variações de mensagens enviadas anteriormente para o segmento no histórico
2. Identificar elementos que correlacionam positivamente com engajamento: abertura de mensagem, taxa de resposta, clique em link, conversão
3. Categorizar elementos eficazes: tom (formal/informal/urgente), estrutura (curta/detalhada), CTA (pergunta/ação direta), horário de envio
4. Aplicar elementos identificados à mensagem atual: reescrever mantendo o conteúdo mas ajustando os elementos de alto impacto
5. Gerar 3 variações distintas: variação A (tom diferente), variação B (estrutura diferente), variação C (CTA diferente)
6. Calcular score de engajamento esperado para cada variação baseado nos padrões históricos do segmento
7. Recomendar variação principal com justificativa baseada nos dados
8. Persistir mensagens otimizadas em `ml_marketing.mensagens_otimizadas` com segmento, variações e scores

## Outputs

- `mensagem_otimizada`: Variação principal recomendada com justificativa baseada em dados
- `variacoes_alternativas`: As 3 variações geradas para teste A/B
- `elementos_eficazes`: Lista de elementos identificados como correlacionados com engajamento no segmento
- `engajamento_estimado`: Score de engajamento estimado para cada variação (baseline e delta esperado)

## Critérios de sucesso

- Mensagem otimizada com score de engajamento estimado >= 20% acima da baseline histórica do segmento
- 3 variações distintas geradas com elementos diferenciados
- Justificativa baseada em dados reais do histórico, não em suposições
