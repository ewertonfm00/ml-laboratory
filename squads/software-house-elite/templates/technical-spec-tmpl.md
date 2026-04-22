# Template — Especificação Técnica

```yaml
template:
  id: technical-spec
  version: 1.0.0
  created: 2026-04-22
  squad: software-house-elite
  agents: [enterprise-architect, dev, data-engineer]
  purpose: "Especificação técnica detalhada para features ou integrações complexas"
```

---

# Especificação Técnica — {Nome da Feature}

**Projeto:** {Nome}
**Story ID:** {epic}.{story}
**Autor:** {agente}
**Data:** {DD/MM/AAAA}
**Status:** Draft / Em revisão / Aprovado

---

## 1. Contexto

**Objetivo:** {O que esta feature resolve em uma frase}

**Motivação:** {Por que agora? Qual dor/oportunidade}

**Stakeholders:** {Quem será afetado ou precisa aprovar}

---

## 2. Requisitos

### Funcionais
| ID | Requisito | Prioridade |
|----|-----------|-----------|
| RF-01 | {descrição} | Must |
| RF-02 | {descrição} | Should |
| RF-03 | {descrição} | Could |

### Não Funcionais
| ID | Requisito | Critério de Aceite |
|----|-----------|-------------------|
| RNF-01 | Performance | {ex. P95 < 300ms} |
| RNF-02 | Disponibilidade | {ex. 99.5% uptime} |
| RNF-03 | Segurança | {ex. autenticação obrigatória} |

---

## 3. Design da Solução

### Diagrama de Alto Nível

```
{Diagrama ASCII ou referência para Figma/Miro}
```

### Componentes Afetados

| Componente | Mudança | Impacto |
|-----------|---------|---------|
| {módulo} | {tipo: novo/alterado/removido} | {baixo/médio/alto} |

### Decisões Arquiteturais

| Decisão | Opções Consideradas | Escolha | Motivo |
|---------|-------------------|---------|--------|
| {título} | {opção A, opção B} | {escolha} | {motivo} |

---

## 4. Schema e Dados

```sql
-- Tabelas criadas ou alteradas
{DDL das mudanças}
```

**Migrations:** `{caminho do arquivo de migration}`

**Impacto em dados existentes:** {descrever se há transformação de dados}

---

## 5. API Contract

```typescript
// Endpoints novos ou alterados
{interface ou OpenAPI snippet}
```

---

## 6. Plano de Rollout

| Fase | Ação | Rollback |
|------|------|---------|
| 1 | {deploy infra} | {reverter via terraform} |
| 2 | {deploy app} | {reverter tag anterior} |
| 3 | {migração dados} | {script de reversão} |

**Feature flag:** {nome} — desabilitar para reverter sem deploy

---

## 7. Testes

| Tipo | Cobertura esperada | Responsável |
|------|--------------------|------------|
| Unit | {módulos críticos} >= 80% | dev |
| Integration | {fluxos principais} | sdet |
| E2E | {happy path + edge cases} | sdet |

---

## 8. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|-------------|---------|-----------|
| {risco} | Alta/Média/Baixa | Alto/Médio/Baixo | {ação} |

---

*Spec elaborada por software-house-elite — AIOX v2.3.0*
