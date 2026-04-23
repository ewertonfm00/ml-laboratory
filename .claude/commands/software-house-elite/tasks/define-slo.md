# define-slo

## Purpose

Definir SLOs (Service Level Objectives) mensuráveis para os serviços críticos do sistema, estabelecendo error budgets, alertas e os SLAs correspondentes com clientes.

---

## Task Definition

```yaml
task: defineSlo()
responsible: Orb (SRE)
atomic_layer: Organism

inputs:
  - campo: service
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Serviço a definir SLO (ex: 'entry point webhook', 'LLM response', 'dashboard', 'sistema completo')"

  - campo: context
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "Contexto adicional (SLAs contratuais existentes, volume esperado)"

outputs:
  - campo: slo_definition
    tipo: yaml
    destino: Response + squads/software-house-elite/data/slo-registry.yaml
    descrição: "SLOs definidos com métricas, targets, error budgets e alertas"
```

---

## Workflow

### Passo 1 — Identificar SLIs (Service Level Indicators)

Para o serviço especificado, definir os indicadores mensuráveis:

**Availability (Disponibilidade):**
- Porcentagem do tempo que o serviço está operacional
- `availability = (successful_requests / total_requests) * 100`

**Latency (Latência):**
- Tempo de resposta no percentil 95 (p95) e p99
- Para o sistema: tempo entre receber a requisição e entregar a resposta ao usuário final

**Error Rate (Taxa de Erro):**
- Porcentagem de requisições que resultam em erro
- `error_rate = (failed_requests / total_requests) * 100`

**Quality (Qualidade — específico para IA):**
- Taxa de respostas coerentes vs alucinações detectadas
- Taxa de respostas dentro do contexto esperado

### Passo 2 — Definir Targets

**Referências para sistemas de software house:**

| Serviço | SLI | Target SLO | Justificativa |
|---------|-----|-----------|---------------|
| Entry point (webhook) | Availability | 99.9% | Porta de entrada — crítico |
| Entry point | Latency p95 | < 5s | Experiência do usuário |
| LLM API calls | Latency p95 | < 30s | Complexidade de LLM |
| Dashboard | Availability | 99.5% | Não é caminho crítico |
| Sistema completo | Availability | 99.9% | Contrato enterprise |

### Passo 3 — Calcular Error Budget

```
Error Budget Mensal = (1 - SLO%) * total_minutes_in_month

Exemplo para SLO 99.9%:
- Total minutos/mês: 43,200
- Error Budget: 0.1% × 43,200 = 43.2 minutos/mês

Política de Error Budget:
- > 50% consumido → Congelar deploys não-críticos
- > 75% consumido → Modo de incidente: apenas fixes
- 100% consumido → Revisão obrigatória de SLO com cliente
```

### Passo 4 — Definir Alertas

Para cada SLO, definir alertas:
- **Warning:** SLO em risco (ex: availability caiu para 99.5% na última hora)
- **Critical:** SLO violado (ex: availability < 99.0%)
- **Budget:** Error budget > 50% consumido no mês

### Passo 5 — Documento do SLO

```yaml
# SLO Registry — {Sistema}

slo:
  service: "{service_name}"
  version: "1.0"
  effective_date: "{date}"
  
  slis:
    availability:
      description: "Porcentagem de requisições processadas com sucesso"
      measurement: "successful_executions / total_executions * 100"
      
    latency_p95:
      description: "Tempo de resposta para 95% das requisições"
      measurement: "p95(response_time_ms)"
  
  targets:
    availability: 99.9%
    latency_p95: 5000ms
    
  error_budget:
    monthly_minutes: 43.2
    policy:
      50_percent: "Freeze non-critical deploys"
      75_percent: "Incident mode"
      100_percent: "Emergency SLO review"
  
  alerts:
    warning:
      availability: < 99.5%
      latency_p95: > 3000ms
    critical:
      availability: < 99.0%
      latency_p95: > 5000ms
      
  sla_mapping:
    customer_commitment: "99.9% mensal"
    penalty: "Crédito de serviço conforme contrato"
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] SLIs definidos e mensuráveis
  - [ ] Targets com justificativa de negócio
  - [ ] Error budget calculado
  - [ ] Alertas definidos
  - [ ] SLO registrado em data/slo-registry.yaml
```

---

## Metadata

```yaml
version: 1.0.0
tags: [slo, sla, sre, observability, reliability]
updated_at: 2026-04-06
```
