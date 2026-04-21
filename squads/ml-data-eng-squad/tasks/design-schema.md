---
id: design-schema
name: Design Postgres Schema
squad: ml-data-eng-squad
agent: schema-designer
icon: "🗄️"
---

# design-schema

Projetar schema Postgres para nova área do laboratório ML ou atualizar schema existente, garantindo integridade, performance analítica e documentação completa.

## Pré-condições

- Requisitos de dados da área documentados (entidades, relacionamentos, volume estimado)
- Acesso ao Postgres do projeto com permissão para criar schemas
- Padrão de nomenclatura definido: prefixo `ml_{squad_name}`
- data-quality-validator disponível para revisão

## Passos

1. Analisar requisitos de dados da área: entidades, cardinalidades, padrões de acesso e volume estimado
2. Mapear entidades e relacionamentos em diagrama ER em formato markdown
3. Definir tipos de dados, constraints (NOT NULL, FK, CHECK) e valores default para cada campo
4. Criar DDL completo com tabelas, índices otimizados para padrões de consulta analítica e particionamento se necessário
5. Documentar cada tabela e coluna com comentários SQL (`COMMENT ON`)
6. Revisar DDL com data-quality-validator: normalização, índices, ausência de anti-patterns
7. Gerar arquivo de migration SQL versionado no padrão `V{n}__{descricao}.sql`

## Outputs

- `schema_ddl`: DDL SQL completo e comentado pronto para execução
- `diagrama_er`: Diagrama entidade-relacionamento em formato markdown
- `migration_file`: Arquivo de migration versionado para aplicação via Supabase ou Flyway

## Critérios de sucesso

- Schema aprovado sem violações de normalização (mínimo 3FN)
- Índices cobrem os padrões de consulta principais identificados nos requisitos
- Migration aplicada com sucesso em ambiente de desenvolvimento sem erros
