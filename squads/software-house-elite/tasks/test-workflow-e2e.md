# test-workflow-e2e

## Purpose

Testar um workflow do sistema de ponta a ponta — do trigger até o output final — garantindo que cada node processa corretamente e que as integrações (LLM, APIs externas, Redis, Supabase) funcionam como esperado.

---

## Task Definition

```yaml
task: testWorkflowE2e()
responsible: Nix (n8n Dev)
atomic_layer: Organism

inputs:
  - campo: workflow_id
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Workflow a testar (ex: WF01, WF05, ou nome completo)"

  - campo: test_mode
    tipo: enum
    valores: [manual-trigger, simulated-webhook, real-message]
    origem: User Input
    default: simulated-webhook

  - campo: test_scenario
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "Cenário a testar (ex: 'primeira requisição de usuário', 'entrada com dados incompletos')"

outputs:
  - campo: test_report
    tipo: markdown
    destino: Response
    descrição: "Resultado de cada cenário: PASS/FAIL por node e integração"
```

---

## Workflow

### Passo 1 — Definir Cenários de Teste

Para o workflow especificado, elicitar ou definir cenários representativos:

**Cenários genéricos para qualquer workflow de entrada:**
- Cenário 1: Requisição nova de usuário desconhecido (estado inicial)
- Cenário 2: Requisição de usuário em estado intermediário (continuação de fluxo)
- Cenário 3: Requisição duplicada (dedup Redis deve bloquear)
- Cenário 4: Sistema inativo (não deve processar, ou resposta específica)
- Cenário 5: Comando administrativo de controle

**Cenários para workflows de processamento:**
- Cenário 1: Entrada com dados completos — fluxo happy path
- Cenário 2: Entrada com dados incompletos — tratamento de erro
- Cenário 3: Entrada que aciona transição de estado
- Cenário 4: Entrada vazia ou mal formatada

### Passo 2 — Preparar Ambiente de Teste

**Verificações pré-teste:**
- [ ] Workflow alvo está ativo no n8n
- [ ] Variáveis de ambiente estão corretas no ambiente de deploy
- [ ] Redis acessível e com estado limpo para o recurso de teste
- [ ] Recurso de teste configurado (ou payload simulado)
- [ ] APIs externas (LLM, etc.) com créditos disponíveis

**Limpar estado Redis para o recurso de teste:**
```javascript
// Code node temporário ou via Redis CLI:
DEL conv:{tenantId}:{resourceIdTest}
SET bot:active:{tenantId} "true"  // Ativar para o teste
```

### Passo 3 — Executar Testes

**Modo: simulated-webhook (recomendado para desenvolvimento)**
```
1. Abrir n8n UI → Workflow alvo
2. Clicar no node Webhook Trigger → "Listen for Test Event"
3. Enviar payload via cURL ou Postman:
   curl -X POST {n8n_url}/webhook/{trigger-path} \
     -H "Content-Type: application/json" \
     -d '{"event": "trigger_event", "data": {...payload de teste...}}'
4. Observar execução no n8n UI em tempo real
5. Verificar cada node: input, output, erros
```

**Modo: manual-trigger (para workflows cron ou sem webhook)**
```
1. Abrir workflow no n8n UI
2. Clicar "Execute Workflow" (botão play)
3. Observar execução
```

**Modo: real-message (smoke test em produção)**
```
1. Usar recurso de teste dedicado (não recurso real de cliente)
2. Enviar entrada via canal real
3. Observar execução no n8n → Executions
4. Verificar resposta recebida no canal de saída
5. ATENÇÃO: não usar em produção com dados reais sem supervisão
```

### Passo 4 — Verificar Resultados por Node

Para cada node na execução:
- PASS: node executou, output está no formato esperado
- FAIL: node falhou ou output inesperado
- WARN: node executou mas com dados suspeitos

**Checkpoints críticos:**
- [ ] Trigger: payload recebido corretamente?
- [ ] Dedup: entrada nova passou? Duplicata bloqueada?
- [ ] Leitura Redis: retornou o status correto?
- [ ] Switch de roteamento: branch correto ativado?
- [ ] Chamada sub-workflow: HTTP 200? Payload correto?
- [ ] LLM API: resposta coerente? Dentro do timeout configurado?
- [ ] API externa: resposta recebida? Status 200?
- [ ] Redis escrita: estado atualizado corretamente?
- [ ] Banco de dados: dados persistidos se necessário?

### Passo 5 — Documentar Resultado

```markdown
## Test Report — {WorkflowName} — {Date}

### Cenários Testados
| Cenário | Status | Notas |
|---------|--------|-------|
| Entrada inicial | PASS | Response em 4.2s |
| Entrada duplicada | PASS | Dedup bloqueou corretamente |
| Sistema inativo | FAIL | Workflow ainda processou — Redis não estava setado |

### Issues Encontrados
1. [CRÍTICO] Sistema inativo não bloqueia processamento → ver fix-webhook-issue.md
2. [MÉDIO] Latência LLM p95 = 8s, acima do target de 5s

### Próximos Passos
- Abrir bug para issue #1: workflow não verifica status do sistema
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Todos os cenários definidos foram executados
  - [ ] Resultado documentado (PASS/FAIL por cenário)
  - [ ] Issues encontrados registrados em pendencias.md
  - [ ] Estado Redis limpo após testes (não contaminar produção)
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Cenário "happy path" passa sem intervenção manual
  - [ ] Todos os nodes críticos executam com sucesso
  - [ ] Resposta chega ao usuário final (ou payload correto para sub-workflow)
  - [ ] Nenhum continueOnFail mascarando falha real
```

---

## Metadata

```yaml
version: 1.0.0
tags: [n8n, testing, e2e, workflow, validation]
updated_at: 2026-04-06
```
