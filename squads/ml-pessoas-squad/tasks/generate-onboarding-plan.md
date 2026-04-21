---
id: generate-onboarding-plan
name: Generate Personalized Onboarding Plan
squad: ml-pessoas-squad
agent: onboarding-advisor
icon: "🎯"
---

# generate-onboarding-plan

Gerar plano de onboarding personalizado para novo colaborador com base no perfil ideal da função, mapeando gaps a desenvolver e definindo milestones mensuráveis de 30/60/90 dias.

## Pré-condições

- Perfil ideal da função disponível via talent-profiler com competências e comportamentos esperados
- Perfil do novo colaborador disponível: experiência anterior, estilo comportamental (DISC ou similar), competências declaradas
- Schema `ml_pessoas.planos_onboarding` criado e acessível
- Melhores práticas de onboarding documentadas para a função no laboratório

## Passos

1. Carregar perfil ideal da função do talent-profiler: competências técnicas, comportamentos esperados, indicadores de sucesso
2. Comparar perfil ideal com perfil do novo colaborador: identificar competências presentes, em desenvolvimento e ausentes
3. Priorizar gaps a desenvolver no onboarding por impacto no desempenho da função
4. Selecionar melhores práticas de onboarding comprovadas para a função: o que funcionou com outros colaboradores bem-sucedidos
5. Gerar trilha personalizada de desenvolvimento com atividades, recursos e responsáveis para cada gap priorizado
6. Definir milestones mensuráveis de 30 dias (adaptação), 60 dias (independência) e 90 dias (produtividade plena)
7. Definir métricas de sucesso do onboarding: indicadores quantitativos para avaliar se o colaborador atingiu cada milestone
8. Persistir plano em `ml_pessoas.planos_onboarding` com colaborador_id, função, trilha e milestones

## Outputs

- `plano_onboarding`: Plano completo com atividades, responsáveis e prazos para os 90 dias
- `trilha_desenvolvimento`: Sequência de aprendizados e experiências organizada por prioridade
- `milestones_30_60_90`: Objetivos mensuráveis para cada checkpoint do onboarding
- `metricas_sucesso`: Indicadores quantitativos para avaliação de cada milestone
- `gaps_a_desenvolver`: Lista priorizada de competências e comportamentos a desenvolver

## Critérios de sucesso

- Plano cobre os 90 dias completos com distribuição equilibrada de atividades
- Milestones mensuráveis com métricas quantitativas definidas (não apenas qualitativas)
- Trilha personalizada reflete os gaps específicos do colaborador vs perfil ideal da função
