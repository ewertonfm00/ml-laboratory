---
id: train-agent
name: Train Niche Agent with Production Data
task: Train Niche Agent with Production Data
squad: ml-skills-squad
agent: agent-trainer
icon: "🎓"
atomic_layer: task
elicit: false
responsavel: agent-trainer
responsavel_type: agent
Entrada: |
  - agente_versao_atual: Agente de nicho com versão atual em produção (>= 2 semanas)
  - metricas_performance: Métricas das últimas 2 semanas do agent-performance-tracker
  - threshold_benchmark: Threshold de conversão e escalonamento do benchmark para o nicho
Saida: |
  - versao_agente: Nova versão do agente gerada após o treinamento
  - melhorias_aplicadas: Lista de skills atualizadas com descrição da melhoria
  - cenarios_melhorados: Cenários que receberam atualização de skill
  - delta_performance_esperado: Estimativa de melhoria de conversão baseada nas mudanças
Checklist:
  - "[ ] Carregar métricas de performance das últimas 2 semanas (conversão, escalonamentos, avaliações)"
  - "[ ] Identificar cenários com baixa performance (conversão abaixo do threshold ou escalonamento > 10%)"
  - "[ ] Analisar onde o agente falhou em cada cenário problemático"
  - "[ ] Gerar hipóteses de melhoria para cada cenário (instrução, exemplo, trigger)"
  - "[ ] Atualizar skills problemáticas via skill-generator com as hipóteses aplicadas"
  - "[ ] Validar skills atualizadas via skill-validator (aprovar score >= 80)"
  - "[ ] Criar nova versão do agente e registrar training run em ml_skills.training_runs"
---

# train-agent

Refinar agente de nicho existente com base em dados de performance em produção das últimas 2 semanas, atualizando skills problemáticas e gerando nova versão validada.

## Pré-condições

- Agente de nicho com versão atual em produção por >= 2 semanas
- Métricas de performance disponíveis no agent-performance-tracker
- skill-generator e skill-validator disponíveis para ciclo de atualização
- Schema `ml_skills.training_runs` criado para rastreamento de treinamentos

## Passos

1. Carregar métricas de performance das últimas 2 semanas: taxa de conversão, escalonamentos, avaliações negativas por cenário
2. Identificar cenários com baixa performance: conversão abaixo do threshold do benchmark ou taxa de escalonamento > 10%
3. Analisar onde o agente falhou em cada cenário problemático com apoio do ab-test-manager
4. Gerar hipóteses de melhoria para cada cenário: ajuste de instrução, novo exemplo, novo trigger
5. Atualizar skills problemáticas via skill-generator com as hipóteses de melhoria aplicadas
6. Validar skills atualizadas via skill-validator: aprovar apenas as com score >= 80
7. Criar nova versão do agente incorporando as skills aprovadas e incrementar número de versão
8. Registrar training run em `ml_skills.training_runs` com versão, melhorias aplicadas e delta de performance esperado

## Outputs

- `versao_agente`: Nova versão do agente gerada após o treinamento
- `melhorias_aplicadas`: Lista de skills atualizadas com descrição da melhoria
- `cenarios_melhorados`: Cenários que receberam atualização de skill
- `delta_performance_esperado`: Estimativa de melhoria de conversão baseada nas mudanças

## Critérios de sucesso

- Nova versão contém pelo menos 1 melhoria de skill validada com score >= 80
- Nenhuma regressão em cenários estáveis: skills não problemáticas permanecem inalteradas
- Training run registrado com histórico completo de decisões tomadas
