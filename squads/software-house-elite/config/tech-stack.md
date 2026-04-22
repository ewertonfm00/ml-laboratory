# Tech Stack Padrão — software-house-elite

```yaml
config:
  id: tech-stack
  version: 1.0.0
  created: 2026-04-22
  squad: software-house-elite
  purpose: "Stack default para novos projetos — adaptar conforme restrições do cliente"
```

---

## Frontend

| Camada | Tecnologia | Versão | Notas |
|--------|-----------|--------|-------|
| Framework | Next.js (App Router) | 14+ | SSR + RSC por padrão |
| UI Components | shadcn/ui + Radix | latest | Copy-paste, sem lock-in |
| Estilização | Tailwind CSS | 3+ | Design tokens via CSS vars |
| Estado global | Zustand | 4+ | Apenas para estado cross-route |
| Formulários | React Hook Form + Zod | latest | Validação schema-first |
| Data fetching | TanStack Query | 5+ | Cache + revalidação automática |
| Testes | Playwright (E2E) + Vitest | latest | |

## Backend

| Camada | Tecnologia | Versão | Notas |
|--------|-----------|--------|-------|
| Runtime | Node.js | 20 LTS | |
| Framework | Fastify | 4+ | Performance > Express |
| ORM | Drizzle | latest | Type-safe, lightweight |
| Validação | Zod | 3+ | Schema compartilhado front/back |
| Auth | Supabase Auth | latest | JWT + RLS nativo |
| Queue | BullMQ + Redis | latest | Jobs assíncronos |
| Testes | Vitest + Supertest | latest | |

## Banco de Dados

| Uso | Tecnologia | Notas |
|-----|-----------|-------|
| Principal | PostgreSQL via Supabase | RLS + Realtime |
| Cache / Queue | Redis (Railway) | TTL curto para sessões |
| Full-text search | pgvector / Supabase | Embeddings quando necessário |

## Infraestrutura

| Componente | Tecnologia | Notas |
|-----------|-----------|-------|
| Deploy Backend | Railway | Zero-config, auto-scale |
| Deploy Frontend | Vercel | Edge network, ISR |
| Storage | Supabase Storage | CDN + signed URLs |
| Email | Resend | API simples, templates React |
| SMS / WhatsApp | Evolution API | Self-hosted no Railway |
| Monitoramento | Sentry | Erros + performance |
| Logs | Railway Logs + Sentry | |

## Automação e IA

| Uso | Tecnologia | Notas |
|-----|-----------|-------|
| Workflows | n8n (self-hosted) | Railway |
| LLM | Claude API (Anthropic) | claude-sonnet-4-6 default |
| Embeddings | OpenAI text-embedding-3-small | Ou Supabase AI |

## DevOps

| Componente | Tecnologia | Notas |
|-----------|-----------|-------|
| CI/CD | GitHub Actions | Lint + test + deploy |
| Qualidade | CodeRabbit | Pre-PR review |
| Secrets | GitHub Secrets + Railway Env | Nunca no repositório |
| Versionamento | Semantic Versioning | MAJOR.MINOR.PATCH |

---

## Decisão de Adaptação

> Desviar do stack padrão requer documentação explícita em `docs/architecture/`:

```markdown
## Desvio de Stack: {componente}
**Padrão:** {tecnologia padrão}
**Adotado:** {tecnologia alternativa}
**Motivo:** {constraint técnica, preferência do cliente, limitação de licença}
**Aprovado por:** @enterprise-architect
```
