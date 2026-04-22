---
name: qa-gate
description: This skill should be used when the user asks to "run QA", "review code quality", "qa gate", "validar qualidade", or activates @qa agent. Executes AIOX QA Gate with 7 quality checks.
version: 1.0.0
---

# QA Gate — @qa (Quinn)

Activate when a story in `InProgress` needs quality review before merge.

## When This Skill Applies

- User says `@qa *qa-gate {storyId}`
- Story implementation is complete and needs QA approval
- User asks for code review or quality check

## 7 Quality Checks

1. **Code review** — patterns, readability, maintainability
2. **Unit tests** — coverage adequate, all passing
3. **Acceptance criteria** — all met per story AC
4. **No regressions** — existing functionality preserved
5. **Performance** — within acceptable limits
6. **Security** — OWASP basics verified
7. **Documentation** — updated if necessary

## Verdicts

- **PASS** — Approve, proceed to `@devops` push
- **CONCERNS** — Approve with observations documented
- **FAIL** — Return to `@dev` with specific feedback
- **WAIVED** — Approve with waiver documented (rare)

## QA Loop

Max 5 iterations: `@qa review → @dev fixes → re-review`
