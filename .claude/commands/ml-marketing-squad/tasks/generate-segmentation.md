---
id: generate-segmentation
name: Generate Behavioral Segmentation for Campaign
task: Generate Behavioral Segmentation for Campaign
squad: ml-marketing-squad
agent: segmentation-advisor
icon: "🎯"
atomic_layer: task
elicit: false
responsavel: segmentation-advisor
responsavel_type: agent
Entrada: |
  - objetivo_campanha: Objetivo da campanha (reativacao/upsell/renovacao/prospeccao)
  - comportamentos_clientes: Comportamentos extraídos das conversas disponíveis em ml_captura e squads operacionais
  - base_clientes: Base de clientes ativa com histórico de interações
Saida: |
  - segmentos: Lista de segmentos com características comportamentais, tamanho e abordagem recomendada
  - tamanho_por_segmento: Número de clientes em cada segmento
  - valor_estimado: Valor potencial de conversão estimado por segmento
  - abordagem_recomendada: Estratégia de comunicação diferenciada para cada segmento
Checklist:
  - "[ ] Definir critérios de segmentação baseados no objetivo da campanha"
  - "[ ] Extrair comportamentos relevantes das conversas (frequência, produtos, objeções, sensibilidade)"
  - "[ ] Agrupar clientes com perfis comportamentais similares por clustering"
  - "[ ] Calcular tamanho e valor estimado de cada segmento"
  - "[ ] Recomendar abordagem diferenciada por segmento (mensagem, oferta, canal, timing)"
  - "[ ] Gerar lista de clientes por segmento com atributos principais"
  - "[ ] Persistir segmentação em ml_marketing.segmentacoes com objetivo e segmentos"
---

# generate-segmentation

Gerar segmentação comportamental de clientes para campanha específica, agrupando por perfil similar e recomendando abordagem diferenciada por segmento.

## Pré-condições

- Objetivo da campanha definido: reativação / upsell / renovação / prospecção
- Comportamentos relevantes extraídos das conversas disponíveis em ml_captura e squads operacionais
- Base de clientes ativa com histórico de interações
- Schema `ml_marketing.segmentacoes` criado e acessível

## Passos

1. Definir critérios de segmentação baseados no objetivo da campanha: reativação (clientes sem interação > 30 dias), upsell (clientes com produto base e perfil de alto engajamento), renovação (contratos vencendo em 30-60 dias), prospecção (leads com perfil similar aos top clientes)
2. Extrair comportamentos relevantes para o objetivo das conversas analisadas: frequência de contato, produtos de interesse, objeções históricas, sensibilidade a preço
3. Agrupar clientes com perfis comportamentais similares usando clustering por comportamento
4. Calcular tamanho de cada segmento (número de clientes) e valor estimado (ticket médio × probabilidade de conversão)
5. Recomendar abordagem diferenciada por segmento: mensagem, oferta, canal e timing distintos
6. Gerar lista de clientes por segmento com atributos principais de cada um
7. Persistir segmentação em `ml_marketing.segmentacoes` com objetivo, segmentos e clientes por segmento

## Outputs

- `segmentos`: Lista de segmentos com características comportamentais, tamanho e abordagem recomendada
- `tamanho_por_segmento`: Número de clientes em cada segmento
- `valor_estimado`: Valor potencial de conversão estimado por segmento
- `abordagem_recomendada`: Estratégia de comunicação diferenciada para cada segmento

## Critérios de sucesso

- >= 3 segmentos distintos com características comportamentais claras e diferenciadas
- Segmentação cobre >= 80% da base de clientes elegíveis para a campanha
- Abordagem recomendada por segmento com justificativa baseada nos comportamentos identificados
