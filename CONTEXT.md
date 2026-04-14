# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-14 (workflow de onboarding criado, acesso n8n ainda bloqueado)

---

## Próximo passo imediato

**PRIORIDADE 1:** Recuperar acesso ao n8n e importar `ML-ONBOARDING-conectar-cliente.json`.

Opções para reset de senha (em ordem):
1. Testar senhas conhecidas de outros projetos
2. Railway Shell → reset via banco do n8n: `UPDATE "user" SET password = '...' WHERE role = 'owner'`
3. Último recurso: deletar volume e recriar (verificar backup antes)

---

## Pendências

### BLOQUEIO — Acesso ao n8n
- [ ] Recuperar acesso ao n8n (senha perdida, SMTP não configurado para reset)
- [ ] Após acesso: importar `infra/n8n/workflows/ML-ONBOARDING-conectar-cliente.json` (workflow novo)
- [ ] Configurar variáveis no n8n Railway: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `N8N_WEBHOOK_URL`
- [ ] Ativar workflow e copiar URL do Form Trigger para enviar ao primeiro cliente

### IDENTIFICAÇÃO DE AGENTE (Redrive)
- [ ] Verificar se Redrive envia `data.agent.name` no payload do webhook
- [ ] Alternativa: usar `/v1/crm/getbyphone` da API Redrive para buscar agente por número

### LOOKUP SETOR — Validação pendente
- [ ] Confirmar que `instance_name = 'omega-laser-locacoes'` está correto no banco
- [ ] Testar que o nó "Lookup Setor" retorna setor correto para mensagens reais

### SEED MASTER
- [ ] Usuário passa e-mail + senha → gerar SQL → executar no Railway

### MÉDIO PRAZO
- [ ] Remover workflows duplicados do n8n (importados 2x em sessão anterior)
- [ ] Deploy Metabase + Appsmith no Railway

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | Migrations 001→010 executadas |
| n8n | ⚠️ Acesso bloqueado | 16 workflows importados, senha perdida |
| Evolution API | ✅ Ativo | Webhook desativado (usa Redrive) |
| Redis | ✅ Criado | — |
| Redrive | ✅ Webhook configurado | Envia para n8n ML-CAPTURA |

## Fluxo ativo

```
Redrive → n8n ML-CAPTURA (y6kmL9RZupuZuWig) → Postgres ml_captura.mensagens_raw
```

## Contexto técnico

- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Evolution API Key: `omega-laser-evo-key-2026`
- Instância WhatsApp: `omega-laser-locacoes` (551632363666)
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: `omega-laser-locacoes` (id: 7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5)
- Agentes cadastrados: Tabata, Rodrigo, Larissa, Ewerton
