---
id: generate-optimization-report
name: Generate Operational Optimization Report
task: Generate Operational Optimization Report
squad: ml-operacional-squad
agent: optimization-advisor
icon: "📋"
atomic_layer: task
elicit: false
responsavel: optimization-advisor
responsavel_type: agent
Entrada: |
  - gargalos_priorizados: Gargalos detectados e priorizados pelo detect-bottlenecks em ml_operacional.gargalos
  - contexto_processo: Contexto do processo operacional e recursos disponíveis
  - stakeholders: Responsáveis e áreas mapeados para atribuição de ações
Saida: |
  - relatorio_otimizacao: Relatório executivo completo com contexto, análise e plano de ação
  - recomendacoes_priorizadas: Lista de melhorias ordenadas por impacto/esforço com responsável
  - quick_wins: Melhorias implementáveis em < 1 semana com alto impacto
  - plano_90_dias: Calendário de implementação distribuído em 30/60/90 dias
  - ganho_estimado: Estimativa de melhoria por indicador para cada recomendação implementada
Checklist:
  - "[ ] Carregar gargalos priorizados (score de impacto, frequência, etapa e evidências)"
  - "[ ] Analisar causa raiz dos top 5 gargalos (processo/tecnologia/pessoa/comunicação)"
  - "[ ] Gerar recomendações de melhoria por gargalo (o que, como, resultado esperado)"
  - "[ ] Classificar cada recomendação por esforço (baixo/médio/alto)"
  - "[ ] Identificar quick wins (alto impacto + baixo esforço, < 1 semana)"
  - "[ ] Organizar plano de ação 30/60/90 dias"
  - "[ ] Persistir relatório em ml_operacional.relatorios_otimizacao com métricas"
---

# generate-optimization-report

Gerar relatório de recomendações de melhoria operacional baseado nos gargalos detectados, com plano de ação de 30/60/90 dias e identificação de quick wins.

## Pré-condições

- Gargalos detectados e priorizados pelo detect-bottlenecks disponíveis em ml_operacional.gargalos
- Contexto do processo operacional e recursos disponíveis para implementação
- Schema `ml_operacional.relatorios_otimizacao` criado e acessível
- Stakeholders e responsáveis por área mapeados

## Passos

1. Carregar gargalos priorizados do detect-bottlenecks: score de impacto, frequência, etapa e evidências
2. Analisar causa raiz de cada gargalo priorizando os top 5 por score de impacto: processo / tecnologia / pessoa / comunicação
3. Gerar recomendações de melhoria por gargalo: o que fazer, como fazer e resultado esperado
4. Classificar cada recomendação por esforço de implementação: baixo (< 1 semana) / médio (1-4 semanas) / alto (> 4 semanas)
5. Identificar quick wins: recomendações de alto impacto e baixo esforço (implementação < 1 semana)
6. Organizar recomendações em plano de ação 30/60/90 dias: quick wins nos primeiros 30, melhorias médias em 60, estruturais em 90
7. Estimar ganho de cada melhoria: redução de retrabalho, melhoria de SLA, redução de reclamações
8. Formatar relatório executivo e persistir em `ml_operacional.relatorios_otimizacao` com plano e métricas de acompanhamento

## Outputs

- `relatorio_otimizacao`: Relatório executivo completo com contexto, análise e plano de ação
- `recomendacoes_priorizadas`: Lista de melhorias ordenadas por impacto/esforço com responsável
- `quick_wins`: Melhorias implementáveis em < 1 semana com alto impacto
- `plano_90_dias`: Calendário de implementação distribuído em 30/60/90 dias
- `ganho_estimado`: Estimativa de melhoria por indicador para cada recomendação implementada

## Critérios de sucesso

- Relatório com >= 5 recomendações acionáveis baseadas nos gargalos detectados
- Pelo menos 2 quick wins identificados com impacto estimado calculado
- Plano de 90 dias com responsável e prazo definidos para cada recomendação
