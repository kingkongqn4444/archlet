# Phase 4 — AI Hint System

**Status:** pending | **Priority:** P1 | **Effort:** 1d

## Context
- [Brainstorm](../reports/brainstormer-260625-1038-interview-prep-pack.md)
- Depends on: Mentor Phase 2 backend (✅ done); composes with Phase 1 Mock Interview

## Goal

Stuck during design → click "Hint" lightbulb → 3 escalating hints (vague → directional → specific). Each hint deducts from Mock Interview scorecard if active session.

## Architecture

### API
- `POST /api/mentor/hint { problemId, diagramSnapshot, hintLevel: 1|2|3, byokKey }`
  - Builds prompt:
    > "User is solving [problemId]. Current diagram: [compressed JSON]. Provide a hint at level [L] of 3. Level 1 = vague concept nudge (1 sentence). Level 2 = directional (2 sentences, name a category like 'caching'). Level 3 = specific (name the exact pattern + 1 reason). DO NOT give the full solution."
  - Returns: `{ hint: string, level: 1|2|3, suggestedNext?: boolean }`
- Log hint use in mock_sessions transcript if active session (Phase 1 hook)

### Web UI
- `apps/web/src/features/hint/hint-popover.tsx` — lightbulb icon in toolbar
- Click → popover shows L1 hint + "More specific" button
- Click "More" → L2; click again → L3 (terminal)
- Disabled if already shown L3 for current problem state

### Hint cost tracking (optional polish)
- Hide per-hint cost from UI (avoid paralysis)
- Sum total hint count per mock session in scorecard: "Hints used: 2 → -10 pts"

## TODO

- [ ] /api/mentor/hint endpoint
- [ ] Prompt template for escalating hints
- [ ] hint-popover.tsx component
- [ ] Lightbulb icon in canvas toolbar
- [ ] Integrate with Mock Interview state (track hint count per session)
- [ ] localStorage cache: `hint-{problemId}-{diagramHash}-L{n}` → avoid repeat AI cost when user reopens
- [ ] typecheck + smoke test: 3 hint levels on URL Shortener

## Risks

| Risk | Mitigation |
|---|---|
| Hint reveals too much at L1 | Strict system prompt with examples; show user the level definition |
| User spams hints to game system | Track hint count; surface in scorecard |
| AI hallucinates pattern that doesn't fit problem | Pass canonical templateId as ground truth in prompt context |
| No clear "level reset" when diagram changes significantly | Hash diagram structure; invalidate cached hints on hash change |

## Composability

- **With Phase 1 (Mock Interview):** hint count decrements scorecard
- **With Phase 2 (Diff):** after diff shows "missing cache", user can click hint for guidance — close the loop
- **With Phase 3 (SR):** hint usage on chapter X = low confidence → schedule sooner review
