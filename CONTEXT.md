# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-14 (pipeline de captura ativado e testado)

---

## Próximo passo imediato

Verificar com Redrive se há forma de identificar o agente no payload do webhook.
Enquanto isso, o @dev deve fazer varredura completa de inconsistências no projeto.

---

## Pendências

### CRÍTICO — Lookup Setor ainda pode falhar
- [ ] O nó "Lookup Setor" no n8n busca setor por `session_id` via JOIN com `instancias_evolution`
- [ ] Se o `instance_name` não bater exatamente, retorna vazio e para a execução
- [ ] Validar que `instance_name = 'omega-laser-locacoes'` está correto no banco
- [ ] Verificar se há inconsistências entre o JSON do workflow e o schema do banco

### IDENTIFICAÇÃO DE AGENTE
- [ ] Redrive não envia agente no payload do webhook (payload idêntico à Evolution API)
- [ ] Amanhã verificar no Redrive se há configuração de "operador/agente" no webhook
- [ ] Alternativa: usar `/v1/crm/getbyphone` da API Redrive para buscar agente por número

### SEED MASTER
- [ ] Usuário passa e-mail + senha desejada → gerar SQL → executar no Railway

### MÉDIO PRAZO
- [ ] Remover workflows duplicados do n8n (foram importados 2x por erro de importação anterior)
- [ ] Deploy Metabase + Appsmith no Railway
- [ ] Configurar domínios

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | Migrations 001→010 executadas |
| n8n | ✅ Ativo | 16 workflows importados, ML-CAPTURA ativo (ID: y6kmL9RZupuZuWig) |
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
