---
id: map-product-approach
name: Map Product Approach vs Ideal
task: Map Product Approach vs Ideal
squad: ml-comercial-squad
agent: product-approach
icon: "🗺️"
atomic_layer: task
elicit: false
responsavel: product-approach
responsavel_type: agent
Entrada: |
  - produto_id: Identificador do produto a ser mapeado
  - periodo: Data início e fim do período de análise
  - conversas_classificadas: Conversas do produto com classificação e resultado (converteu/perdeu)
  - material_tecnico: Material técnico do produto via technical-content-loader
Saida: |
  - mapa_abordagem: Mapa completo de como o produto é vendido na prática por tipo de cliente
  - argumentos_que_convertem: Lista de argumentos com maior correlação com conversão por perfil
  - gaps_de_abordagem: Diferenças entre prática real e abordagem prescrita no material técnico
  - guia_abordagem_por_perfil: Guia prático de venda do produto por tipo de cliente
Checklist:
  - "[ ] Selecionar conversas do produto no período com resultado definido (>= 20 conversas)"
  - "[ ] Extrair argumentos usados por tipo de cliente (preço-sensível, qualidade-primeiro, etc.)"
  - "[ ] Identificar argumentos que correlacionam positivamente com conversão por tipo"
  - "[ ] Carregar abordagem ideal do material técnico via technical-content-loader"
  - "[ ] Mapear gap entre abordagem real e abordagem ideal do material"
  - "[ ] Identificar argumentos validados em campo ausentes no material técnico oficial"
  - "[ ] Persistir mapa em ml_comercial.mapas_abordagem com produto, período e guia"
---

# map-product-approach

Mapear como o produto está sendo apresentado na prática pelos atendentes, comparar com a abordagem ideal definida no material técnico e gerar guia validado em campo por tipo de cliente.

## Pré-condições

- Mínimo de 20 conversas do produto no período com classificação e resultado
- Material técnico do produto disponível via technical-content-loader
- Schema `ml_comercial.mapas_abordagem` criado e acessível
- produto_id e período definidos como parâmetros

## Passos

1. Selecionar conversas do produto no período com resultado definido (converteu/perdeu)
2. Extrair argumentos usados por tipo de cliente: preço-sensível, qualidade-primeiro, urgência, indeciso
3. Identificar argumentos que correlacionam positivamente com conversão por tipo de cliente
4. Carregar abordagem ideal do material técnico via technical-content-loader: benefícios oficiais, público-alvo, diferenciais
5. Mapear gap entre abordagem real (o que os vendedores fazem) e abordagem ideal (o que o material prescreve)
6. Identificar argumentos validados em campo que não estão no material técnico oficial (insights reais)
7. Gerar guia de abordagem por tipo de cliente: argumentos que convertem + sequência recomendada
8. Persistir mapa em `ml_comercial.mapas_abordagem` com produto, período e guia gerado

## Outputs

- `mapa_abordagem`: Mapa completo de como o produto é vendido na prática por tipo de cliente
- `argumentos_que_convertem`: Lista de argumentos com maior correlação com conversão por perfil de cliente
- `gaps_de_abordagem`: Diferenças entre prática real e abordagem prescrita no material técnico
- `guia_abordagem_por_perfil`: Guia prático de venda do produto por tipo de cliente

## Critérios de sucesso

- Mapa cobre >= 3 tipos de cliente distintos
- Baseado em >= 20 conversas do produto no período analisado
- Guia gerado com argumentos ranqueados por taxa de conversão real
