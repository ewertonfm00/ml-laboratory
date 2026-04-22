# Source Tree Padrão — software-house-elite

```yaml
config:
  id: source-tree
  version: 1.0.0
  created: 2026-04-22
  squad: software-house-elite
  purpose: "Estrutura de diretórios padrão para projetos fullstack Next.js + API"
```

---

## Monorepo (projeto fullstack único)

```
{project-name}/
│
├── apps/
│   ├── web/                    # Next.js App Router
│   │   ├── app/
│   │   │   ├── (auth)/         # Grupo de rotas com layout de auth
│   │   │   ├── (dashboard)/    # Grupo de rotas protegidas
│   │   │   ├── api/            # Route Handlers (BFF)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   └── {feature}/      # Componentes de domínio
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilitários, clientes de API
│   │   └── public/
│   │
│   └── api/                    # Fastify API (se separado do Next)
│       ├── src/
│       │   ├── modules/
│       │   │   └── {domain}/
│       │   │       ├── domain/
│       │   │       ├── application/
│       │   │       ├── infra/
│       │   │       └── routes/
│       │   ├── shared/
│       │   │   ├── errors/
│       │   │   ├── middlewares/
│       │   │   └── utils/
│       │   └── server.ts
│       └── tests/
│
├── packages/
│   ├── database/               # Drizzle schema + migrations
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   └── migrations/
│   │   └── drizzle.config.ts
│   │
│   ├── shared-types/           # Tipos compartilhados front/back
│   └── ui/                     # Design system (se reutilizado)
│
├── docs/
│   ├── architecture/           # Decisões arquiteturais (ADRs)
│   ├── api/                    # OpenAPI / Swagger
│   └── runbooks/               # Operação e incidentes
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, test, typecheck
│       └── deploy.yml          # Deploy por ambiente
│
├── .env.example                # Todas as vars necessárias, sem valores
├── docker-compose.yml          # Ambiente local (Redis, Postgres)
├── turbo.json                  # Turborepo config (se monorepo)
└── package.json
```

---

## Projeto Simples (Next.js fullstack)

```
{project-name}/
│
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   └── {feature}/
│   ├── modules/                # Lógica de negócio por domínio
│   │   └── {domain}/
│   │       ├── actions.ts      # Server Actions
│   │       ├── queries.ts      # Database queries
│   │       └── types.ts
│   ├── lib/
│   │   ├── db/                 # Drizzle client e schema
│   │   ├── auth/               # Supabase Auth helpers
│   │   └── utils/
│   └── hooks/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                    # Playwright
│
├── supabase/
│   └── migrations/
│
├── .env.example
└── package.json
```

---

## Regras de Organização

- **Um módulo por domínio** — `user/`, `billing/`, `product/` — sem misturar
- **Server vs Client explícito** — `'use client'` apenas quando necessário
- **Sem barrel exports (index.ts)** em módulos internos — imports explícitos
- **Tests co-localizados** para unit tests — `user.service.test.ts` ao lado de `user.service.ts`
- **E2E separado** — `tests/e2e/` na raiz, nunca dentro de `src/`
