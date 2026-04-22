---
name: brownfield-discovery
description: This skill should be used when the user asks to "assess existing code", "technical debt analysis", "brownfield", "analisar código legado", or activates @architect for legacy assessment. Runs 10-phase technical debt evaluation.
version: 1.0.0
---

# Brownfield Discovery — @architect (Aria)

Activate when assessing an existing codebase for technical debt or integration planning.

## When This Skill Applies

- User asks to analyze existing code for debt
- Joining an existing project for the first time
- User requests architecture assessment

## 10 Phases

**Data Collection (1-3):**
1. @architect → `system-architecture.md`
2. @data-engineer → `SCHEMA.md` + `DB-AUDIT.md`
3. @ux-design-expert → `frontend-spec.md`

**Draft & Validation (4-7):**
4. @architect → `technical-debt-DRAFT.md`
5. @data-engineer → `db-specialist-review.md`
6. @ux-design-expert → `ux-specialist-review.md`
7. @qa → QA Gate (APPROVED | NEEDS WORK)

**Finalization (8-10):**
8. @architect → `technical-debt-assessment.md` (final)
9. @analyst → `TECHNICAL-DEBT-REPORT.md` (executive)
10. @pm → Epic + stories ready for development

## Output

Full assessment in `docs/` — feeds into `@pm *create-epic`.
