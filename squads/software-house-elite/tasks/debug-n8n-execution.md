# debug-n8n-execution

## Purpose

Debugar uma execução específica do n8n (identificada por exec ID ou por sintoma), extrair o diagnóstico de cada node e propor correção.

---

## Task Definition

```yaml
task: debugN8nExecution()
responsible: Nix (n8n Dev)
atomic_layer: Organism

inputs:
  - campo: exec_id
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "ID da execução no n8n UI (ex: 1352)"

  - campo: symptom
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "Sintoma observado (ex: 'WF05 nunca é chamado', 'webhook não recebe')"

  - campo: workflow_id
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "ID ou nome do workflow afetado (ex: WF01, WF05)"

outputs:
  - campo: diagnosis_report
    tipo: markdown
    destino: Response
    descrição: "Diagnóstico com root cause, node problemático e plano de correção"
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Pelo menos um de: exec_id, symptom ou workflow_id deve ser fornecido
    blocker: true
  - [ ] Acesso ao n8n UI disponível para inspeção de execuções
    blocker: false
    nota: "Se não disponível, trabalhar com logs e contexto fornecido pelo usuário"
```

---

## Workflow

### Passo 1 — Coletar Contexto

Se `exec_id` fornecido:
- Solicitar ao usuário que acesse a URL de execuções no n8n
- Pedir screenshot ou output JSON de cada node na execução
- Identificar o **último node executado com sucesso** e o **primeiro que falhou ou não executou**

Se apenas `symptom`:
- Mapear o sintoma ao fluxo de execução esperado do sistema
- Identificar em qual ponto do fluxo o sintoma se manifesta

### Passo 2 — Diagnóstico por Camadas

**Camada 1 — Trigger/Webhook:**
- Verificar se o workflow de entrada recebe a requisição (execution exists?)
- Verificar payload do webhook: campos obrigatórios presentes?
- Verificar deduplicação: mensagem já processada anteriormente?

**Camada 2 — Lógica de Roteamento (Switch):**
- Verificar nodes de roteamento: estão lendo estado corretamente?
- Confirmar qual branch está sendo ativado
- Confirmar que `continueOnFail: true` **NÃO** está ocultando erro no Switch

**Camada 3 — Chamada entre Workflows (HTTP Request):**
- Verificar node de chamada entre workflows:
  - URL usada está correta (interna ou pública)?
  - HTTP status retornado: 200? 404? 500? timeout?
  - Body da requisição está correto?
  - `continueOnFail: true` está mascarando falha aqui?

**Camada 4 — Workflow Destino:**
- Sub-workflow tem execução registrada?
- Se não executou: URL do webhook está correta?
- Se executou mas falhou: em qual node? LLM API? Redis? Supabase? API externa?

### Passo 3 — Identificar Root Cause

Categorizar o problema em uma das classes:
- **ROUTING**: Switch enviando para branch errado
- **WEBHOOK_URL**: URL interna incorreta ou não acessível
- **SILENT_FAILURE**: `continueOnFail: true` escondendo erro real
- **REDIS_STATE**: Estado no Redis incorreto
- **PAYLOAD**: Dados mal formatados na requisição entre workflows
- **EXTERNAL_API**: Falha em API externa (LLM, mensageria, banco de dados)
- **DEDUP**: Mensagem sendo descartada pela deduplicação
- **NETWORK**: Problema de rede interna entre serviços

### Passo 4 — Propor Correção

Para cada root cause identificado, propor:
1. **Fix imediato** (o que mudar no node agora)
2. **Verificação** (como confirmar que o fix funcionou)
3. **Prevenção** (como evitar que o problema se repita)

---

## Checklist de Anti-Patterns

Ao inspecionar qualquer workflow, verificar:
- [ ] `continueOnFail: true` em nodes críticos (HTTP Request, Redis, LLM API)
- [ ] URLs hardcoded que deveriam ser variáveis de ambiente
- [ ] Falta de node "Error Handler" no final do workflow
- [ ] Ausência de tratamento do caso em que Redis retorna vazio/null
- [ ] Switch com branches não cobrindo todos os estados possíveis
- [ ] Falta de logging no início e fim de cada workflow crítico

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Root cause identificado com evidências
  - [ ] Plano de correção proposto com passos específicos
  - [ ] Anti-patterns identificados no workflow auditado
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Diagnóstico nomeia o node específico que está falhando
  - [ ] Root cause categorizado em uma das classes definidas
  - [ ] Correção proposta é executável (passos concretos no n8n UI)
  - [ ] Verificação de sucesso definida (como confirmar que funcionou)
```

---

## Exemplos de Uso

```
*debug-workflow 1352
→ Inspeciona execução 1352 do n8n, identifica que node de chamada ao sub-workflow
  falhou com 404 porque URL interna estava incorreta

*fix-webhook WF01
→ Analisa WF01, identifica Switch enviando para branch errado
  porque estado Redis estava como "undefined"
```

---

## Metadata

```yaml
version: 1.0.0
tags: [n8n, debug, workflow, webhook, routing]
updated_at: 2026-04-06
```
