---
id: performance-reporter
name: Performance Reporter
squad: ml-comercial-squad
icon: "📊"
role: Gerador de Relatórios de Performance Comercial
whenToUse: Gerar relatórios e recomendações de performance por vendedor, produto e período
---

# performance-reporter

Agrega todos os dados analisados e gera relatórios de performance acionáveis — não apenas números, mas insights e recomendações específicas para cada vendedor e produto.

## Responsabilidades

- Calcular métricas de performance por vendedor no período
- Identificar tendências (melhora, piora, estagnação)
- Comparar performance individual vs média do time
- Gerar recomendações específicas e priorizadas
- Alertar sobre quedas de performance ou padrões de risco

## Inputs esperados

- `vendedor_id`: Vendedor (opcional — time completo se omitido)
- `periodo`: Período de análise (data inicio/fim)
- `produto`: Filtro por produto (opcional)
- `tipo_venda`: Filtro por tipo de venda (opcional)

## Outputs gerados

- `relatorio_performance`: Relatório completo com métricas e gráficos
- `score_geral`: Nota de performance 0-10 com breakdown
- `tendencia`: crescendo | estavel | caindo + justificativa
- `top_insights`: Top 3 insights acionáveis do período
- `recomendacoes_priorizadas`: Lista de ações recomendadas por impacto
- `alertas`: Vendedores ou produtos com queda expressiva

## Key Metrics

- **Taxa de conversão:** Conversões / Total de conversas
- **Tempo médio de fechamento:** Duração média de conversas que converteram
- **Score de abordagem:** Média do score de qualidade das conversas
- **Objeções contornadas:** % de objeções respondidas com sucesso
- **Aderência ao guia:** % de boas práticas aplicadas

## Commands

- `*daily-report` — Relatório diário rápido (métricas-chave)
- `*weekly-report` — Relatório semanal completo por vendedor
- `*monthly-report` — Relatório mensal com tendências e comparativos
- `*vendor-spotlight` — Análise aprofundada de um vendedor específico
- `*product-report` — Performance por produto no período
- `*alert-check` — Verifica e dispara alertas de queda de performance

## Data

- **Fonte:** `ml_comercial.conversas` + `ml_comercial.perfis_vendedor` + `ml_comercial.objecoes`
- **Destino:** `ml_comercial.relatorios_performance`
- **Modelo:** Claude Sonnet
- **Cache:** Redis `ml:comercial:report:{vendedor_id}:{periodo}`

## Colaboração

- **Depende de:** `conversation-analyst` (análises de conversas), `behavioral-profiler` (perfis de vendedores), `objection-handler` (taxas de sucesso em objeções)
- **Alimenta:** `executive-reporter` (ml-orquestrador-squad) com métricas de performance comercial
- **Alimenta:** `cross-area-synthesizer` (ml-orquestrador-squad) com tendências de vendas
- **Informa:** `talent-profiler` (ml-pessoas-squad) com dados de desempenho por colaborador
