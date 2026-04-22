---
name: validate-story
description: This skill should be used when the user asks to "validate a story", "review story draft", "story approval", or activates @po agent with *validate-story-draft. Runs the 10-point AIOX validation checklist.
version: 1.0.0
---

# Validate Story — @po (Pax)

Activate when validating a Draft story before development begins.

## When This Skill Applies

- User says `@po *validate-story-draft`
- A story is in `Draft` status and needs GO/NO-GO decision
- User asks to approve or reject a story

## 10-Point Checklist

1. Clear and objective title
2. Complete description
3. Testable acceptance criteria (Given/When/Then)
4. Well-defined scope (IN and OUT)
5. Dependencies mapped
6. Complexity estimate
7. Business value clear
8. Risks documented
9. Definition of Done
10. Alignment with PRD/Epic

## Decision

- **GO (>=7/10):** Update status `Draft → Ready`, hand to `@dev`
- **NO-GO (<7/10):** Return to `@sm` with required fixes listed
