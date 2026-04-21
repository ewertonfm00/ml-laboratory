---
id: generate-performance-report
name: Generate Commercial Performance Report
squad: ml-comercial-squad
agent: performance-reporter
icon: "📈"
---

# generate-performance-report

Gerar relatório de performance comercial acionável com comparação de benchmarks, insights específicos e recomendações priorizadas para gestores.

## Pré-condições

- Métricas do período agregadas: taxa de conversão, volume de conversas, score de assertividade por vendedor
- Benchmarks disponíveis em ml_padroes.benchmarks para comparação
- >= 80% dos vendedores ativos com dados no período
- Schema `ml_comercial.relatorios_performance` criado e acessível

## Passos

1. Agregar métricas do período por vendedor: taxa de conversão, volume de conversas, assertividade vs material técnico
2. Comparar métricas individuais com benchmarks do benchmark-generator: classificar cada vendedor em excelente/bom/médio/fraco/crítico
3. Identificar top performers do período e casos de atenção (classificação crítica ou queda > 20% vs período anterior)
4. Gerar insights específicos: não apenas "vendedor X tem 30% de conversão" mas "vendedor X converte bem em varejo mas perde 70% nas consultivas acima de R$500"
5. Formatar relatório executivo: situação atual → destaques positivos → casos de atenção → recomendações prioritárias
6. Priorizar recomendações por facilidade de implementação e impacto estimado
7. Preparar relatório para distribuição via training-content-publisher com lista de destinatários
8. Persistir relatório em `ml_comercial.relatorios_performance` com período e métricas consolidadas

## Outputs

- `relatorio_performance`: Relatório executivo completo formatado para gestores
- `metricas_por_vendedor`: Objeto com métricas individuais e classificação vs benchmark
- `comparacao_benchmarks`: Posicionamento de cada vendedor nos thresholds definidos
- `top_3_insights`: Os 3 insights mais relevantes e acionáveis do período
- `recomendacoes_priorizadas`: Lista de ações recomendadas ordenadas por impacto/esforço

## Critérios de sucesso

- Relatório contém >= 3 insights acionáveis e específicos (não genéricos)
- Dados de >= 80% dos vendedores ativos no período incluídos
- Recomendações com responsável e prazo sugerido definidos
