---
id: analyze-engagement
name: Analyze Team Engagement Signals
squad: ml-pessoas-squad
agent: engagement-monitor
icon: "👥"
---

# analyze-engagement

Analisar sinais de engajamento da equipe a partir de padrões comportamentais observados e identificar colaboradores em risco de desligamento voluntário.

## Pré-condições

- Padrões comportamentais dos colaboradores disponíveis no período (mínimo 30 dias de dados)
- Histórico de interações e indicadores de performance por colaborador
- Schema `ml_pessoas.scores_engajamento` criado e acessível
- Período de comparação (período anterior) disponível para calcular variação

## Passos

1. Analisar padrões de comportamento dos colaboradores no período: frequência de iniciativa, qualidade das interações, cumprimento de prazos, volume de atendimentos
2. Calcular score de engajamento individual (0-100) com base em indicadores ponderados: iniciativa (30%), qualidade (30%), frequência (20%), colaboração (20%)
3. Comparar score atual com período anterior: calcular variação percentual por colaborador
4. Identificar quedas de engajamento >= 20% vs período anterior como sinal de alerta
5. Detectar sinais específicos de risco de desligamento: redução de iniciativa, respostas mais curtas e genéricas, aumento de ausências, mudança de tom nas interações
6. Classificar risco de desligamento por colaborador: alto (queda >= 30% + sinais), médio (queda 20-29%), monitorar (queda < 20% com sinais)
7. Gerar lista de atenção priorizada para gestão com colaboradores, scores e sinais observados
8. Persistir scores em `ml_pessoas.scores_engajamento` com timestamp e variação calculada

## Outputs

- `scores_engajamento`: Score calculado por colaborador no período
- `colaboradores_risco`: Lista de colaboradores com risco de desligamento e classificação de urgência
- `sinais_detectados`: Sinais comportamentais específicos observados por colaborador em risco
- `variacao_vs_periodo_anterior`: Delta percentual de engajamento por colaborador

## Critérios de sucesso

- Score calculado para >= 90% dos colaboradores ativos no período
- Quedas de engajamento detectadas com antecedência de pelo menos 2 semanas
- Sinais específicos documentados para cada colaborador classificado como risco
