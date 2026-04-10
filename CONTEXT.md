# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-10 (YOLO #2 — área dinâmica + seeds + scripts)

---

## Próximo passo imediato

Reimportar `ML-CAPTURA-whatsapp-pipeline.json` no n8n (v1.1.0 — área dinâmica só ativa após reimport).

---

## Pendências

### IMEDIATO — n8n
- [ ] Reimportar `ML-CAPTURA-whatsapp-pipeline.json` em `https://n8n-production-47d0.up.railway.app`
- [ ] Importar os 10 workflows de squads (Operacional, Financeiro, Atendimento, Marketing, Pessoas)
- [ ] Ativar cada workflow após importação

### IMEDIATO — Seed MASTER
- [ ] Gerar bcrypt: `node -e "require('bcrypt').hash('SuaSenha',10).then(console.log)"`
- [ ] Substituir `<EMAIL_MASTER>` e `<BCRYPT_HASH>` em `database/seeds/001_master_seed.sql`
- [ ] Executar seed no Railway Postgres

### IMEDIATO — Teste de pipeline
- [ ] Popular `_plataforma.numeros_projeto` com JIDs (formato: `5516...@s.whatsapp.net`) e `setor` correto
- [ ] Executar `bash scripts/test-webhook-text.sh`
- [ ] Executar `bash scripts/test-webhook-audio.sh` com URL de áudio .ogg real

### MÉDIO PRAZO
- [ ] Criar instância `ml-omega-laser` na Evolution API
- [ ] Conectar WhatsApp + executar teste de identificação Redrive

### LONGO PRAZO
- [ ] Deploy Metabase no Railway + conectar Postgres + configurar dashboards
- [ ] Deploy Appsmith no Railway + datasource `portal_app` + CSS tokens
- [ ] Configurar domínios: `portal.dominio.com` / `analytics.dominio.com`

---

## Contexto técnico relevante

- n8n: `https://n8n-production-47d0.up.railway.app`
- Webhook ML-CAPTURA: `/webhook/ml/webhook/whatsapp`
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Credencial n8n: `ML Postgres` (id: `FO9GgjXtERNuCglX`)
- Área dinâmica: lookup em `_plataforma.numeros_projeto.jid` → `setor` (fallback: 'comercial')
- Setup completo: `portal/SETUP-RAILWAY.md`
