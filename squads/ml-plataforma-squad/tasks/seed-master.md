---
id: seed-master
name: Seed Master Data
task: Seed Master Data
squad: ml-plataforma-squad
agent: seed-manager
icon: "🌱"
atomic_layer: task
elicit: false
responsavel: seed-manager
responsavel_type: agent
Entrada: |
  - postgres_connection_string: String de conexão Postgres do ambiente de testes
  - cliente_id: Identificador do cliente para isolamento dos dados de seed
  - squads_ativos: Lista de squads ativos que receberão números vinculados
  - config_numeros: Configuração dos números de teste (quantidade mono e multi, DIDs fictícios)
Saida: |
  - numeros_criados: Lista de números WhatsApp de teste criados com tipo e projeto vinculado
  - projetos_criados: Lista de projetos de teste criados em ml_platform.projetos
  - squads_seed: Lista de squads ativados com IDs gerados no banco
  - sql_rollback: Script SQL para remover todos os dados de seed (rollback limpo)
Checklist:
  - "[ ] Criar projeto de teste em ml_platform.projetos com cliente_id isolado"
  - "[ ] Inserir números WhatsApp do tipo 'mono' em ml_platform.numeros_projeto"
  - "[ ] Inserir números WhatsApp do tipo 'multi' em ml_platform.numeros_projeto"
  - "[ ] Vincular números aos squads ativos conforme config_numeros"
  - "[ ] Registrar squads ativos em ml_platform com status='ativo'"
  - "[ ] Validar inserções com SELECT de confirmação por tabela"
  - "[ ] Gerar script SQL de rollback para remoção limpa dos dados de seed"
---

# seed-master

Popula os dados de seed completos para o ambiente de testes, criando números WhatsApp fictícios (tipo mono e multi), projetos e squads ativos necessários para execução dos cenários de teste do pipeline ML.

## Pré-condições

- Schemas `ml_platform` e `ml_captura` criados e acessíveis no ambiente de testes
- `cliente_id` definido e único para isolamento dos dados de seed
- Lista de squads ativos disponível para vinculação dos números
- Acesso de escrita ao banco Postgres do ambiente de testes

## Passos

1. Criar registro do projeto de teste em `ml_platform.projetos` com `cliente_id` isolado e metadados de seed identificáveis
2. Inserir números WhatsApp do tipo `mono` em `ml_platform.numeros_projeto` com `tipo='mono'`, vinculados ao projeto de teste e a um squad único
3. Inserir números WhatsApp do tipo `multi` em `ml_platform.numeros_projeto` com `tipo='multi'`, vinculados ao projeto de teste e a múltiplos squads conforme configuração
4. Vincular cada número aos squads ativos correspondentes na tabela de relacionamento de squads por número
5. Registrar os squads ativos em `ml_platform` com `status='ativo'` e metadados de seed
6. Executar SELECT de confirmação em cada tabela para validar contagem e integridade dos dados inseridos
7. Gerar e salvar script SQL de rollback com DELETE/TRUNCATE seguro para remoção limpa de todos os dados de seed

## Outputs

- `numeros_criados`: Lista de números WhatsApp de teste criados com tipo e projeto vinculado
- `projetos_criados`: Lista de projetos de teste criados em ml_platform.projetos
- `squads_seed`: Lista de squads ativados com IDs gerados no banco
- `sql_rollback`: Script SQL para remover todos os dados de seed (rollback limpo)

## Critérios de sucesso

- Pelo menos 1 número `tipo='mono'` e 1 número `tipo='multi'` criados e vinculados
- Todos os squads ativos registrados com `status='ativo'` e associados aos números corretos
- SELECT de confirmação retorna contagem esperada em todas as tabelas afetadas
- Script de rollback gerado e validado (executável sem erros em ambiente de testes)
