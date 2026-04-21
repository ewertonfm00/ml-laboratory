---
id: generate-retention-strategy
name: Generate Personalized Retention Strategy
squad: ml-atendimento-squad
agent: retention-advisor
icon: "🤝"
---

# generate-retention-strategy

Gerar estratégia personalizada de retenção para cliente específico em risco de churn, identificando a causa raiz e definindo abordagem, canal e timing de contato.

## Pré-condições

- Cliente identificado pelo churn-detector com score e sinais disponíveis
- Histórico completo do cliente acessível (compras, interações, reclamações, produtos)
- Perfil comportamental do cliente disponível ou inferível pelo histórico
- Schema `ml_atendimento.estrategias_retencao` criado e acessível

## Passos

1. Carregar histórico completo do cliente: compras, frequência de contato, reclamações, produtos contratados, tempo como cliente
2. Carregar análise de churn score e sinais específicos do churn-detector para o cliente
3. Cruzar sinais de churn com perfil comportamental: estilo de comunicação preferido, sensibilidade a preço, histórico de objeções
4. Identificar causa raiz do risco de churn: produto inadequado / preço / qualidade de atendimento / oferta de concorrente / mudança de necessidade
5. Gerar plano de retenção com 3 abordagens priorizadas por probabilidade de sucesso: oferta personalizada / ajuste de produto / abordagem relacional
6. Definir canal de contato ideal (WhatsApp/ligação/e-mail) baseado no perfil e urgência
7. Definir timing de contato: horário e dia da semana com maior histórico de resposta do cliente
8. Registrar estratégia em `ml_atendimento.estrategias_retencao` e acompanhar resultado após implementação

## Outputs

- `estrategia_retencao`: Plano completo com 3 abordagens priorizadas e scripts de contato
- `causa_raiz_identificada`: Motivo principal do risco de churn identificado
- `abordagens_priorizadas`: Lista de abordagens ordenadas por probabilidade de sucesso estimada
- `canal_recomendado`: Canal de contato ideal para o perfil do cliente
- `timing_contato`: Horário e dia recomendado para primeiro contato

## Critérios de sucesso

- Estratégia gerada em < 2 minutos após acionamento
- Abordagem alinhada ao perfil comportamental e histórico real do cliente
- Causa raiz identificada com evidências dos sinais detectados
