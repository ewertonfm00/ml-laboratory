# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-10 (YOLO — fix área dinâmica + seeds + scripts)

---

## Em progresso

Nenhum. Área dinâmica implementada, seeds e scripts de teste criados.

## Pendências

### IMEDIATO — Importar workflows no n8n
- [ ] Reimportar `ML-CAPTURA-whatsapp-pipeline.json` (v1.1.0 — área dinâmica)
- [ ] Importar os 10 novos workflows de squads (Operacional, Financeiro, Atendimento, Marketing, Pessoas)
- [ ] Ativar cada workflow após importação
- [ ] URL n8n: `https://n8n-production-47d0.up.railway.app`

### IMEDIATO — Seed do usuário MASTER
- [ ] Gerar bcrypt hash: `node -e "require('bcrypt').hash('SuaSenha', 10).then(console.log)"`
- [ ] Substituir `<EMAIL_MASTER>` e `<BCRYPT_HASH>` em `database/seeds/001_master_seed.sql`
- [ ] Executar seed no Postgres Railway

### IMEDIATO — Testar webhooks
- [ ] Popular `_plataforma.numeros_projeto` com JIDs no formato `551699...@s.whatsapp.net`
- [ ] Executar `scripts/test-webhook-text.sh` para testar pipeline de texto
- [ ] Executar `scripts/test-webhook-audio.sh` com URL de áudio real para testar pipeline de áudio

### MÉDIO PRAZO
- [ ] Executar teste de identificação de agente (Redrive) no número multi-agente da Evolution API
- [ ] Criar instância `ml-omega-laser` na Evolution API
- [ ] Conectar WhatsApp + validar área dinâmica em produção

### LONGO PRAZO
- [ ] Deploy Metabase no Railway + conectar Postgres + configurar dashboards
- [ ] Deploy Appsmith no Railway + datasource `portal_app` + CSS tokens
- [ ] Configurar domínios: portal / analytics

## O que foi feito (sessão 2026-04-10 #2)

| Arquivo | O que mudou |
|---------|------------|
| `infra/n8n/workflows/ML-CAPTURA-whatsapp-pipeline.json` | v1.1.0 — área dinâmica via lookup Postgres |
| `database/seeds/001_master_seed.sql` | Seed MASTER + projeto Omega Laser |
| `.env.example` | Variáveis consolidadas de todos os serviços |
| `scripts/test-webhook-audio.sh` | Teste curl do ramo de áudio |
| `scripts/test-webhook-text.sh` | Teste curl do ramo de texto |

## O que foi feito (sessão 2026-04-10 #1 — YOLO)

| Arquivo | Squad | Schedule |
|---------|-------|----------|
| ML-OPERACIONAL-analise-processo.json | Operacional | A cada 60min |
| ML-OPERACIONAL-detector-falhas.json | Operacional | A cada 4h |
| ML-FINANCEIRO-analise-risco.json | Financeiro | A cada 30min |
| ML-FINANCEIRO-previsao-caixa.json | Financeiro | Diário 06h |
| ML-ATENDIMENTO-analise-satisfacao.json | Atendimento | A cada 20min |
| ML-ATENDIMENTO-qualidade-atendimento.json | Atendimento | A cada 4h |
| ML-ATENDIMENTO-estrategia-retencao.json | Atendimento | Diário 08h |
| ML-MARKETING-analise-campanha.json | Marketing | A cada 6h |
| ML-MARKETING-segmentacao.json | Marketing | Diário 03h |
| ML-PESSOAS-perfil-colaborador.json | Pessoas | Diário 01h |

## Contexto técnico relevante

- n8n URL: `https://n8n-production-47d0.up.railway.app`
- Webhook ML-CAPTURA: `/webhook/ml/webhook/whatsapp` (path real)
- Postgres público (scripts): `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Workflow ID ML-CAPTURA: `B6IeeHfczoQ4WVY6` — versionId ativo: `a6ec6233-07c0-40c2-875b-56f70d539893`
- `versionId` é `char(36)`, `activeVersionId` é `varchar(36)` — usar casts explícitos
- `execution_data.runData` vazio em todas execuções (comportamento n8n v2.15 — não afeta funcionamento)
- Credencial Postgres no n8n: `ML Postgres` (ssl=disable, host interno railway)
- Lookup área: `_plataforma.numeros_projeto.jid` deve estar no formato `551699...@s.whatsapp.net`
