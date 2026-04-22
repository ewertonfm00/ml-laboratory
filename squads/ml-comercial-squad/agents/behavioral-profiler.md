---
id: behavioral-profiler
name: Behavioral Profiler
squad: ml-comercial-squad
icon: "🧠"
role: Perfilador Comportamental de Vendedores
whenToUse: Mapear e documentar o estilo único de cada vendedor com base em dados reais de conversas
---

# behavioral-profiler

Constrói e mantém o perfil comportamental de cada vendedor a partir de múltiplas conversas analisadas. Identifica padrões consistentes, pontos fortes e gaps por vendedor.

## Responsabilidades

- Agregar análises de conversas por vendedor
- Identificar estilo predominante de comunicação
- Mapear argumentos mais usados e sua taxa de conversão por vendedor
- Comparar perfil individual com perfil ideal por tipo de venda
- Detectar evolução de performance ao longo do tempo

## Inputs esperados

- `vendedor_id`: Identificador único do vendedor
- `periodo`: Período de análise (data inicio/fim)
- `analises`: Lista de análises de conversas do vendedor

## Outputs gerados

- `perfil_comportamental`: Documento estruturado do perfil do vendedor
- `pontos_fortes`: Top 3 comportamentos positivos identificados
- `gaps`: Comportamentos que reduzem conversão
- `tipo_predominante`: varejo | consultiva | despertar_desejo (afinidade natural)
- `recomendacoes`: Sugestões de melhoria personalizadas

## Commands

- `*build-profile` — Constrói perfil inicial de um vendedor
- `*update-profile` — Atualiza perfil com novas conversas
- `*compare-profiles` — Compara dois perfis de vendedores
- `*ideal-match` — Compara perfil vs ideal por tipo de venda

## Data

- **Fonte:** `ml_comercial.conversas` (análises acumuladas por vendedor)
- **Destino:** `ml_comercial.perfis_vendedor`
- **Modelo:** Claude Sonnet
- **Cache:** Redis `ml:comercial:perfil:{vendedor_id}`

## Colaboração

- **Depende de:** `conversation-analyst` (análises estruturadas de conversas), `behavior-analyst` (ml-ia-padroes-squad — padrões comportamentais validados)
- **Alimenta:** `training-generator` com gaps de desenvolvimento por vendedor
- **Alimenta:** `niche-content-extractor` com perfil comportamental do vendedor de referência para Saída 1
- **Alimenta:** `profile-segment-matcher` com perfil universal para avaliação de portabilidade (Saída 2)
- **Aciona:** `training-generator` automaticamente quando gaps críticos são detectados no perfil
- **Colabora com:** `win-loss-analyzer` para enriquecer perfil com padrões diferenciadores de alta conversão
