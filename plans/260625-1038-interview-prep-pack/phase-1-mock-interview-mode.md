# Phase 1 — Mock Interview Mode

**Status:** pending | **Priority:** P0 | **Effort:** 3-4d

## Context
- [Brainstorm](../reports/brainstormer-260625-1038-interview-prep-pack.md)
- Depends on: Mentor Phase 2 UI (chat sidebar must exist), Templates as canonical answers

## Goal

AI-driven mock interview: pick problem → timer → AI interviewer asks questions, watches diagram, scores rubric.

## Architecture

### D1
```sql
CREATE TABLE mock_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,          -- key into problems-catalog
  template_id TEXT,                  -- canonical template ref
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  transcript TEXT NOT NULL DEFAULT '[]', -- JSON [{role, content, ts, diagramSnapshot?}]
  scorecard TEXT                     -- JSON {scope, hld, deep, tradeoffs, comms, overall}
);
CREATE INDEX idx_mock_user ON mock_sessions(user_id, started_at);
```

### Problem catalog
`packages/shared/src/problems-catalog.ts` — 20 entries:
```ts
type Problem = {
  id: string;             // url-shortener
  title: string;          // "Design URL Shortener"
  difficulty: "easy" | "medium" | "hard";
  templateId: string;     // canonical template for scoring
  defaultDuration: number; // minutes (45)
  rubric: {               // per-axis hints for AI grading
    scope: string[];      // ["clarified read/write ratio", "asked DAU"]
    hld: string[];        // ["LB", "App layer", "Cache", "DB"]
    deep: string[];       // ["hot key handling", "URL collision"]
    tradeoffs: string[];  // ["base62 vs UUID", "Postgres vs DynamoDB"]
    comms: string[];      // ["explained why caching", "discussed scale"]
  };
};
```

### API
- `POST /api/mentor/mock/start { problemId, duration? }` → creates session, returns first AI msg
- `POST /api/mentor/mock/turn { sessionId, message, diagramSnapshot? }` → AI reply + nudge if needed
- `POST /api/mentor/mock/finish { sessionId, byokKey }` → AI scores transcript+final diagram, returns scorecard
- `GET /api/mentor/mock/sessions` → list past sessions
- `GET /api/mentor/mock/:id` → load session detail

### Web UI
- `apps/web/src/features/mock-interview/`
  - `mock-panel.tsx` — replaces mentor sidebar in mock mode
  - `timer-bar.tsx` — countdown header
  - `start-modal.tsx` — pick problem, duration
  - `scorecard-modal.tsx` — final result
  - `use-mock-session.ts` — state machine: idle | active | finishing | done

## TODO

- [ ] migration 0006_mock_interview.sql
- [ ] Drizzle schema mockSessions
- [ ] problems-catalog.ts (20 entries hand-curated)
- [ ] mentor.ts routes /mock/*
- [ ] AI prompts: interviewer (turn-by-turn), grader (rubric scoring)
- [ ] mock-panel.tsx + sub-components
- [ ] use-mock-session.ts hook
- [ ] Timer with pause/resume
- [ ] Diagram snapshot every 30s during active session (auto-saved to transcript)
- [ ] Scorecard modal with rubric breakdown
- [ ] typecheck + smoke test 1 session end-to-end

## Risks

| Risk | Mitigation |
|---|---|
| AI grading inconsistent | Strict rubric in system prompt; show user the rubric upfront |
| Long sessions = high cost | BYOK only; cap 20 turns per session |
| Diagram snapshot bloat | Compress to {nodes:[{id,type,variant}], edges:[{source,target}]}; drop config |
| Timer pause exploit (look up answers) | Track total elapsed time; show "pauses: 2" in scorecard |
