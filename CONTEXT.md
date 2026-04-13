# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-13 (infraestrutura Railway parcialmente ativada)

---

## Próximo passo imediato

Rodar as migrations 001→010 no Postgres Railway:
```bash
psql "postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway" -f database/migrations/001_ml_schemas_init.sql
# repetir para 002→010
```

---

## Pendências

### BLOQUEIO #1 — Acesso n8n
- [ ] Recuperar senha do n8n (`https://n8n-production-47d0.up.railway.app`)
  - **Opção A:** Testar senhas já usadas em outros projetos
  - **Opção B:** Railway Shell → `cd /home/node/.n8n && ls` → reset via SQLite ou Postgres
  - **Opção C:** Deletar volume do n8n → re-setup (eu reimporto os 16 workflows)

### BLOQUEIO #2 — Migrations (usuário executa)
- [ ] Rodar 001→010 no Postgres Railway (psql ou Railway Dashboard → Query)

### BLOQUEIO #3 — Seed MASTER
- [ ] Usuário passa e-mail + senha desejada → eu gero o SQL final
- [ ] Executar seed no Railway Postgres

### BLOQUEIO #4 — JIDs WhatsApp
- [ ] Usuário passa números reais no formato `5516XXXXXXXX@s.whatsapp.net` + setor
- [ ] Eu gero SQL de inserção em `_plataforma.numeros_projeto`

### BLOQUEIO #5 — Conectar WhatsApp na instância oficial-locacao
- [ ] Escanear QR Code via `GET /instance/connect/oficial-locacao` (apikey: ml-evo-key-2026)
- [ ] Validar identificação de agente Redrive

### MÉDIO PRAZO
- [ ] Ativar os 16 workflows n8n após acesso ao n8n
- [ ] Configurar webhook da instância oficial-locacao → n8n ML-CAPTURA

### LONGO PRAZO
- [ ] Deploy Metabase + Appsmith no Railway
- [ ] Configurar domínios: `portal.dominio.com` / `analytics.dominio.com`

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | URL / Detalhe |
|---------|--------|---------------|
| Postgres | ✅ Ativo | `postgres.railway.internal:5432` |
| n8n | ⚠️ Sem acesso | `https://n8n-production-47d0.up.railway.app` |
| evolution-api-ml | ✅ Ativo | `https://evolution-api-ml-production.up.railway.app` |
| redis-evolution-ml | ✅ Criado | `redis://redis-evolution-ml.railway.internal:6379` |
| Instância WhatsApp | 🟡 Criada | `oficial-locacao` — aguardando QR Code |

## Contexto técnico

- Webhook ML-CAPTURA: `/webhook/ml/webhook/whatsapp`
- Evolution API Key: `ml-evo-key-2026`
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- DATABASE_CONNECTION_URI Evolution: `...@postgres.railway.internal:5432/railway?schema=evolution`
- 16 workflows n8n prontos em `infra/n8n/workflows/`
