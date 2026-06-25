# Phase 3 — Spaced Repetition Review

**Status:** pending | **Priority:** P1 | **Effort:** 1.5d

## Context
- [Brainstorm](../reports/brainstormer-260625-1038-interview-prep-pack.md)
- Depends on: chapter_progress table (✅ built in Mentor Phase 3 backend), Learn sidebar (✅ built)

## Goal

SM-2 spaced repetition: after reading chapter, user rates confidence 1-5 → system schedules next review (1d / 3d / 7d / 14d / 30d). Due-today badge in Learn sidebar.

## Architecture

### D1 schema extension
```sql
ALTER TABLE chapter_progress ADD COLUMN confidence INTEGER;       -- 1-5
ALTER TABLE chapter_progress ADD COLUMN next_review_at INTEGER;
ALTER TABLE chapter_progress ADD COLUMN interval_days INTEGER DEFAULT 1;
ALTER TABLE chapter_progress ADD COLUMN repetitions INTEGER DEFAULT 0;
```

Migration: 0007_sr.sql

### SM-2 algorithm
```ts
// packages/shared/src/sr-algorithm.ts
export function nextReview(confidence: 1|2|3|4|5, prevInterval: number, repetitions: number) {
  if (confidence < 3) {
    // Reset
    return { interval: 1, repetitions: 0, nextAt: Date.now() + 86_400_000 };
  }
  const ef = Math.max(1.3, 1.3 + 0.1 * (confidence - 3));
  const interval = repetitions === 0 ? 1
    : repetitions === 1 ? 6
    : Math.round(prevInterval * ef);
  return {
    interval,
    repetitions: repetitions + 1,
    nextAt: Date.now() + interval * 86_400_000,
  };
}
```

### API
- `POST /api/mentor/sr/rate { chapterId, confidence }` → upsert, return next review date
- `GET /api/mentor/sr/due` → list of chapters where next_review_at <= now

### Web UI
- `apps/web/src/features/learn/confidence-dialog.tsx` — modal after reading chapter
- `apps/web/src/features/learn/use-sr-due.ts` — hook fetching due chapters
- Update `learn-panel.tsx`:
  - Badge: "🔔 3 due" if due > 0
  - Sort chapters: due first, then unread, then read

## TODO

- [ ] migration 0007_sr.sql
- [ ] Drizzle schema extend chapterProgress
- [ ] packages/shared/src/sr-algorithm.ts (pure SM-2)
- [ ] POST /api/mentor/sr/rate
- [ ] GET /api/mentor/sr/due
- [ ] confidence-dialog.tsx
- [ ] use-sr-due.ts hook
- [ ] Update learn-panel.tsx: due badge + sort
- [ ] Wire confidence dialog after chapter open (track "opened" timestamp, show dialog after 30s+)
- [ ] typecheck + smoke test: rate 1 chapter, verify next-review computed

## Risks

| Risk | Mitigation |
|---|---|
| User feels nagged | Default off; opt-in toggle in settings; snooze button |
| Confidence rating inflation | Show explanation: "1=blank, 3=hesitant, 5=teach others"; cap upgrades per session |
| Reading time fake (open and close immediately) | Require 30s dwell before showing rating dialog |
