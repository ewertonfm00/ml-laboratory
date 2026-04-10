# Log de Sessão — 2026-04-10 (YOLO #2)

## O que foi feito

### Fix ML-CAPTURA — Área Dinâmica (v1.0.0 → v1.1.0)
- Problema: nó "Normalizar Payload" hardcodava `area: 'comercial'`, bloqueando todos os squads não-comerciais de receber dados
- Solução: 2 novos nós inseridos entre "Normalizar Payload" e os filtros:
  - **"Lookup Setor"** (Postgres): `SELECT COALESCE(np.setor::text,'comercial') FROM _plataforma.numeros_projeto WHERE jid = '...' AND ativo = true LIMIT 1`
  - **"Enriquecer com Setor"** (Code): mescla payload original com `area` do banco
- Conexões ajustadas: `Normalizar Payload` → `Lookup Setor` → `Enriquecer com Setor` → `Filtro Áudio` + `Filtro Texto`
- Arquivo: `infra/n8n/workflows/ML-CAPTURA-whatsapp-pipeline.json`

### Seed SQL — Usuário MASTER
- Criado: `database/seeds/001_master_seed.sql`
- Insere MASTER em `_plataforma.usuarios` + projeto 'omega-laser' + `projeto_usuarios` com role 'project_admin'
- Usa placeholders `<EMAIL_MASTER>` e `<BCRYPT_HASH>` — substituir antes de executar

### .env.example consolidado
- Todas as variáveis de todos os serviços (Postgres, Evolution API, n8n, Anthropic, Groq, Metabase, Appsmith, Redis)

### Scripts de teste de webhook
- `scripts/test-webhook-audio.sh` — testa pipeline de áudio com audioMessage completo
- `scripts/test-webhook-text.sh` — testa pipeline de texto com conversation

### Commit em massa — todos os artefatos ao git
- 89 arquivos (migrations, workflows, squads, portal, logs, knowledge-base) adicionados ao git

## Decisões tomadas

- **Fallback de área via COALESCE no SQL** (não no JS): garante consistência mesmo se o lookup retornar linha com NULL
- **`$('normalize-payload').first().json` no nó Enriquecer**: necessário porque o Lookup Setor recebe só o payload filtrado, não o original completo
- Commits individuais por story para rastreabilidade

## Pendências identificadas

- `_plataforma.numeros_projeto` precisa ser populado com JIDs reais para a área dinâmica funcionar
- Reimport do ML-CAPTURA no n8n é obrigatório para ativar os novos nós
- Seed precisa de bcrypt gerado pelo usuário antes de executar

## Arquivos criados/modificados

| Arquivo | Operação |
|---------|----------|
| `infra/n8n/workflows/ML-CAPTURA-whatsapp-pipeline.json` | Modificado (v1.1.0) |
| `database/seeds/001_master_seed.sql` | Criado |
| `.env.example` | Atualizado |
| `scripts/test-webhook-audio.sh` | Criado |
| `scripts/test-webhook-text.sh` | Criado |
| `CONTEXT.md` | Atualizado |
| `RELATORIO-YOLO.md` | Atualizado |
