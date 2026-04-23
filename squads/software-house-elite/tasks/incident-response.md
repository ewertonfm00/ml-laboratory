# incident-response

## Purpose

Conduzir e documentar a resposta a um incidente ativo no sistema — desde a detecção até a resolução e postmortem — garantindo comunicação clara, ações coordenadas e aprendizado pós-incidente.

---

## Task Definition

```yaml
task: incidentResponse()
responsible: Orb (SRE)
atomic_layer: Organism

inputs:
  - campo: severity
    tipo: enum
    valores: [P1, P2, P3]
    origem: User Input
    obrigatório: true
    descrição: "P1=crítico (sistema down), P2=degradado, P3=funcionalidade parcial"

  - campo: description
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Descrição do incidente observado"

  - campo: affected_services
    tipo: array
    origem: User Input
    obrigatório: false
    descrição: "Serviços afetados (ex: workflow de entrada, dashboard, API externa)"

outputs:
  - campo: incident_report
    tipo: markdown
    destino: docs/incidents/
    descrição: "Relatório completo do incidente com timeline, ações e lições"
```

---

## Severity Matrix

| Severity | Definição | Response Time | Escalation |
|----------|-----------|---------------|-----------|
| **P1** | Sistema completamente down (clientes sem atendimento) | Imediato | Time técnico + stakeholders em < 15min |
| **P2** | Funcionalidade crítica degradada (>50% das requisições falhando) | < 30min | Time técnico em < 30min |
| **P3** | Funcionalidade parcial (feature específica com problemas) | < 4h | Resolver no próximo sprint |

---

## Workflow

### FASE 1 — Detecção e Triagem (0-15min para P1)

```
1. Confirmar o incidente: é real ou falso positivo?
2. Classificar severity (P1/P2/P3)
3. Identificar serviços afetados
4. Abrir incident log (este documento)
5. Notificar stakeholders conforme severity
6. Designar Incident Commander
```

**Verificações rápidas do sistema:**
- n8n está respondendo? (URL do n8n abre?)
- Serviços de deploy estão up? (verificar painel de deploy)
- Redis está acessível? (verificar via n8n node de teste)
- APIs externas estão operacionais? (verificar status pages dos provedores)
- Serviço de IA com créditos/quota? (verificar console do provedor)

### FASE 2 — Contenção (15-60min para P1)

**Ações de mitigação imediata:**
- Identificar o componente específico falhando
- Isolar o problema (qual serviço? qual tenant?)
- Aplicar workaround temporário se disponível:
  - Serviço de automação com erro: pausar workflows para não processar com erro
  - n8n down: verificar auto-restart no ambiente de deploy, force restart se necessário
  - API de IA down: verificar status do provedor

### FASE 3 — Investigação e Resolução

```
1. Coletar evidências: logs n8n, plataforma de deploy, Redis, banco de dados
2. Timeline do incidente: quando começou? o que mudou antes?
3. Identificar root cause (ver debug-n8n-execution.md se envolver n8n)
4. Aplicar fix
5. Verificar resolução: sistema voltou ao normal?
6. Monitorar por 30min após fix
```

### FASE 4 — Comunicação

**Para P1/P2 — Comunicar com clientes afetados:**
- Notificação inicial: "Estamos cientes do problema e trabalhando na resolução"
- Update a cada 30min (P1) ou 1h (P2)
- Notificação de resolução: "Sistema normalizado às HH:MM"

### FASE 5 — Postmortem (dentro de 48h para P1/P2)

```markdown
## Postmortem — {Incidente} — {Data}

**Severity:** P{N}
**Duração:** {inicio} → {fim} ({X minutos})
**Impacto:** {N clientes afetados, N transações perdidas}

### Timeline
| Hora | Evento |
|------|--------|
| HH:MM | Incidente detectado |
| HH:MM | Causa raiz identificada |
| HH:MM | Fix aplicado |
| HH:MM | Sistema normalizado |

### Root Cause
[Descrição técnica da causa raiz]

### O que funcionou bem
- ...

### O que pode melhorar
- ...

### Action Items
| Ação | Responsável | Prazo |
|------|------------|-------|
| Adicionar alerta para {X} | Orb | Sprint N+1 |
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Incidente resolvido ou mitigado
  - [ ] Incident log criado em docs/incidents/
  - [ ] Stakeholders notificados sobre resolução
  - [ ] Postmortem agendado (P1/P2) ou dispensado (P3)
```

---

## Metadata

```yaml
version: 1.0.0
tags: [incident, sre, reliability, on-call]
updated_at: 2026-04-06
```
