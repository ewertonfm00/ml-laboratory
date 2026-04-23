---
id: extract-patterns
name: Extract Behavioral Patterns from Conversations
task: Extract Behavioral Patterns from Conversations
squad: ml-ia-padroes-squad
agent: pattern-extractor
icon: "🔍"
atomic_layer: task
elicit: false
responsavel: pattern-extractor
responsavel_type: agent
Entrada: |
  - conversas_classificadas: Conversas com status classificado de ml_captura.classificacoes
  - periodo: Data início e fim do período de análise (mínimo 20 conversas por tipo_venda)
  - resultado_conversa: Resultado registrado por conversa (converteu/perdeu/em andamento)
Saida: |
  - padroes_extraidos: Lista de padrões com texto, frequência e correlação com conversão
  - periodo_analisado: Data início e fim do período analisado
  - total_conversas: Total de conversas processadas por tipo_venda
Checklist:
  - "[ ] Selecionar conversas do período com status classificado (mínimo 20 por tipo_venda)"
  - "[ ] Agrupar conversas por tipo_venda e por resultado (converteu/perdeu)"
  - "[ ] Identificar sequências recorrentes de abertura"
  - "[ ] Identificar sequências de argumentação no corpo da conversa"
  - "[ ] Identificar sequências de fechamento e técnicas de conversão"
  - "[ ] Calcular frequência e correlação de cada padrão com resultado"
  - "[ ] Persistir padrões em ml_padroes.padroes_extraidos (frequência >= 3 ocorrências)"
---

# extract-patterns

Extrair padrões comportamentais recorrentes das conversas classificadas para um período, agrupando por tipo de venda e resultado para identificar o que funciona e o que não funciona.

## Pré-condições

- Mínimo de 20 conversas classificadas por tipo_venda no período analisado
- Conversas com resultado registrado (converteu/perdeu/em andamento)
- Schema `ml_padroes.padroes_extraidos` criado e acessível
- Período de análise definido (data_inicio e data_fim)

## Passos

1. Selecionar conversas do período com status `classificado` de ml_captura.classificacoes (mínimo 20 por tipo_venda)
2. Agrupar conversas por tipo_venda e por resultado (converteu / perdeu)
3. Identificar sequências recorrentes de abertura: como o atendente inicia a conversa
4. Identificar sequências de argumentação: argumentos e gatilhos usados no corpo da conversa
5. Identificar sequências de fechamento: técnicas de encerramento e conversão usadas
6. Calcular frequência de cada padrão e correlação com resultado (converteu vs perdeu)
7. Filtrar padrões com ocorrência >= 3 vezes no período para eliminar ruído
8. Persistir padrões em `ml_padroes.padroes_extraidos` com metadados: frequência, correlação, tipo_venda, período

## Outputs

- `padroes_extraidos`: Lista de padrões com texto, frequência e correlação com conversão
- `periodo_analisado`: Data início e fim do período analisado
- `total_conversas`: Total de conversas processadas por tipo_venda

## Critérios de sucesso

- Mínimo 5 padrões distintos identificados por tipo de venda
- Padrões com frequência e correlação calculados e persistidos
- Separação clara entre padrões de conversas convertidas e perdidas
