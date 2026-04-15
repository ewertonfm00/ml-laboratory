# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-15 (pipeline Redrive→n8n em configuração final)

---

## Próximo passo imediato

**PRIORIDADE 1:** Abrir chatflow novo no Redrive e enriquecer o body do bloco de integração com variáveis reais do contexto (telefone, mensagem, nome do contato).

Body alvo no tree-builder:
```json
{
  "source": "redrive",
  "telefone": "{{contact.phone}}",
  "nome_contato": "{{contact.name}}",
  "mensagem": "{{message.text}}",
  "timestamp": "{{createdate}}",
  "bot_uuid": "7cdb13fe-44c5-4e8b-b842-44e9c8fddeba"
}
```

Após configurar: publicar → enviar mensagem real → capturar payload no n8n → adaptar nó "Normalizar Payload".

---

## Pendências

### PIPELINE DE CAPTURA — configuração final
- [ ] Adicionar variáveis reais no body do bloco de integração do chatflow Redrive
- [ ] Publicar chatflow e testar com mensagem real pelo WhatsApp 1632363666
- [ ] Capturar payload bruto no n8n e adaptar nó "Normalizar Payload" para formato Redrive
- [ ] Validar inserção em `ml_captura.mensagens_raw`

### IDENTIFICAÇÃO DE AGENTE
- [ ] Verificar quais variáveis o Redrive expõe no contexto do chatflow (especialmente agente/atendente)
- [ ] Mapear campo do agente no body e no nó Normalizar Payload

### LOOKUP SETOR — Validação pendente
- [ ] Confirmar que `instance_name = 'omega-laser-locacoes'` está correto no banco
- [ ] Testar que o nó "Lookup Setor" retorna setor correto para mensagens reais

### APPSMITH — validação visual
- [ ] Acessar portal e validar as 4 páginas visualmente
- [ ] Ativar queries com `Run on page load` onde necessário
- [ ] Popular dados de teste — agentes, skills, perfis DISC

### SEED MASTER
- [ ] Usuário passa e-mail + senha → gerar SQL → executar no Railway

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | 12 migrations executadas (001→012) |
| n8n | ✅ Ativo | 20 workflows, 17 ativos — ML-CAPTURA publicado |
| Evolution API | ✅ Ativo | 3 instâncias criadas, nenhuma conectada (número usa Redrive) |
| Appsmith | ✅ Ativo | 4 páginas + 15 queries criadas |
| Metabase | ✅ Ativo | — |
| Redrive | ✅ Webhook disparando | Body chegando incompleto — pendente enriquecimento |

## Arquitetura de Captura Atual

```
WhatsApp 1632363666 → Redrive chatflow
  → Bloco Requisição POST
    → n8n ML-CAPTURA (eM0qnKGXShlOuCsV)
      → Normalizar Payload → Postgres ml_captura.mensagens_raw
```

**Importante:**
- Número 1632363666 exclusivo no Redrive — NÃO conectar na Evolution API própria
- Webhook global Redrive NÃO dispara para mensagens recebidas — usar bloco Requisição no chatflow
- Nó Groq Whisper corrigido: authentication=none, usa `$vars.ML_GROQ_API_KEY`
- API Key n8n: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (gerada 2026-04-15)

## Contexto técnico

- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- n8n: `ewertonfm00@gmail.com` / `Senha1234`
- Evolution API Key: `ml-evo-key-2026`
- Instância WhatsApp banco: `omega-laser-locacoes` (551632363666)
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: `omega-laser-locacoes` (id: 7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5)
- Agentes cadastrados: Tabata, Rodrigo, Larissa, Ewerton
- Redrive: `ewerton@omegalaser.com.br` / `Solo@2026` | Bot UUID 1632363666: `7cdb13fe-44c5-4e8b-b842-44e9c8fddeba`
