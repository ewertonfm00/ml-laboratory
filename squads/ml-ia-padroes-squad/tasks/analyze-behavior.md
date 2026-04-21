---
id: analyze-behavior
name: Analyze Behavioral Model by Vendor
squad: ml-ia-padroes-squad
agent: behavior-analyst
icon: "🧠"
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
