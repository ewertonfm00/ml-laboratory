# audit-workflow

## Purpose

Auditar um workflow n8n em busca de anti-patterns de confiabilidade, segurança e manutenibilidade.
Produz relatório de issues com severidade e recomendações de correção.

---

## Task Definition

```yaml
task: auditWorkflow()
responsible: Nix (n8n Dev)
atomic_layer: Organism

inputs:
  - campo: workflow_id
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "ID ou nome do workflow a auditar (ex: WF01, WF05, ou nome completo)"

  - campo: scope
    tipo: enum
    valores: [full, quick, security-only, error-handling-only]
    padrão: full
    obrigatório: false
    descrição: "Escopo da auditoria"

outputs:
  - campo: audit_report
    tipo: markdown
    destino: Response
    descrição: "Relatório com issues categorizados por severidade e recomendações"
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] workflow_id identificado
    blocker: true
  - [ ] JSON do workflow disponível (via n8n UI export ou arquivo local)
    blocker: false
    nota: "Se não disponível, auditar com base no contexto do projeto e sintomas relatados"
```

---

## Workflow

### Passo 1 — Coletar Workflow JSON

Se disponível, solicitar export do workflow em JSON via n8n UI:
- Abrir workflow → menu (⋯) → Download

Caso contrário, trabalhar com o mapeamento em `config/tech-stack.md` e `docs/architecture/`.

---

### Passo 2 — Auditoria de Anti-Patterns

Verificar **todos** os seguintes itens:

#### Bloco A — Error Handling (CRÍTICO)

| Check | Severidade se falhar |
|-------|---------------------|
| `continueOnFail: true` em nodes HTTP Request | CRITICAL |
| `continueOnFail: true` em nodes Redis | HIGH |
| `continueOnFail: true` em nodes de IA/LLM | HIGH |
| `continueOnFail: true` em nodes de banco de dados | HIGH |
| Ausência de node "Error Handler" no final | HIGH |
| Erros não logados antes de continuar | MEDIUM |

#### Bloco B — Segurança e Secrets (CRÍTICO)

| Check | Severidade se falhar |
|-------|---------------------|
| Credentials hardcoded em Code nodes | CRITICAL |
| API keys em variáveis de texto | CRITICAL |
| URLs com tokens em query params | HIGH |
| Dados pessoais (nome, telefone) logados sem mascaramento | HIGH |
| Ausência de validação de payload de entrada | MEDIUM |

#### Bloco C — Roteamento e Lógica (HIGH)

| Check | Severidade se falhar |
|-------|---------------------|
| Switch sem branch default/fallback | HIGH |
| IF sem branch false tratado | MEDIUM |
| Condições baseadas em campos que podem ser undefined | HIGH |
| Estado Redis assumido como não-nulo sem verificação | HIGH |
| URLs hardcoded que deveriam ser env vars | MEDIUM |

#### Bloco D — Nomeação e Manutenibilidade (MEDIUM)

| Check | Severidade se falhar |
|-------|---------------------|
| Nodes com nome genérico ("HTTP Request", "Code", "Node 1") | LOW |
| Ausência de anotações nos nodes complexos | LOW |
| Workflow sem nome descritivo conforme padrão WF{NN}-{Nome} | LOW |
| IDs de sub-workflows hardcoded (devem vir de env var) | MEDIUM |

#### Bloco E — Performance e Confiabilidade (MEDIUM)

| Check | Severidade se falhar |
|-------|---------------------|
| Ausência de timeout em HTTP Requests | MEDIUM |
| Sem retry em chamadas externas críticas | LOW |
| Deduplicação ausente em workflows de entrada | HIGH |
| Loop sem limite de iterações | HIGH |

---

### Passo 3 — Categorizar Issues

Para cada issue encontrado:

```yaml
issue:
  node: "Nome do node problemático"
  severidade: CRITICAL | HIGH | MEDIUM | LOW
  categoria: error-handling | security | routing | naming | performance
  descrição: "O que está errado"
  recomendação: "Como corrigir"
  exemplo_correto: "Snippet de código ou configuração correta (se aplicável)"
```

---

### Passo 4 — Emitir Relatório

Estrutura do relatório:

```markdown
## Auditoria: {workflow_id} — {data}

### Resumo
- CRITICAL: N issues
- HIGH: N issues
- MEDIUM: N issues
- LOW: N issues
- Score de saúde: X/100

### Issues Críticos e High (ação obrigatória)
...

### Issues Medium e Low (recomendados)
...

### Próximos Passos
1. {fix mais urgente}
2. {fix seguinte}
```

---

## Checklist de Conclusão

```yaml
post-conditions:
  - [ ] Todos os 5 blocos auditados
  - [ ] Cada issue tem severidade, categoria e recomendação
  - [ ] Score de saúde calculado
  - [ ] Próximos passos priorizados
```

---

## Exemplos de Uso

```
*audit-workflow WF01
→ Auditoria completa do Entry Point — encontra continueOnFail em node crítico,
  Switch sem fallback, e nomes genéricos em 3 nodes

*audit-workflow WF05 --scope=error-handling-only
→ Foca apenas em error handling do workflow — verifica nodes críticos
```

---

## Metadata

```yaml
version: 1.0.0
tags: [n8n, audit, anti-patterns, quality, security]
created_at: 2026-04-09
related_agents: [n8n-dev, sdet, security-architect]
```
