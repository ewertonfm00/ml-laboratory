# ML Laboratory — Squads

Laboratório de Inteligência Aplicada a Negócios | Projeto Machine Learning

---

## Arquitetura em Dois Níveis

```
NÍVEL 2 — Squads de Construção (constroem a ferramenta)
│
├── ml-plataforma-squad     Infraestrutura, Railway, Redis, Postgres, deploy
├── ml-captura-squad        Coleta dados brutos (WhatsApp, áudio, eventos)
├── ml-data-eng-squad       ETL, schema design, classificação com IA
├── ml-ia-padroes-squad     Extração de padrões, análise comportamental
└── ml-skills-squad         Geração e validação de skills de agentes

        ↓ constroem e alimentam ↓

NÍVEL 1 — Squads Operacionais (rodam o laboratório por área)
│
├── ml-comercial-squad      🟢 ATIVO — WhatsApp + Evolution API + Redrive
├── ml-operacional-squad    🟡 Planejado — Processos internos, SLA
├── ml-financeiro-squad     🟡 Planejado — Fluxo de caixa, inadimplência
├── ml-atendimento-squad    🟡 Planejado — Pós-venda, tickets, churn
├── ml-marketing-squad      🟡 Planejado — Campanhas, engajamento
└── ml-pessoas-squad        🟡 Planejado — Performance, onboarding, turnover
```

---

## Isolamento de Projetos

Todos os recursos usam prefixo `ml-` / `ml_` / `ml:` para isolamento total:

| Recurso | Padrão | Exemplo |
|---------|--------|---------|
| Postgres schemas | `ml_*` | `ml_comercial`, `ml_captura` |
| Redis keys | `ml:*` | `ml:comercial:analise:uuid` |
| n8n workflows | `[ML-*]` | `[ML-COMERCIAL] Análise` |
| Railway services | `ml-*` | `ml-captura`, `ml-plataforma` |
| Evolution API | `/ml/*` | `/ml/webhook/whatsapp` |

---

## Blueprint Master

`.designs/ml-master-blueprint.yaml` — arquitetura completa com dependências, ordem de execução e estratégia de isolamento.

---

## Squad Comercial — Agentes (prioridade 1)

| Agente | Função |
|--------|--------|
| `conversation-analyst` | Analisa conversas, extrai padrões e score |
| `behavioral-profiler` | Mapeia estilo de cada vendedor |
| `product-approach` | Combina dados técnicos com abordagem validada |
| `objection-handler` | Cataloga objeções e respostas que converteram |
| `training-generator` | Gera treinamento baseado em casos reais |
| `performance-reporter` | Relatórios e recomendações por vendedor/produto |

---

## Ordem de Execução (Fase 1)

```
1. ml-plataforma-squad  →  Setup Railway + Postgres + Redis
2. ml-captura-squad     →  Webhook Evolution API + n8n + Groq Whisper
3. ml-data-eng-squad    →  Schema ml_comercial + pipeline ETL
4. ml-ia-padroes-squad  →  Padrões de conversas comerciais
5. ml-skills-squad      →  Skills dos agentes comerciais
6. ml-comercial-squad   →  Operação com dados reais
```
