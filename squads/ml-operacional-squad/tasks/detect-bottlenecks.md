---
id: detect-bottlenecks
name: Detect Operational Bottlenecks
task: Detect Operational Bottlenecks
squad: ml-operacional-squad
agent: failure-detector
icon: "🔧"
atomic_layer: task
elicit: false
responsavel: failure-detector
responsavel_type: agent
Entrada: |
  - mapa_processos: Processos operacionais mapeados em map-process.md com etapas e responsáveis
  - historico_incidentes: Histórico de reclamações, retrabalho e incidentes operacionais
  - conversas_analisadas: Conversas com menção a problemas operacionais classificadas
Saida: |
  - gargalos_detectados: Lista priorizada de gargalos com etapa, score de impacto e evidências
  - score_impacto: Score calculado (frequência × gravidade) para cada gargalo
  - frequencia_falha: Frequência de ocorrência por gargalo (por semana/mês)
  - etapas_criticas: Etapas do processo com maior concentração de falhas
Checklist:
  - "[ ] Analisar fluxos operacionais do map-process.md (etapas, responsáveis, handoffs)"
  - "[ ] Identificar etapas com maior frequência de reclamação ou retrabalho"
  - "[ ] Calcular tempo médio de execução por etapa vs tempo esperado (SLA)"
  - "[ ] Detectar padrões de falha recorrente (dia, horário, equipe, tipo de erro)"
  - "[ ] Verificar correlação entre falhas operacionais e reclamações de clientes"
  - "[ ] Calcular score de impacto por gargalo (frequência × gravidade)"
  - "[ ] Persistir gargalos em ml_operacional.gargalos com score, frequência e evidências"
---

# detect-bottlenecks

Detectar gargalos e padrões de falha operacional nos processos mapeados, priorizando por score de impacto calculado como frequência × gravidade.

## Pré-condições

- Processos operacionais mapeados em map-process.md com etapas e responsáveis definidos
- Histórico de reclamações, retrabalho e incidentes operacionais disponível
- Conversas com menção a problemas operacionais analisadas e classificadas
- Schema `ml_operacional.gargalos` criado e acessível

## Passos

1. Analisar fluxos operacionais do map-process.md: identificar todas as etapas, responsáveis e handoffs
2. Identificar etapas com maior frequência de reclamação ou retrabalho nas conversas e dados históricos
3. Calcular tempo médio de execução de cada etapa e comparar com tempo esperado (SLA interno)
4. Detectar padrões de falha recorrente: mesma etapa com falha em dias/horários similares, mesma equipe, mesmo tipo de erro
5. Verificar correlação entre falhas operacionais e reclamações de clientes (impacto externo)
6. Calcular score de impacto por gargalo: frequência de ocorrência × gravidade (impacto no cliente / retrabalho gerado)
7. Priorizar gargalos por score de impacto: listar do mais crítico ao menos crítico
8. Persistir gargalos detectados em `ml_operacional.gargalos` com etapa, score, frequência e evidências

## Outputs

- `gargalos_detectados`: Lista priorizada de gargalos com etapa, score de impacto e evidências
- `score_impacto`: Score calculado (frequência × gravidade) para cada gargalo
- `frequencia_falha`: Frequência de ocorrência por gargalo (por semana/mês)
- `etapas_criticas`: Etapas do processo com maior concentração de falhas

## Critérios de sucesso

- >= 3 gargalos identificados com score de impacto calculado e evidências documentadas
- Padrões temporais identificados (horário/dia/equipe) para >= 50% dos gargalos
- Correlação com reclamações de clientes calculada e incluída no score
