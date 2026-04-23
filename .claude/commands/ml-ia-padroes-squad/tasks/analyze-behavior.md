---
id: analyze-behavior
name: Analyze Behavioral Model by Vendor
task: Analyze Behavioral Model by Vendor
squad: ml-ia-padroes-squad
agent: behavior-analyst
icon: "🧠"
atomic_layer: task
elicit: false
responsavel: behavior-analyst
responsavel_type: agent
Entrada: |
  - padroes_extraidos: Padrões do período disponíveis em ml_padroes.padroes_extraidos
  - vendedor_id: Identificador do vendedor a ser analisado
  - periodo: Data início e fim do período de análise (mínimo 10 conversas)
Saida: |
  - modelo_comportamental: Objeto com perfil comportamental completo do vendedor
  - pontos_fortes: Lista de comportamentos com correlação positiva com conversão
  - gaps_identificados: Lista de comportamentos ausentes ou com correlação negativa
  - estilo_dominante: Estilo de venda predominante do vendedor
  - score_consistencia: Score de repetição comportamental (0.0 a 1.0)
Checklist:
  - "[ ] Carregar padrões do período agrupados por vendedor e produto"
  - "[ ] Calcular frequência de cada padrão nas conversas do vendedor"
  - "[ ] Identificar comportamentos consistentes (presentes em >= 70% das conversas)"
  - "[ ] Classificar cada comportamento como ponto forte ou gap"
  - "[ ] Determinar estilo de venda dominante (varejo/consultiva/despertar_desejo)"
  - "[ ] Gerar score de consistência comportamental (0.0 a 1.0)"
  - "[ ] Persistir modelo em ml_padroes.modelos_comportamentais com todos os campos"
---

# analyze-behavior

Analisar padrões extraídos para construir modelo comportamental agregado por vendedor, identificando pontos fortes, gaps e estilo dominante com score de consistência.

## Pré-condições

- Padrões do período disponíveis em `ml_padroes.padroes_extraidos` (extract-patterns executado)
- Identificação dos vendedores nas conversas analisadas
- Schema `ml_padroes.modelos_comportamentais` criado
- Mínimo de 10 conversas por vendedor no período

## Passos

1. Carregar padrões do período do pattern-extractor agrupados por vendedor e produto
2. Agrupar padrões por vendedor: calcular frequência de cada padrão nas conversas do vendedor
3. Identificar comportamentos consistentes: padrões que aparecem em >= 70% das conversas do vendedor
4. Classificar cada comportamento consistente como ponto forte (correlação positiva com conversão) ou gap (correlação negativa)
5. Determinar estilo de venda dominante do vendedor: varejo / consultiva / despertar_desejo
6. Gerar score de consistência comportamental (0.0 a 1.0): quanto o vendedor repete seus comportamentos
7. Persistir modelo comportamental em `ml_padroes.modelos_comportamentais` com vendedor, período e todos os campos

## Outputs

- `modelo_comportamental`: Objeto com perfil comportamental completo do vendedor
- `pontos_fortes`: Lista de comportamentos com correlação positiva com conversão
- `gaps_identificados`: Lista de comportamentos ausentes ou com correlação negativa
- `estilo_dominante`: Estilo de venda predominante do vendedor
- `score_consistencia`: Score de repetição comportamental (0.0 a 1.0)

## Critérios de sucesso

- Modelo cobre >= 80% das interações do vendedor no período
- Score de consistência calculado com base em mínimo 10 conversas
- Pelo menos 1 ponto forte e 1 gap identificados por vendedor
