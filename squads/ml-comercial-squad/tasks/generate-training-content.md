---
id: generate-training-content
name: Generate Personalized Training Content
squad: ml-comercial-squad
agent: training-generator
icon: "📚"
---

# generate-training-content

Gerar conteúdo de treinamento personalizado para um vendedor específico com base nos gaps identificados, usando exemplos reais das próprias conversas do vendedor como referência.

## Pré-condições

- Gaps do vendedor identificados pelo knowledge-gap-detector e behavioral-profiler
- Conversas reais do vendedor disponíveis para extração de exemplos
- vendedor_id e lista de gaps prioritários definidos como entrada
- Schema `ml_comercial.conteudos_treinamento` criado e acessível

## Passos

1. Carregar gaps priorizados do vendedor: knowledge-gap-detector (gaps de conhecimento técnico) + behavioral-profiler (gaps comportamentais)
2. Priorizar gaps por impacto na conversão: calcular qual gap, se resolvido, tem maior potencial de melhora
3. Selecionar conversas reais de sucesso do dataset como exemplos positivos para os gaps prioritários
4. Selecionar conversas reais do próprio vendedor que ilustram o gap (exemplos negativos para reflexão)
5. Gerar módulo de treinamento para cada gap: contexto do gap → exemplo negativo real → exemplo positivo real → instrução prática → exercício de fixação
6. Formatar conteúdo em linguagem prática e direta, sem jargão acadêmico, com o nome do vendedor
7. Personalizar com referências a situações reais que o próprio vendedor viveu
8. Persistir módulos em `ml_comercial.conteudos_treinamento` com vendedor_id, gaps abordados e tempo estimado de leitura

## Outputs

- `modulos_treinamento`: Lista de módulos gerados com título, conteúdo e exercício
- `gap_abordado`: Gap principal resolvido por cada módulo
- `exemplos_reais_usados`: IDs das conversas reais usadas como referência
- `tempo_estimado_leitura`: Tempo estimado total de leitura em minutos

## Critérios de sucesso

- Treinamento cobre >= 3 gaps prioritários do vendedor
- >= 1 exemplo real das próprias conversas do vendedor em cada módulo
- Linguagem validada como prática e compreensível sem jargão técnico
