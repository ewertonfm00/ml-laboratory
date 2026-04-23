# fix-webhook-issue

## Purpose

Diagnosticar e corrigir problemas de webhook e roteamento nos workflows n8n do projeto. Cobre: webhooks não recebendo, roteamento para workflow errado, URL interna inacessível, payload mal formatado.

---

## Task Definition

```yaml
task: fixWebhookIssue()
responsible: Nix (n8n Dev)
atomic_layer: Organism

inputs:
  - campo: workflow_affected
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Workflow com problema (ex: WF01, WF05)"

  - campo: symptom
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Descrição do sintoma (ex: 'WF05 nunca executa', 'webhook retorna 404')"

  - campo: exec_id
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "ID de execução para inspecionar"

outputs:
  - campo: fix_report
    tipo: markdown
    destino: Response
    descrição: "Root cause, fix aplicado, verificação de sucesso"
```

---

## Workflow

### Passo 1 — Classificar o Problema

**Tipo A — Webhook externo não recebe:**
- O workflow está ativo no n8n?
- URL do webhook está apontando para o workflow correto?
- Ambiente correto (produção vs staging)?
- Verificar URL pública do n8n: `{n8n_url}/webhook/{trigger-path}`

**Tipo B — Sub-workflow não é chamado:**
- Verificar o node de chamada ao sub-workflow no workflow principal
- URL interna: `http://n8n:5678/webhook/sub/{wf-id}` — acessível?
- Alternativa: URL pública `{n8n_url}/webhook/sub/{id}`
- Sub-workflow está com o webhook ativo (trigger node ativado)?

**Tipo C — Roteamento errado (Switch node):**
- Verificar Switch: qual valor de estado está chegando?
- Estado no Redis está sendo lido corretamente?
- Branches do Switch cobrem todos os casos possíveis?

**Tipo D — continueOnFail mascarando erro:**
- Identificar nodes com `continueOnFail: true` no caminho crítico
- Verificar `$node['NomeNode'].error` ou similar
- Adicionar IF node para checar `$node['...'].error` e tratar explicitamente

### Passo 2 — Diagnóstico Específico por Sintoma

**"Sub-workflow nunca executa quando workflow principal recebe mensagem":**
```
1. Verificar exec do workflow principal — está executando?
2. Se sim: no output do node de chamada:
   - Qual HTTP status retornado?
   - Qual URL foi usada?
   - continueOnFail: true → o erro está sendo silenciado?
3. Testar URL manualmente:
   - Execute o node de chamada isolado
   - Se 404: sub-workflow não está ativo ou ID errado
   - Se connection refused: URL interna não funciona — usar URL pública
   - Se timeout: problema de rede interna
```

**"Workflow principal não está recebendo requisições":**
```
1. Verificar serviço externo: webhook configurado?
2. URL do webhook aponta para o workflow correto?
3. Workflow está ativo no n8n? (toggle ligado)
4. Testar webhook manualmente via cURL ou Postman
5. Verificar logs do serviço externo para erros de entrega
```

**"Switch roteia para branch errada":**
```
1. Inspecionar output do node antes do Switch
2. Qual valor de 'estado' está chegando?
3. Verificar leitura do Redis: o estado está sendo deserializado corretamente?
4. Null/undefined no Redis → verificar valor default no Code node
```

### Passo 3 — Aplicar o Fix

**Fix para URL interna (caso mais comum):**
```javascript
// Substitua no node de chamada ao sub-workflow:
// DE: http://n8n:5678/webhook/sub/{id}
// PARA: {N8N_PUBLIC_URL}/webhook/sub/{id}
// OU configure via variável de ambiente N8N_INTERNAL_URL
```

**Fix para continueOnFail silenciando erro:**
```
1. Desabilitar continueOnFail no node crítico
2. Adicionar nó Error Handler conectado ao nó crítico
3. OU adicionar IF node após o crítico verificando $node['...'].error
```

**Fix para Switch com branch faltando:**
```
1. Identificar o valor de estado que não tem branch
2. Adicionar branch no Switch para esse valor
3. Adicionar branch "default" para valores inesperados
```

### Passo 4 — Verificação

Após o fix:
1. Enviar requisição de teste pelo canal real ou via teste manual do n8n
2. Verificar que o workflow principal executa E que o sub-workflow também executa
3. Verificar resposta chegando corretamente ao usuário final
4. Documentar o fix em `docs/pendencias.md` (marcar como resolvido)

---

## Checklist de Verificação Pós-Fix

- [ ] Execução de ponta a ponta bem-sucedida
- [ ] Nenhum `continueOnFail` ocultando erros no caminho crítico
- [ ] URL testada e funcionando
- [ ] Estado Redis sendo lido/escrito corretamente
- [ ] Resposta chegando ao usuário final

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Root cause identificado e documentado
  - [ ] Fix aplicado no n8n
  - [ ] Verificação end-to-end executada
  - [ ] pendencias.md atualizado
```

---

## Metadata

```yaml
version: 1.0.0
tags: [n8n, webhook, routing, fix, debug]
updated_at: 2026-04-06
```
