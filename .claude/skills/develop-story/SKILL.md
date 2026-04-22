---
name: develop-story
description: This skill should be used when the user asks to "implement a story", "develop feature", "code this", "desenvolver story", or activates @dev agent. Executes AIOX Story Development Cycle Phase 3.
version: 1.0.0
---

# Develop Story — @dev (Dex)

Activate when implementing a story that is in `Ready` status.

## When This Skill Applies

- User says `@dev *develop` or assigns a story to dev
- Story status is `Ready` and needs implementation
- User asks to implement a feature or fix a bug

## Execution Modes

- **Interactive (default):** 5-10 checkpoints with user
- **YOLO:** Autonomous, decisions logged
- **Pre-Flight:** All questions upfront, then zero-ambiguity execution

## Steps

1. Read story from `docs/stories/`
2. Update status `Ready → InProgress`
3. Execute task `.aiox-core/development/tasks/dev-develop-story.md`
4. Run CodeRabbit self-healing (max 2 iterations for CRITICAL)
5. Update File List and checkboxes in story
6. Hand off to `@qa` for review

## Git Operations

- `git add`, `git commit` — allowed
- `git push` — delegate to `@devops` (Gage)
