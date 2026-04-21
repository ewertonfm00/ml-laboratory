---
id: build-behavioral-profile
name: Build Vendor Behavioral Profile
squad: ml-comercial-squad
agent: behavioral-profiler
icon: "👤"
---

# build-behavioral-profile

Construir perfil comportamental completo de um vendedor a partir de múltiplas conversas analisadas no período, incluindo estilo dominante, DISC aproximado e score de consistência.

## Pré-condições

- Mínimo de 10 conversas do vendedor analisadas no período com padrões extraídos
- Modelos comportamentais do ml-ia-padroes-squad disponíveis para o vendedor
- Schema `ml_comercial.perfis_comportamentais` criado e acessível
- vendedor_id e período definidos como parâmetros de entrada

## Passos

1. Agregar análises de conversas do vendedor no período a partir de ml_padroes.modelos_comportamentais
2. Identificar padrões comportamentais consistentes: presentes em >= 70% das conversas do vendedor
3. Classificar estilo de venda dominante: varejo (transacional/rápido) / consultiva (diagnóstico/solução) / despertar_desejo (emocional/aspiracional)
4. Mapear pontos fortes: comportamentos com correlação positiva com conversão no histórico do vendedor
5. Mapear gaps: comportamentos ausentes que correlacionam com perdas ou comportamentos presentes que correlacionam negativamente
6. Calcular DISC aproximado baseado em padrões de comunicação observados: velocidade, assertividade, empatia, detalhamento
7. Gerar narrativa descritiva do perfil em linguagem natural (2-3 parágrafos)
8. Persistir perfil em `ml_comercial.perfis_comportamentais` com todos os campos e data de geração

## Outputs

- `perfil_comportamental`: Objeto completo com todos os atributos do perfil
- `estilo_dominante`: Estilo de venda predominante classificado
- `pontos_fortes`: Lista de comportamentos com correlação positiva com conversão
- `gaps`: Lista de comportamentos ausentes ou negativos identificados
- `disc_aproximado`: Perfil DISC estimado (D/I/S/C com percentuais)
- `total_conversas_base`: Número de conversas usadas para construir o perfil

## Critérios de sucesso

- Perfil baseado em >= 10 conversas do vendedor no período
- Consistência interna do perfil >= 0.7: estilo dominante alinhado com padrões identificados
- Narrativa gerada em linguagem compreensível para gestores não técnicos
