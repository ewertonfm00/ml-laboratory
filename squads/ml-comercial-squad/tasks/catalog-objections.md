---
id: catalog-objections
name: Catalog Real Objections and Validated Responses
task: Catalog Real Objections and Validated Responses
squad: ml-comercial-squad
agent: objection-handler
icon: "🛡️"
atomic_layer: task
elicit: false
responsavel: objection-handler
responsavel_type: agent
Entrada: |
  - produto_id: Identificador do produto para filtrar conversas
  - tipo_venda: Tipo de venda para filtro (varejo/consultiva/despertar_desejo)
  - conversas_analisadas: Conversas com objeções identificadas e resultados (converteu/perdeu)
Saida: |
  - catalogo_objecoes: Catálogo completo com objeção, respostas validadas, frequência e taxa de sucesso
  - total_objecoes_unicas: Número de grupos de objeção únicos identificados
  - objecoes_sem_resposta_eficaz: Lista de objeções que sempre resultaram em perda sem contorno eficaz
Checklist:
  - "[ ] Extrair todas as objeções identificadas nas conversas do produto e tipo_venda"
  - "[ ] Agrupar objeções similares semanticamente (preço, prazo, concorrente, necessidade, etc.)"
  - "[ ] Calcular frequência de cada grupo de objeção por produto e tipo de venda"
  - "[ ] Identificar respostas que contornaram cada objeção com sucesso"
  - "[ ] Extrair as 2-3 respostas mais eficazes por objeção com exemplo real"
  - "[ ] Identificar objeções sem resposta eficaz validada"
  - "[ ] Persistir catálogo em ml_comercial.catalogo_objecoes com produto, período e data"
---

# catalog-objections

Catalogar objeções reais extraídas de conversas e desenvolver respostas validadas em campo, ordenadas por frequência e impacto na conversão.

## Pré-condições

- Conversas analisadas com objeções identificadas e extraídas nos padrões comportamentais
- Resultados de conversas (converteu/perdeu) disponíveis para validar eficácia das respostas
- Schema `ml_comercial.catalogo_objecoes` criado e acessível
- produto_id e tipo_venda definidos como parâmetros de filtro

## Passos

1. Extrair todas as objeções identificadas nas conversas analisadas do produto e tipo_venda
2. Agrupar objeções similares semanticamente: preço, prazo, concorrente, necessidade, autoridade, confiança
3. Calcular frequência de cada grupo de objeção por produto e tipo de venda
4. Identificar as respostas que contornaram cada objeção com sucesso: conversas onde a objeção foi superada e resultou em conversão
5. Para cada objeção, extrair as 2-3 respostas mais eficazes em campo com exemplo real
6. Identificar objeções sem resposta eficaz validada: objetos que sempre resultaram em perda
7. Gerar catálogo estruturado: objeção → frequência → respostas validadas (com exemplo real) → taxa de sucesso
8. Persistir catálogo em `ml_comercial.catalogo_objecoes` com produto, período e data de geração

## Outputs

- `catalogo_objecoes`: Catálogo completo com objeção, respostas validadas, frequência e taxa de sucesso
- `total_objecoes_unicas`: Número de grupos de objeção únicos identificados
- `objecoes_sem_resposta_eficaz`: Lista de objeções que sempre resultaram em perda, sem contorno eficaz

## Critérios de sucesso

- Catálogo cobre as 10 objeções mais frequentes do produto/tipo_venda
- Cada objeção do catálogo tem >= 1 resposta validada com taxa de sucesso calculada
- Objeções sem resposta eficaz identificadas e sinalizada para desenvolvimento de estratégia
