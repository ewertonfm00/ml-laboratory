---
id: seed-catalog
name: Seed Product Catalog
task: Seed Product Catalog
squad: ml-plataforma-squad
agent: seed-manager
icon: "📦"
atomic_layer: task
elicit: false
responsavel: seed-manager
responsavel_type: agent
Entrada: |
  - postgres_connection_string: String de conexão Postgres do ambiente de testes
  - cliente_id: Identificador do cliente para isolamento do catálogo de seed
  - nicho: Nicho de negócio do cliente (ex: estetica, saude, educacao) para produtos realistas
  - config_catalogo: Configuração opcional com número de produtos, categorias e faixa de preço
Saida: |
  - produtos_criados: Lista de produtos/serviços inseridos com IDs e categorias
  - categorias_criadas: Lista de categorias de produtos criadas no catálogo
  - contexto_venda: Resumo do contexto de venda gerado (abordagens, objeções comuns, diferenciais)
  - sql_rollback: Script SQL para remover todos os dados de catálogo de seed
Checklist:
  - "[ ] Criar categorias de produtos/serviços em ml_data_eng ou schema de catálogo do cliente"
  - "[ ] Inserir produtos/serviços com nome, descrição, preço e categoria para o nicho"
  - "[ ] Gerar contexto de venda por produto (abordagem, objeções comuns, diferenciais)"
  - "[ ] Vincular catálogo ao cliente_id para isolamento no ambiente de testes"
  - "[ ] Validar inserções com SELECT de confirmação por tabela"
  - "[ ] Gerar script SQL de rollback para remoção limpa do catálogo de seed"
---

# seed-catalog

Popula o catálogo de produtos e serviços do cliente no ambiente de testes, incluindo contexto de venda por produto (abordagens, objeções comuns e diferenciais), permitindo que os agentes ML executem cenários reais de análise e abordagem comercial.

## Pré-condições

- Schema de catálogo disponível (`ml_data_eng` ou schema específico do cliente)
- `cliente_id` e `nicho` definidos para geração de produtos realistas
- Seed master executado (`seed-master` com sucesso) para que `cliente_id` exista no banco
- Acesso de escrita ao banco Postgres do ambiente de testes

## Passos

1. Criar categorias de produtos/serviços no schema de catálogo, alinhadas ao nicho do cliente (ex: para estética — depilação, skincare, corpo; para saúde — consultas, exames, procedimentos)
2. Inserir produtos/serviços com nome, descrição, preço de referência e categoria, gerando dados realistas para o nicho especificado
3. Gerar e associar contexto de venda por produto: abordagem recomendada, principais objeções com contra-argumentos e diferenciais competitivos
4. Vincular todos os registros ao `cliente_id` para garantir isolamento completo no ambiente de testes
5. Executar SELECT de confirmação em cada tabela para validar contagem e integridade dos dados inseridos
6. Gerar e salvar script SQL de rollback com DELETE seguro para remoção limpa de todos os dados do catálogo de seed

## Outputs

- `produtos_criados`: Lista de produtos/serviços inseridos com IDs e categorias
- `categorias_criadas`: Lista de categorias de produtos criadas no catálogo
- `contexto_venda`: Resumo do contexto de venda gerado (abordagens, objeções comuns, diferenciais)
- `sql_rollback`: Script SQL para remover todos os dados de catálogo de seed

## Critérios de sucesso

- Pelo menos 3 categorias e 5 produtos/serviços criados com dados realistas para o nicho
- Contexto de venda gerado para cada produto com abordagem, objeções e diferenciais
- Todos os registros vinculados ao `cliente_id` correto sem vazamento entre clientes
- Script de rollback gerado e validado (executável sem erros em ambiente de testes)
