---
name: deploy-push
description: This skill should be used when the user asks to "push code", "create PR", "deploy", "fazer push", "publicar", or activates @devops agent. Handles all git push and GitHub PR operations exclusively.
version: 1.0.0
---

# Deploy & Push — @devops (Gage)

Activate when code needs to be pushed or a PR created. This agent has EXCLUSIVE authority over all push operations.

## When This Skill Applies

- Any agent needs to push code (delegate here)
- User says `@devops *push` or asks to create a PR
- CI/CD pipeline management needed
- Release management

## Exclusive Operations

- `git push` / `git push --force`
- `gh pr create` / `gh pr merge`
- MCP add/remove/configure
- CI/CD pipeline management
- Release management

## Workflow

1. Receive handoff from `@dev` or `@qa`
2. Verify QA gate PASS status
3. Run final `git status` check
4. Execute `git push`
5. Create PR via `gh pr create` with conventional commit format
6. Monitor CI checks

## Convention

```
feat: description [Story X.Y]
fix: description [Story X.Y]
chore: description
```
