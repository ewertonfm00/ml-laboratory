# Coding Standards — software-house-elite

```yaml
config:
  id: coding-standards
  version: 1.0.0
  created: 2026-04-22
  squad: software-house-elite
  applies_to: [dev, sdet, frontend-specialist, n8n-dev]
```

---

## Linguagens e Tipagem

- **TypeScript strict** em todo código novo — `"strict": true` no tsconfig
- Sem `any` implícito — use `unknown` e type guards quando necessário
- Interfaces para contratos públicos, types para unions e utilitários
- Enums apenas quando o valor é constante de negócio — prefira `const` objects

## Nomenclatura

| Contexto | Convenção | Exemplo |
|---------|-----------|---------|
| Variáveis / funções | camelCase | `getUserById` |
| Classes / interfaces | PascalCase | `UserRepository` |
| Constantes globais | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Arquivos | kebab-case | `user-repository.ts` |
| Diretórios | kebab-case | `use-cases/` |
| Env vars | UPPER_SNAKE | `DATABASE_URL` |

## Estrutura de Arquivos

```
src/
├── app/          # Next.js App Router (se frontend)
├── modules/      # Domínios de negócio (user, product, billing...)
│   └── {domain}/
│       ├── domain/       # Entidades e value objects
│       ├── application/  # Use cases
│       ├── infra/        # Repositórios, adapters
│       └── api/          # Controllers / route handlers
├── shared/       # Utilitários, helpers, tipos globais
└── lib/          # Integrações externas (stripe, twilio...)
```

## Funções e Módulos

- Funções com uma responsabilidade — se precisar de comentário para explicar, divide
- Máximo 40 linhas por função — acima disso, extrai
- Sem side effects em funções puras — separar queries de mutations
- Imports absolutos sempre: `@/modules/user` nunca `../../modules/user`

## Comentários

- Sem comentários que explicam O QUÊ — o código deve ser autoexplicativo
- Comentários apenas para O POR QUÊ: decisão não óbvia, workaround, constraint
- JSDoc em funções de API pública do módulo — não em uso interno

## Error Handling

- Erros de domínio como classes tipadas: `class UserNotFoundError extends AppError`
- Nunca `catch (e) {}` silencioso — log ou rethrow
- HTTP status codes semânticos: 400 (input), 401 (auth), 403 (perm), 404 (not found), 409 (conflict)
- Respostas de erro com estrutura padrão: `{ error: { code, message, details? } }`

## Banco de Dados

- Migrations versionadas — nunca alterar migration já aplicada em produção
- RLS (Row Level Security) obrigatório no Supabase para dados multi-tenant
- Índices para toda FK e campo usado em WHERE ou ORDER BY frequente
- Transactions para operações que envolvem múltiplas tabelas

## Testes

- Nomear testes como: `should {comportamento} when {condição}`
- Arrange / Act / Assert — sem lógica de negócio nos testes
- Mocks apenas para I/O externo (banco, API, email) — nunca para lógica de domínio
- Fixtures em arquivos separados: `tests/fixtures/user.ts`
