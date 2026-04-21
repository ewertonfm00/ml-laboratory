---
id: generate-executive-report
name: Generate Executive Report
squad: ml-orquestrador-squad
agent: executive-reporter
icon: "📄"
---

# generate-executive-report

Gerar relatório executivo consolidado com visão integrada de todas as áreas, limitado a 1 página, com os 3 insights de maior impacto e recomendações claras de ação.

## Pré-condições

- Síntese cross-área do período disponível em ml_orquestrador.cross_area_insights
- Resultados de testes A/B do ab-test-manager (ml-skills) disponíveis se aplicável
- insight-scheduler disponível para distribuição do relatório
- Destinatários e formato de entrega configurados para o cliente

## Passos

1. Carregar síntese do cross-area-synthesizer do período atual com correlações e insights priorizados
2. Carregar resultados de testes A/B do ab-test-manager se houver experimentos ativos no período
3. Selecionar os 3 insights de maior impacto estimado no negócio do cliente
4. Estruturar relatório no formato executivo: situação atual (1 parágrafo) → o que importa (3 insights) → por quê acontece (causa raiz) → o que fazer (ação recomendada por insight)
5. Revisar linguagem: eliminar jargão técnico, usar linguagem de negócio, quantificar impacto em termos financeiros ou de cliente
6. Validar que o relatório cabe em no máximo 1 página (~ 400-500 palavras)
7. Preparar relatório para distribuição via insight-scheduler com destinatários, canal e timing definidos
8. Persistir relatório em `ml_orquestrador.relatorios_executivos` com período e metadados de entrega

## Outputs

- `relatorio_executivo`: Relatório formatado em linguagem executiva, máximo 1 página
- `top_3_insights`: Os 3 insights selecionados com impacto estimado e ação recomendada
- `recomendacoes_priorizadas`: Ações concretas priorizadas por urgência e impacto
- `proximo_review`: Data e agenda sugerida para próxima revisão executiva

## Critérios de sucesso

- Relatório com máximo 1 página de conteúdo (~400-500 palavras)
- 3 insights com ação recomendada clara, responsável definido e prazo sugerido cada
- Linguagem validada como executiva: sem jargão técnico, com impacto quantificado
