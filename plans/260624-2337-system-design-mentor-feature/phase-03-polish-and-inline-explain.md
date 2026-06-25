# Phase 3 — Polish: Inline Explain + Progress + Notes

**Status:** pending | **Priority:** P1 | **Effort:** 2–3 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260624-2337-system-design-mentor-feature.md)
- [Plan overview](./plan.md)
- Depends on: phase 2 (mentor.ts route, chat panel must exist)

## Overview

Wire 3 polish features:
1. **Inline "Explain" button** trên properties panel (selected node) → injects pre-built prompt into mentor chat
2. **Chapter progress tracker** — mark read/unread, last-read timestamp
3. **User notes per chapter** — personal markdown notes save to D1
4. **Summary cache** — on-demand AI summary của chapter (200-word + key concepts), cached in D1

## Key Insights

- Properties panel hiện hiển thị config form per node → có thể append "Explain" CTA dưới
- Chapter progress trivial: 1 row per (user, chapter) trong D1
- Notes = textarea với markdown preview; debounced save 500ms
- Summary cache opt-in: chỉ gen khi user click "AI summarize" → tránh hidden cost

## Requirements

**Functional:**
- Selected node → "Explain in context of [current chapter]" button → opens mentor panel + injects prompt
- Chapter list shows ✓ next to read chapters + timestamp
- Each chapter has "My Notes" tab/section
- "Summarize chapter" button → cached result

**Non-functional:**
- Inline Explain → mentor response start <2s
- Notes autosave debounced 500ms, no UI block
- Summary cache lookup <50ms

## Architecture

```
apps/api/src/routes/mentor.ts        — EXTEND
  POST /mentor/explain               — preset prompt for node context
  GET  /mentor/summary/:chapterId    — returns cached or generates+caches
  POST /mentor/progress              — mark chapter read
  PUT  /mentor/notes                 — save user notes
  GET  /mentor/notes/:chapterId      — load notes

apps/api/src/db/schema/mentor.ts     — EXTEND
  chapter_progress, chapter_summary_cache (add tables)

apps/web/src/features/canvas/properties/
  explain-this-button.tsx            — NEW: button in properties panel

apps/web/src/features/learn/
  chapter-notes.tsx                  — markdown notes editor
  chapter-summary.tsx                — AI summary view
  use-chapter-progress.ts            — progress hook
```

## Related Code Files

**Create:**
- `apps/web/src/features/canvas/properties/explain-this-button.tsx`
- `apps/web/src/features/learn/chapter-notes.tsx`
- `apps/web/src/features/learn/chapter-summary.tsx`
- `apps/web/src/features/learn/use-chapter-progress.ts`
- `apps/web/src/features/learn/use-chapter-notes.ts`

**Modify:**
- `apps/api/src/routes/mentor.ts` (add 4 endpoints)
- `apps/api/src/db/schema/mentor.ts` (add 2 tables)
- `apps/api/migrations/0003_mentor_progress.sql` (new migration)
- `apps/web/src/features/canvas/properties/properties-panel.tsx` (mount ExplainButton)
- `apps/web/src/features/learn/learn-panel.tsx` (show progress ✓, link to notes)
- `apps/web/src/features/learn/chapter-viewer.tsx` (mark-as-read on scroll-end)
- `apps/web/src/features/mentor/use-mentor-chat.ts` (export `sendPresetPrompt` API)

## Implementation Steps

1. **D1 migration 0003_mentor_progress.sql**:
   ```sql
   CREATE TABLE chapter_progress (
     user_id TEXT NOT NULL REFERENCES user(id),
     chapter_id TEXT NOT NULL,
     read_at INTEGER,
     notes TEXT,
     updated_at INTEGER NOT NULL,
     PRIMARY KEY (user_id, chapter_id)
   );
   CREATE TABLE chapter_summary_cache (
     chapter_id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     summary TEXT NOT NULL,
     key_concepts TEXT NOT NULL,   -- JSON array string
     related_variants TEXT,        -- JSON array
     generated_at INTEGER NOT NULL
   );
   ```
2. **Drizzle schema update** — add 2 tables
3. **Mentor route extensions**:
   - `POST /mentor/explain { nodeId, nodeType, variant, chapterId }` → build preset prompt `"Explain why [variant] is used here in [chapter]. Reference specific section from chapter."`, append to existing thread
   - `GET /mentor/summary/:chapterId` → lookup cache; nếu miss, generate (single LLM call, 200-word system prompt), upsert, return
   - `POST /mentor/progress { chapterId, action: 'mark-read' }` → upsert row
   - `PUT /mentor/notes { chapterId, notes }` → upsert row
   - `GET /mentor/notes/:chapterId` → return notes string
4. **ExplainButton component**:
   - Visible only when 1 node selected
   - Click → resolve current chapter (from Learn panel active chapter) → call `/mentor/explain` → expand Mentor panel
5. **Chapter notes editor**:
   - Tabs trong chapter-viewer: "Content" | "My Notes"
   - Textarea + react-markdown preview side-by-side
   - Debounced save via `use-chapter-notes.ts`
6. **Chapter summary view**:
   - Top of chapter-viewer: "AI Summary" collapsible card
   - Initial state: "Generate summary (BYOK call)" button
   - After gen: show summary + key concepts as chips
7. **Progress tracker**:
   - `chapter-viewer.tsx` IntersectionObserver: when scroll reach bottom → auto mark-read
   - Manual toggle "Mark unread"
   - `learn-panel.tsx`: ✓ icon + relative timestamp ("read 2h ago")

## Todo List

- [ ] Write migration 0003_mentor_progress.sql + apply
- [ ] Update Drizzle schema with new tables
- [ ] Add 4 mentor endpoints (explain, summary, progress, notes)
- [ ] Create `explain-this-button.tsx`
- [ ] Wire ExplainButton into `properties-panel.tsx`
- [ ] Extend `use-mentor-chat.ts` với `sendPresetPrompt()` method
- [ ] Create `use-chapter-notes.ts` + `chapter-notes.tsx`
- [ ] Create `use-chapter-progress.ts`
- [ ] Add Content|MyNotes tabs trong `chapter-viewer.tsx`
- [ ] Create `chapter-summary.tsx`
- [ ] Add IntersectionObserver auto-mark-read
- [ ] Update `learn-panel.tsx` để show ✓ progress
- [ ] Manual QA full flow
- [ ] `pnpm typecheck` pass

## Success Criteria

- Select Redis node + chapter "KV Store" open → click "Explain" → mentor panel mở, response: "Redis được dùng đây vì… [chapter quote]"
- Scroll xuống cuối chapter → ✓ tự xuất hiện trong list
- Note "consistent hashing là kỹ thuật…" trong chapter X → close app → reopen → notes vẫn nguyên
- Click "Summarize" chapter URL Shortener lần đầu → ~3s; click lại → instant (cache)
- typecheck pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| ExplainButton context guess sai (which chapter?) | Show chapter selector dropdown trong button popup nếu ambiguous |
| Notes save race condition (debounce + close tab) | flush save on `beforeunload` event |
| Summary cache stale khi chapter upstream update | Add `generated_at` timestamp; UI "Regenerate" button manual |
| Auto mark-read false positive (user accidental scroll) | Threshold: scrolled >80% AND dwell >30s |

## Security Considerations

- All endpoints `requireUser` middleware
- Notes XSS risk khi render markdown → sanitize với rehype-sanitize
- Notes max length 10KB (prevent abuse)

## Next Steps

→ Phase 4: RAG with Cloudflare Vectorize. Independent of phase 3.
