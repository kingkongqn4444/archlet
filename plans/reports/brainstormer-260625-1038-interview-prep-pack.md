# Interview Prep Pack — Brainstorm Summary

**Date:** 2026-06-25
**Owner:** kingkongqn4444

## Problem Statement

App hiện = "drawing tool with simulation". Mục tiêu pivot: trở thành **interview prep platform** cho system design + cloud roles. 4 features đóng vai trò killer differentiator vs Excalidraw/draw.io/Pramp.

## Scope: 4 Features

| # | Feature | Effort | Reuses |
|---|---|---|---|
| 1 | Mock Interview Mode | 3-4d | Mentor chat backend, templates as ground truth, rules engine, capacity calc |
| 2 | Solution Comparison Diff | 2d | 50 templates, AI for trade-off explanation |
| 3 | Spaced Repetition Review | 1.5d | chapter_progress table (just built), Learn sidebar |
| 4 | AI Hint System | 1d | Mentor chat backend |

**Total:** ~7.5–9 ngày solo.

## Feature 1: Mock Interview Mode (KILLER)

### Flow
1. User: "Practice Twitter design"
2. AI Interviewer (Anthropic): "Welcome. Tell me what we're building."
3. User clarifies → AI asks follow-up about constraints (DAU, write rate, geographies)
4. Timer starts (45min default, configurable)
5. User draws on canvas → AI watches diagram state via store snapshots (every 30s)
6. At 25min: AI nudge if missing critical components ("Have you addressed cold cache scenario?")
7. User explains design verbally via text → AI scores on rubric
8. Final scorecard:
   - **Scope clarification** (1-10)
   - **High-level design** (1-10)
   - **Deep-dive on bottleneck** (1-10)
   - **Trade-offs articulated** (1-10)
   - **Communication clarity** (1-10)
9. Transcript saved to D1

### Architecture
- New table: `mock_sessions` (id, user_id, problem_id, started_at, ended_at, scorecard JSON, transcript JSON)
- `POST /api/mentor/mock/start { problemId }` → returns sessionId, first AI message
- `POST /api/mentor/mock/turn { sessionId, userMessage, diagramSnapshot? }` → AI reply
- `POST /api/mentor/mock/finish { sessionId }` → generates scorecard
- New `MockInterviewPanel.tsx` — replaces normal mentor sidebar in mock mode
- Reuses existing Mentor chat infra

### Problem Bank (initial 20)
URL Shortener, Rate Limiter, Twitter, Instagram, WhatsApp, Uber, Netflix, YouTube, Google Drive, Spotify, Dropbox, Discord, News Feed, Notification System, Distributed Cache, Payment System, Ad Serving, Web Crawler, Search Autocomplete, Distributed Queue

(All overlap với templates → use template as canonical reference for AI grading.)

## Feature 2: Solution Comparison Diff

### Flow
1. User finishes diagram (e.g., URL Shortener)
2. Click "Compare with canonical"
3. Modal opens với 3 sections:
   - 🟢 **Matched** (node types you got right)
   - 🔴 **Missing** (canonical has, you don't) → "Canonical adds Redis Cache for hot URL lookup"
   - 🟡 **Different** (you chose X, canonical Y) → AI explains trade-off
4. Score: % node match × variant match × edge match

### Architecture
- Pure client-side diff: compare current `diagram.nodes` vs `template.diagram.nodes`
- Match by `node.type` + `variant` similarity (cosine on tags?)
- Use AI to explain non-trivial differences (1 AI call per diff, batched)
- New `SolutionDiffModal.tsx`

### Tricky: matching nodes
- Naive: by node.type
- Better: tag node "role" (cache_layer, primary_db, async_worker) — but requires user labeling
- Pragmatic: by type + first-match heuristic, let AI rationalize

## Feature 3: Spaced Repetition Review

### Flow
1. Read chapter → close → modal "How well do you understand this?" (1-5 scale)
2. SM-2 algorithm computes next review date
3. Learn sidebar shows "Due today: 3 chapters" badge
4. Click → flyout filtered to due chapters first

### Architecture
- Extend `chapter_progress` table: add `confidence` (1-5), `next_review_at`, `interval_days`, `repetition_count`
- Migration 0006_mentor_sr.sql
- `POST /api/mentor/sr/rate { chapterId, confidence }` → updates SM-2 state
- `GET /api/mentor/sr/due` → returns chapters where next_review_at <= now
- New UI: confidence dialog post-read + badge counter

### SM-2 (simplified)
```ts
function nextReview(confidence: 1-5, prevInterval: days, repetitions: number) {
  if (confidence < 3) return { interval: 1, repetitions: 0 };
  const ef = 1.3 + 0.1 * (confidence - 3); // ease factor
  const next = repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(prevInterval * ef);
  return { interval: next, repetitions: repetitions + 1 };
}
```

## Feature 4: AI Hint System

### Flow
1. Stuck during design? Click "Hint" button in toolbar
2. 3 escalating levels:
   - L1 (vague): "Think about the read/write ratio"
   - L2 (directional): "Read-heavy → consider caching layer"
   - L3 (specific): "Add Redis between App and DB, use cache-aside pattern"
3. Each hint deducts from Mock Interview scorecard if active

### Architecture
- `POST /api/mentor/hint { problemId, currentDiagramSnapshot, hintLevel: 1|2|3 }`
- AI prompt: "User is solving [problem]. Current diagram: [JSON]. Give hint at level [L] — escalating vagueness to specificity."
- Reuses Mentor chat backend; new prompt template
- UI: lightbulb icon in toolbar; popover shows hint, "More?" escalates

## Risks

| Risk | Mitigation |
|---|---|
| **AI grading inconsistent** (Mock Interview rubric) | Use Claude with explicit rubric in system prompt; show rubric to user transparently |
| Diff matching false positives (variant similarity) | Start with type-only match; iterate based on feedback |
| Spaced repetition annoying if too aggressive | Default off; user opts in; allow snooze |
| Cost (Mock Interview = many AI calls per session) | BYOK only (user pays); cap turns per session |
| Scope creep into mock real interview features | Defer voice transcription, peer matching, video |

## Out of Scope

- Voice narration + Whisper transcription (defer Phase 5)
- Peer-to-peer mock interview (matchmaking)
- Cloud cert prep quiz (separate plan if interested)
- Question bank by company (separate content lift)

## Success Metrics

- Mock Interview: complete 1 session in 45min với canonical Twitter problem
- Diff: 60% accuracy auto-detecting "missing cache layer" on URL Shortener
- SR: 3-chapter daily review takes <15min
- Hint: 90% relevance rating from user testing (1 user = self)

## Open Questions

1. **Problem bank source:** hand-curated 20 vs auto-generate from templates? Recommend hand-curated for quality
2. **Mock session timer hard or soft?** Hard = pressure (interview-like); soft = learning (recommended for solo)
3. **Diff comparison: use which template?** Multiple templates per problem (Twitter has 1 canonical only) — for now match by problemId → templateId 1:1
4. **Hint cost tracking:** display "this hint cost $0.002" or hide? Hide (avoid analysis paralysis)
5. **Confidence rating UX:** stars 1-5 vs emoji (😵🤔😐😀😎)?
