# threat-model

## Purpose

Criar modelo de ameaças STRIDE para um componente, integração ou fluxo do sistema, identificando vetores de ataque, controles necessários e gaps de segurança — com ênfase em LGPD e dados pessoais de usuários.

---

## Task Definition

```yaml
task: threatModel()
responsible: Cipher (Security Architect)
atomic_layer: Organism

inputs:
  - campo: target
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Componente/fluxo a analisar (ex: 'integração webhook→n8n', 'dashboard multi-tenant', 'LLM API calls')"

  - campo: scope
    tipo: enum
    valores: [integration, component, full-flow, data-flow]
    default: integration
    obrigatório: false

outputs:
  - campo: threat_model_report
    tipo: markdown
    destino: Response
    descrição: "Análise STRIDE com ameaças, impacto, controles existentes e gaps"
```

---

## Workflow

### Passo 1 — Mapear o Fluxo de Dados

Para o target especificado, mapear:
1. Atores (usuários, sistemas externos, processos internos)
2. Fluxos de dados entre componentes
3. Pontos de confiança (trust boundaries)
4. Dados sensíveis em trânsito e em repouso
5. Autenticação/autorização em cada ponto

**Trust boundaries típicas em sistemas SaaS multi-tenant:**
- Entrada externa (canal de comunicação) → workflow de processamento
- Workflow → API de IA (dados de contexto saem para provedor externo)
- Workflow → banco de dados (dados multi-tenant)
- Browser → Dashboard → banco de dados (autenticação JWT)
- Administrador do tenant → configurações do sistema

### Passo 2 — Análise STRIDE

Para cada componente/fluxo, analisar:

| Categoria | Descrição | Pergunta-chave |
|-----------|-----------|----------------|
| **S**poofing | Falsificação de identidade | "Como garantir que requisições vêm de onde dizem vir?" |
| **T**ampering | Modificação de dados | "Como garantir que dados não foram alterados em trânsito?" |
| **R**epudiation | Negação de ação | "Temos logs para provar quem fez o quê?" |
| **I**nformation Disclosure | Vazamento de dados | "Dados sensíveis podem vazar para atores não autorizados?" |
| **D**enial of Service | Negação de serviço | "O sistema pode ser derrubado ou sobrecarregado?" |
| **E**levation of Privilege | Escalada de privilégios | "Um usuário pode agir além de suas permissões?" |

### Passo 3 — LGPD — Análise de Dados Pessoais

Identificar quais dados pessoais fluem pelo sistema:
- Dados de identificação de usuários (nome, email, telefone, etc.) → dados pessoais
- Histórico de interações e comportamento → dados pessoais
- Dados sensíveis específicos do domínio → verificar classificação LGPD
- Como esses dados são coletados, processados, armazenados, retidos e deletados?
- Base legal do tratamento (consentimento, legítimo interesse)?
- DPA (Data Processing Agreement) com os clientes está assinado?

### Passo 4 — Classificar Ameaças

Para cada ameaça identificada:
- **Risco:** CRITICAL / HIGH / MEDIUM / LOW
- **Controle Existente:** o que já mitiga essa ameaça?
- **Gap:** o que está faltando?
- **Recomendação:** ação concreta para mitigar

### Passo 5 — Formato do Report

```markdown
## Threat Model — {Target} — {Data}

### Diagrama de Fluxo de Dados
[DFD simplificado em texto/Mermaid]

### Ameaças Identificadas

| ID | Categoria | Ameaça | Risco | Controle Atual | Gap | Recomendação |
|----|-----------|--------|-------|---------------|-----|-------------|
| T1 | I | Dados de contexto expostos nos logs do sistema | HIGH | TLS em trânsito | Logs não criptografados em repouso | Ativar log sanitization, remover PII dos logs |

### Análise LGPD
[Dados pessoais envolvidos, base legal, lacunas de conformidade]

### Próximos Passos (por prioridade)
1. [CRITICAL] ...
2. [HIGH] ...
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Todas as 6 categorias STRIDE analisadas
  - [ ] Dados pessoais identificados e classificados (LGPD)
  - [ ] Ameaças com risco CRITICAL/HIGH têm recomendações acionáveis
```

---

## Metadata

```yaml
version: 1.0.0
tags: [security, threat-model, STRIDE, LGPD, security-architect]
updated_at: 2026-04-06
```
