---
name: create-story
description: This skill should be used when the user asks to "create a story", "draft a story", "new story", "criar story", or activates @sm agent. Guides the Story Development Cycle Phase 1 using AIOX task create-next-story.md.
version: 1.0.0
---

# Create Story — @sm (River)

Activate this skill when creating development stories for the Omega Laser project.

## When This Skill Applies

- User says `@sm *create-story` or `@sm *draft`
- User asks to create a new story from an epic
- User wants to start development on a feature

## Execution

1. Read the active epic from `docs/stories/epics/`
2. Execute task `.aiox-core/development/tasks/create-next-story.md`
3. Save story as `docs/stories/{epicNum}.{storyNum}.story.md`
4. Set status to `Draft`
5. Hand off to `@po` for validation

## Output

Story file with: title, description, acceptance criteria, scope (IN/OUT), dependencies, complexity estimate, business value, risks, definition of done.
