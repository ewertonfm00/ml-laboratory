---
id: seed-ai-agents
name: Seed AI Agents
task: Seed AI Agents
squad: ml-plataforma-squad
agent: seed-manager
icon: "🤖"
atomic_layer: task
elicit: false
responsavel: seed-manager
responsavel_type: agent
Entrada: |
  - postgres_connection_string: String de conexão Postgres do ambiente de testes
  - cliente_id: Identificador do cliente para isolamento dos agentes de seed
  - squads_ativos: Lista de squads ativos que receberão agentes configurados
  - config_agentes: Configuração de personas por squad (nome, escopo, estilo de comunicação)
Saida: |
  - agentes_criados: Lista de agentes de IA criados com IDs, squads vinculados e personas
  - bases_conhecimento: Lista de bases de conhecimento iniciais configuradas por agente
  - escopos_configurados: Mapeamento de escopos e habilidades por agente
  - sql_rollback: Script SQL para remover todos os dados de agentes de seed
Checklist:
  - "[ ] Criar registros de agentes em ml_platform ou schema de configuração de agentes"
  - "[ ] Configurar persona por agente (nome, tom, estilo de comunicação, escopo)"
  - "[ ] Vincular cada agente ao squad e número correspondente"
  - "[ ] Inserir base de conhecimento inicial por agente (FAQ, scripts de abordagem)"
  - "[ ] Configurar escopos de atuação (quais intenções o agente pode responder)"
  - "[ ] Validar inserções com SELECT de confirmação por tabela"
  - "[ ] Gerar script SQL de rollback para remoção limpa dos agentes de seed"
---

# seed-ai-agents

Configura os agentes de IA do cliente no ambiente de testes, definindo personas, escopos de atuação e bases de conhecimento iniciais para cada squad ativo, permitindo execução realista dos cenários de análise e atendimento do pipeline ML.

## Pré-condições

- Schema de configuração de agentes disponível (`ml_platform` ou schema específico)
- `cliente_id` e `squads_ativos` definidos e existentes no banco (seed-master executado)
- Catálogo de produtos disponível (seed-catalog executado) para compor base de conhecimento
- Acesso de escrita ao banco Postgres do ambiente de testes

## Passos

1. Criar registros de agentes em `ml_platform` (ou schema equivalente) para cada squad ativo, com `cliente_id` para isolamento e metadados de seed identificáveis
2. Configurar persona por agente: nome fictício, tom de comunicação (formal/informal), estilo de abordagem e escopo de atuação (quais temas o agente pode tratar)
3. Vincular cada agente ao squad correspondente e ao número WhatsApp configurado no seed master (mono ou multi conforme o squad)
4. Inserir base de conhecimento inicial por agente: FAQ básico do negócio, scripts de abordagem para os produtos do catálogo e respostas para objeções comuns
5. Configurar escopos de intenção por agente: mapeamento de quais intenções detectadas pelo pipeline o agente pode responder (ex: interesse, dúvida, objeção, encerramento)
6. Executar SELECT de confirmação em cada tabela para validar contagem e integridade dos dados inseridos
7. Gerar e salvar script SQL de rollback com DELETE seguro para remoção limpa de todos os agentes e bases de conhecimento de seed

## Outputs

- `agentes_criados`: Lista de agentes de IA criados com IDs, squads vinculados e personas
- `bases_conhecimento`: Lista de bases de conhecimento iniciais configuradas por agente
- `escopos_configurados`: Mapeamento de escopos e habilidades por agente
- `sql_rollback`: Script SQL para remover todos os dados de agentes de seed

## Critérios de sucesso

- Pelo menos 1 agente criado por squad ativo com persona, escopo e base de conhecimento configurados
- Todos os agentes vinculados corretamente ao `cliente_id` e ao número WhatsApp do seed master
- Base de conhecimento inicial inclui ao menos FAQ básico e scripts para os produtos do catálogo
- Script de rollback gerado e validado (executável sem erros em ambiente de testes)
