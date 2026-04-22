---
name: spec-pipeline
description: This skill should be used when the user asks to "create a spec", "write requirements", "spec pipeline", "especificação técnica", or activates @pm agent for complex features. Transforms requirements into executable specs.
version: 1.0.0
---

# Spec Pipeline — @pm (Morgan)

Activate when a complex feature needs a formal specification before development.

## When This Skill Applies

- User says `@pm *spec` or requests a feature spec
- Feature complexity score >= 9 (STANDARD or COMPLEX)
- User asks for requirements gathering or PRD

## Complexity Classes

| Score | Class | Phases |
|-------|-------|--------|
| <= 8  | SIMPLE | gather → spec → critique (3 phases) |
| 9-15  | STANDARD | All 6 phases |
| >= 16 | COMPLEX | 6 phases + revision cycle |

## 6 Phases

1. **Gather** (@pm) — `requirements.json`
2. **Assess** (@architect) — `complexity.json`
3. **Research** (@analyst) — `research.json`
4. **Write Spec** (@pm) — `spec.md`
5. **Critique** (@qa) — `critique.json`
6. **Plan** (@architect) — `implementation.yaml`

## Output

Spec saved to `docs/` — ready for `@sm *draft` to create stories.
