# Project Kickoff Checklist

```yaml
checklist:
  id: project-kickoff
  version: 1.0.0
  created: 2026-04-22
  squad: software-house-elite
  purpose: "Validar prontidão antes de iniciar desenvolvimento com cliente externo"
  mode: blocking
  agents: [business-analyst, enterprise-architect, project-manager, dev]
```

---

## Bloco 1 — Requisitos e Escopo

```yaml
requirements:
  - id: req-001
    check: "PRD ou documento de requisitos assinado pelo cliente"
    type: blocking
    agent: business-analyst

  - id: req-002
    check: "Critérios de aceite definidos e mensuráveis para cada entrega"
    type: blocking
    agent: business-analyst

  - id: req-003
    check: "Escopo negativo documentado (o que NÃO será feito)"
    type: blocking
    agent: business-analyst

  - id: req-004
    check: "Marcos e datas de entrega acordados com cliente"
    type: blocking
    agent: project-manager
```

---

## Bloco 2 — Arquitetura e Infraestrutura

```yaml
architecture:
  - id: arch-001
    check: "Stack tecnológica definida e aprovada pelo enterprise-architect"
    type: blocking
    agent: enterprise-architect

  - id: arch-002
    check: "Diagrama de arquitetura de alto nível entregue"
    type: blocking
    agent: enterprise-architect

  - id: arch-003
    check: "Ambientes definidos: dev / staging / prod"
    type: blocking
    agent: devops

  - id: arch-004
    check: "Repositório criado com branch protection em main"
    type: blocking
    agent: devops

  - id: arch-005
    check: "Secrets e variáveis de ambiente documentadas (nunca em repositório)"
    type: blocking
    agent: security-architect
```

---

## Bloco 3 — Conformidade e Segurança

```yaml
compliance:
  - id: comp-001
    check: "DPA (Data Processing Agreement) assinado se dados de clientes envolvidos"
    type: blocking
    agent: lgpd-compliance

  - id: comp-002
    check: "Levantamento LGPD: quais dados pessoais serão tratados"
    type: blocking
    agent: lgpd-compliance

  - id: comp-003
    check: "Threat model inicial documentado para projetos com autenticação ou pagamento"
    type: recommended
    agent: security-architect
```

---

## Bloco 4 — Time e Processo

```yaml
process:
  - id: proc-001
    check: "Papéis e responsabilidades definidos (RACI simplificado)"
    type: blocking
    agent: project-manager

  - id: proc-002
    check: "Canal de comunicação com cliente definido e testado"
    type: blocking
    agent: project-manager

  - id: proc-003
    check: "Cerimônias de sprint acordadas (daily, review, retro)"
    type: recommended
    agent: project-manager

  - id: proc-004
    check: "Definition of Done acordada com cliente"
    type: blocking
    agent: project-manager
```

---

## Resultado

```markdown
## Kickoff Gate: {project_name}

**Blocking:** ___/13 passou
**Recommended:** ___/2 passou
**Agente responsável:** {project-manager}

**Decisão:**
[ ] GO — Projeto pode iniciar
[ ] NO-GO — Itens bloqueadores pendentes (listar abaixo)

Pendências:
-
```
