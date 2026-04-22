# Security Review Checklist

```yaml
checklist:
  id: security-review
  version: 1.0.0
  created: 2026-04-22
  squad: software-house-elite
  purpose: "Gate de segurança obrigatório antes de qualquer release em produção"
  mode: blocking
  agents: [security-architect, sdet, lgpd-compliance, devops]
```

---

## Bloco 1 — Autenticação e Autorização

```yaml
auth:
  - id: auth-001
    check: "Tokens JWT com expiração configurada (max 24h access, 7d refresh)"
    type: blocking

  - id: auth-002
    check: "Senhas com hash bcrypt ou argon2 (nunca MD5/SHA1)"
    type: blocking

  - id: auth-003
    check: "Rate limiting em endpoints de autenticação"
    type: blocking

  - id: auth-004
    check: "RBAC implementado: usuário não acessa recursos de outros usuários"
    type: blocking

  - id: auth-005
    check: "Multi-tenant: isolamento de dados entre clientes verificado"
    type: blocking
```

---

## Bloco 2 — Dados e LGPD

```yaml
data:
  - id: data-001
    check: "Dados sensíveis criptografados em repouso (AES-256)"
    type: blocking
    agent: lgpd-compliance

  - id: data-002
    check: "PII não logado em produção (CPF, email, telefone em logs)"
    type: blocking
    agent: lgpd-compliance

  - id: data-003
    check: "Política de retenção de dados implementada"
    type: recommended
    agent: lgpd-compliance

  - id: data-004
    check: "Backup e recuperação testados"
    type: blocking
    agent: devops
```

---

## Bloco 3 — Infraestrutura

```yaml
infra:
  - id: infra-001
    check: "HTTPS obrigatório em todos os endpoints (HTTP → redirect)"
    type: blocking

  - id: infra-002
    check: "Headers de segurança configurados: CSP, HSTS, X-Frame-Options"
    type: blocking

  - id: infra-003
    check: "Variáveis de ambiente sem secrets expostos em logs ou respostas"
    type: blocking

  - id: infra-004
    check: "Portas desnecessárias fechadas; acesso SSH restrito por IP"
    type: blocking
    agent: devops

  - id: infra-005
    check: "Dependências atualizadas: sem CVEs críticos (npm audit / snyk)"
    type: blocking
    agent: sdet
```

---

## Bloco 4 — Validação de Input

```yaml
input_validation:
  - id: input-001
    check: "SQL Injection: todas as queries usam prepared statements ou ORM"
    type: blocking

  - id: input-002
    check: "XSS: outputs sanitizados, CSP configurado"
    type: blocking

  - id: input-003
    check: "Upload de arquivos: tipo e tamanho validados, armazenados fora do webroot"
    type: blocking
```

---

## Resultado

```markdown
## Security Review Gate: {project_name}

**Blocking:** ___/17 passou
**Recommended:** ___/1 passou

**Decisão:**
[ ] APPROVED — Nenhum issue crítico
[ ] CONDITIONAL — Issues documentados, aceitos com risco registrado
[ ] BLOCKED — Corrigir antes do release

Issues encontrados:
| ID | Severidade | Descrição | Responsável |
|----|-----------|-----------|------------|
|    |           |           |            |
```
