# ML Laboratory — Database

Schemas Postgres isolados do projeto Machine Learning.

## Isolamento

Todos os schemas usam prefixo `ml_*` — total independência de outros projetos na mesma instância:

| Schema | Área | Status |
|--------|------|--------|
| `ml_captura` | Coleta bruta (WhatsApp, áudio) | 🟢 Ativo |
| `ml_comercial` | Área comercial (conversas, perfis, objeções) | 🟢 Ativo |
| `ml_data_eng` | ETL e estruturação | 🟡 Próximo |
| `ml_padroes` | Padrões e refinamento | 🟡 Próximo |
| `ml_skills` | Skills de agentes | 🟡 Próximo |
| `ml_platform` | Monitoramento e infra | 🟡 Próximo |
| `ml_operacional` | Operações | 🔵 Planejado |
| `ml_financeiro` | Financeiro | 🔵 Planejado |
| `ml_atendimento` | Atendimento | 🔵 Planejado |
| `ml_marketing` | Marketing | 🔵 Planejado |
| `ml_pessoas` | Pessoas | 🔵 Planejado |

## Ordem de Execução das Migrations

```bash
# 1. Criar todos os schemas e role ml_app
psql $DATABASE_URL -f migrations/001_ml_schemas_init.sql

# 2. Tabelas de captura (Camada 1)
psql $DATABASE_URL -f migrations/002_ml_captura_tables.sql

# 3. Tabelas do squad comercial (prioridade 1)
psql $DATABASE_URL -f migrations/003_ml_comercial_tables.sql
```

## Tabelas — ml_comercial (Squad Comercial)

| Tabela | Agente | Descrição |
|--------|--------|-----------|
| `vendedores` | — | Cadastro de vendedores |
| `conversas` | conversation-analyst | Análises estruturadas de conversas |
| `perfis_vendedor` | behavioral-profiler | Perfil comportamental por vendedor |
| `abordagens_produto` | product-approach | Guias de abordagem por produto |
| `objecoes` | objection-handler | Catálogo de objeções + respostas |
| `treinamentos` | training-generator | Conteúdo de treinamento |
| `relatorios_performance` | performance-reporter | Cache de relatórios |

## Tabelas — ml_captura (Camada 1)

| Tabela | Descrição |
|--------|-----------|
| `mensagens_raw` | Mensagens brutas do WhatsApp |
| `transcricoes_audio` | Transcrições via Groq Whisper |
| `sessoes_conversa` | Sessões agrupando mensagens de um contato |

## Rollback

```bash
# Reverter migration específica
psql $DATABASE_URL -f rollbacks/003_ml_comercial_tables_rollback.sql
psql $DATABASE_URL -f rollbacks/002_ml_captura_tables_rollback.sql
psql $DATABASE_URL -f rollbacks/001_ml_schemas_init_rollback.sql
```

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://ml_app:SENHA@host:5432/nome_db
ML_REDIS_URL=redis://host:6379
ML_REDIS_PREFIX=ml:
```
