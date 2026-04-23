# create-workflow

## Purpose

Criar um novo workflow n8n seguindo os padrões de arquitetura do projeto: naming, error handling, Redis state, segurança de secrets e integração com os workflows existentes.

---

## Task Definition

```yaml
task: createWorkflow()
responsible: Nix (n8n Dev)
atomic_layer: Organism

inputs:
  - campo: workflow_name
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Nome do workflow (ex: WF11-ProcessamentoReativacao)"

  - campo: purpose
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "O que o workflow faz e quando é ativado"

  - campo: trigger_type
    tipo: enum
    valores: [webhook, cron, manual, sub-workflow]
    origem: User Input
    obrigatório: true

  - campo: integrations
    tipo: array
    valores: [claude, messaging-api, redis, supabase, google-calendar, http-external]
    origem: User Input
    obrigatório: false

outputs:
  - campo: workflow_spec
    tipo: markdown
    destino: Response
    descrição: "Especificação do workflow: nodes, conexões, configurações"

  - campo: workflow_json
    tipo: json
    destino: File (_temp/)
    persistido: true
    descrição: "JSON do workflow pronto para importar no n8n"
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Nome único e seguindo a convenção WF{NN}-{NomePascalCase}
  - [ ] Propósito definido claramente
  - [ ] Tipo de trigger definido
```

---

## Workflow

### Passo 1 — Levantamento de Requisitos

Elicitar do usuário (se não fornecido):
1. **Trigger:** Como o workflow é iniciado? (webhook externo, cron, chamado por outro WF)
2. **Inputs esperados:** Que dados chegam no trigger?
3. **Outputs esperados:** O que o workflow produz? (resposta ao usuário, atualização no banco, chamada a outro WF?)
4. **Integrações necessárias:** LLM/Claude? Redis? Supabase? API de mensageria?
5. **Estado:** Precisa ler/escrever estado no Redis?
6. **Error handling:** O que fazer se falhar? Notificar? Retry? Ignorar?

### Passo 2 — Design da Estrutura

Propor estrutura de nodes seguindo o padrão do projeto:

```
[Trigger] → [Log Start] → [Validar Input] → [Ler Estado Redis?]
    ↓
[Lógica Principal]
    ↓
[Integração Externa (LLM/API de mensageria/Supabase)]
    ↓
[Atualizar Estado Redis?]
    ↓
[Log End] → [Resposta/Output]
    ↓
[Error Handler] (conectado a todos os nodes críticos)
```

### Passo 3 — Padrões Obrigatórios

**Naming:**
- Workflow: `WF{NN}-{NomePascalCase}` (ex: `WF11-ProcessamentoReativacao`)
- Nodes: nomes descritivos (ex: "Buscar Contexto Redis", "Chamar LLM")
- Webhook path: `/webhook/sub/{wf-id}` (sub-workflows) ou `/webhook/{trigger-name}` (externos)

**Secrets via Environment Variables:**
```javascript
// No Code node ou HTTP Request:
const apiKey = $env.API_KEY;
const supabaseUrl = $env.SUPABASE_URL;
const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY;
// NUNCA hardcode de secrets em nodes
```

**Error Handler (obrigatório em todo workflow):**
- Conectar um node "Error Handler" ao final
- Logar o erro com contexto: workflow ID, execution ID, node que falhou, payload
- Para workflows críticos: notificar via Redis flag ou Supabase log

**continueOnFail — regra:**
- `continueOnFail: true` APENAS em nodes onde a falha é esperada e tratada explicitamente
- Em nodes críticos (LLM API, API de mensageria, Supabase escrita): `continueOnFail: false`
- Sempre verificar `$node['nome'].error` quando continueOnFail estiver ativo

**Integração LLM (Claude):**
```json
{
  "node": "HTTP Request",
  "name": "Chamar LLM",
  "parameters": {
    "url": "https://api.anthropic.com/v1/messages",
    "method": "POST",
    "headers": {
      "x-api-key": "={{ $env.ANTHROPIC_API_KEY }}",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    "body": {
      "model": "claude-sonnet-4-6",
      "max_tokens": 1024,
      "messages": [...]
    }
  }
}
```

### Passo 4 — Gerar JSON do Workflow

Gerar o JSON completo do workflow no formato n8n para importação.
Salvar em `_temp/{workflow_name}.json`.

### Passo 5 — Instruções de Deploy

Fornecer:
1. Como importar o JSON no n8n UI
2. Variáveis de ambiente necessárias no ambiente de deploy
3. Como ativar o workflow (toggle ativo/inativo)
4. Como registrar o novo workflow ID em `_temp/workflow_id_mapping.json`
5. Teste inicial: como validar que o trigger funciona

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Especificação do workflow documentada
  - [ ] JSON gerado e salvo em _temp/
  - [ ] Padrões obrigatórios aplicados (naming, secrets, error handler)
  - [ ] Instruções de deploy fornecidas
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Workflow segue convenção de naming WF{NN}-{Nome}
  - [ ] Nenhum secret hardcoded — todos via $env
  - [ ] Error handler presente
  - [ ] continueOnFail usado apenas onde adequado com tratamento explícito
  - [ ] JSON válido para importação no n8n
```

---

## Metadata

```yaml
version: 1.0.0
tags: [n8n, workflow, creation, patterns]
updated_at: 2026-04-06
```
