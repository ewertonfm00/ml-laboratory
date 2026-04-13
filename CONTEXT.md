# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-13 (análise completa do projeto + orientação de ativação)

---

## Próximo passo imediato

Verificar se psql está instalado localmente:
```
! psql --version
```
Se sim → rodar migrations direto. Se não → usar Railway Shell ou instalar psql.

---

## Pendências

### BLOQUEIO #1 — Acesso n8n
- [ ] Recuperar senha do n8n (`https://n8n-production-47d0.up.railway.app`)
  - **Opção A:** Testar senhas já usadas em outros projetos
  - **Opção B:** Railway Shell → `cd /home/node/.n8n && ls` → reset via SQLite ou Postgres
  - **Opção C:** Deletar volume do n8n → força re-setup (eu reimporto os 16 workflows)

### BLOQUEIO #2 — Migrations (usuário executa)
- [ ] Rodar 001→010 no Postgres Railway (psql ou Railway Dashboard → Query)
- [ ] Verificar schemas criados: `\dn` após execução

### BLOQUEIO #3 — Seed MASTER (aguardando e-mail + senha do usuário)
- [ ] Usuário passa e-mail + senha desejada → eu gero o SQL final
- [ ] Executar seed no Railway Postgres

### BLOQUEIO #4 — JIDs WhatsApp (aguardando dados do usuário)
- [ ] Usuário passa números no formato `5516XXXXXXXX@s.whatsapp.net` + setor
- [ ] Eu gero SQL de inserção em `_plataforma.numeros_projeto`

### BLOQUEIO #5 — Evolution API (aguardando credenciais)
- [ ] Usuário passa URL + API Key → eu gero comandos curl para criar instância `ml-omega-laser`

### MÉDIO PRAZO
- [ ] Conectar WhatsApp + executar teste de identificação Redrive
- [ ] Ativar os 16 workflows n8n após acesso

### LONGO PRAZO
- [ ] Deploy Metabase + Appsmith no Railway
- [ ] Configurar domínios: `portal.dominio.com` / `analytics.dominio.com`

---

## Contexto técnico relevante

- n8n: `https://n8n-production-47d0.up.railway.app`
- Webhook ML-CAPTURA: `/webhook/ml/webhook/whatsapp`
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Credencial n8n: `ML Postgres` (id: `FO9GgjXtERNuCglX`)
- Área dinâmica: lookup em `_plataforma.numeros_projeto.jid` → `setor` (fallback: 'comercial')
- Setup completo: `portal/SETUP-RAILWAY.md`
- 16 workflows n8n prontos em `infra/n8n/workflows/`
