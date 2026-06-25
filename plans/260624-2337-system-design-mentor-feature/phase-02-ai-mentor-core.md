# Phase 2 — AI Mentor Core (Chat + BYOK + D1 + History)

**Status:** pending | **Priority:** P0 | **Effort:** 3–4 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260624-2337-system-design-mentor-feature.md)
- [Plan overview](./plan.md)
- Depends on: phase 1 (chapter catalog cần exist để chat reference)

## Overview

Add AI chat sidebar tab, BYOK config UI, Cloudflare Workers proxy route `/mentor/chat` (streaming SSE), D1 tables for history. Pass current chapter markdown + current diagram JSON + history vào context. NO RAG (defer phase 4).

## Key Insights

- Stack đã có Better-Auth → user_id available qua session
- Cloudflare Workers SSE streaming: dùng `TransformStream` + `Response` với `Content-Type: text/event-stream`
- 30s timeout hard limit → cap response tokens 4K, abort nếu quá
- BYOK key lưu localStorage encrypted với passphrase user nhập 1 lần; in-memory decrypt khi cần
- LLM SDK: dùng raw `fetch()` Anthropic Messages API hoặc OpenAI Chat Completions — no SDK overhead trong Workers

## Requirements

**Functional:**
- User setup BYOK key (Anthropic hoặc OpenAI) qua settings panel
- Chat sidebar panel, streaming responses
- Conversation persist per (user_id, diagram_id, chapter_id)
- Switch diagram/chapter → load matching thread
- Token count display realtime

**Non-functional:**
- First token <2s
- Full response <30s (Workers limit)
- Cost guardrail: max 4K output tokens per call
- History query <100ms (D1 with index)

## Architecture

```
apps/api/src/routes/mentor.ts          — NEW Cloudflare Workers route
  POST /mentor/chat        — SSE streaming proxy
  GET  /mentor/history     — load thread by diagramId + chapterId
  DELETE /mentor/thread/:id — clear thread

apps/api/src/db/schema/mentor.ts       — Drizzle schema
  mentor_chats, chapter_progress (chapter_summary_cache defer to phase 3)

apps/web/src/features/mentor/
  ├── mentor-panel.tsx              — chat sidebar tab #3
  ├── chat-message.tsx              — markdown message bubble
  ├── chat-input.tsx                — textarea + send
  ├── byok-config.tsx               — settings dialog
  ├── use-mentor-chat.ts            — SSE consumer + state
  ├── use-byok-key.ts               — localStorage encrypted key
  └── encrypt-key.ts                — passphrase-based AES-GCM
```

## Related Code Files

**Create:**
- `apps/api/src/routes/mentor.ts`
- `apps/api/src/db/schema/mentor.ts`
- `apps/api/migrations/0002_mentor.sql` (or whatever next number)
- `apps/web/src/features/mentor/{mentor-panel,chat-message,chat-input,byok-config,use-mentor-chat,use-byok-key,encrypt-key}.{ts,tsx}`

**Modify:**
- `apps/api/src/index.ts` (mount mentor route)
- `apps/api/wrangler.toml` (no new bindings — D1 đã có)
- `apps/web/src/features/canvas/` (add Mentor tab to sidebar — Patterns | Learn | Mentor)

## Implementation Steps

1. **D1 migration**: tạo `0002_mentor.sql`:
   ```sql
   CREATE TABLE mentor_chats (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES user(id),
     diagram_id TEXT,
     chapter_id TEXT,
     messages TEXT NOT NULL,        -- JSON [{role, content, ts, tokens}]
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL
   );
   CREATE INDEX idx_chats_user_diag ON mentor_chats(user_id, diagram_id);
   CREATE INDEX idx_chats_user_chap ON mentor_chats(user_id, chapter_id);
   ```
   Apply: `pnpm -F @archlet/api wrangler d1 migrations apply DB --local` + remote
2. **Drizzle schema** `db/schema/mentor.ts` mirror table định nghĩa
3. **Mentor route** `routes/mentor.ts`:
   - Body: `{ chapterId, diagramId?, messages, key, provider }`
   - Build context: system prompt + chapter markdown (fetch GH raw) + diagram JSON + history (last 10 messages)
   - Call Anthropic Messages API stream (`stream: true`)
   - Pipe upstream chunks → SSE `data: {delta}\n\n`
   - On end: save full conversation vào `mentor_chats`
   - Error handling: 429 → backoff; 401 → "Invalid BYOK key"
4. **Encrypt key util** `encrypt-key.ts`:
   - Web Crypto API: `crypto.subtle.deriveKey(PBKDF2, passphrase) → AES-GCM`
   - Functions: `encryptKey(plaintext, passphrase)`, `decryptKey(ciphertext, passphrase)`
   - Store ciphertext + IV in localStorage; passphrase trong sessionStorage (lost on tab close = ask again)
5. **BYOK config dialog** `byok-config.tsx`:
   - Modal mở từ settings: provider select (anthropic/openai), key input, passphrase input
   - Validate key bằng cách gửi test request `/mentor/chat` với 1 char prompt
6. **Mentor panel** `mentor-panel.tsx`:
   - Sidebar tab thứ 3 trong canvas sidebar
   - Header: chapter selector dropdown (default = chapter active từ Learn panel)
   - Message list + input
   - On open: fetch `/mentor/history?diagramId=X&chapterId=Y` → restore
7. **Streaming consumer** `use-mentor-chat.ts`:
   - `fetch('/mentor/chat', {method: POST, body, signal})` → reader.read() loop
   - Parse SSE chunks, append to current message
   - On abort/error → keep partial message, allow retry
8. **Wire Mentor tab** vào canvas sidebar.

## Todo List

- [ ] Write D1 migration 0002_mentor.sql + apply local + remote
- [ ] Add Drizzle schema `db/schema/mentor.ts`
- [ ] Create `apps/api/src/routes/mentor.ts` skeleton + mount in index.ts
- [ ] Implement `POST /mentor/chat` non-streaming first (verify Anthropic call works)
- [ ] Convert to SSE streaming
- [ ] Save conversation to D1 on stream end
- [ ] Implement `GET /mentor/history`
- [ ] Create `encrypt-key.ts` util + unit test
- [ ] Create `use-byok-key.ts` hook
- [ ] Create `byok-config.tsx` modal
- [ ] Create `chat-message.tsx` + `chat-input.tsx` components
- [ ] Create `use-mentor-chat.ts` SSE consumer
- [ ] Create `mentor-panel.tsx` sidebar tab
- [ ] Wire Mentor tab vào canvas
- [ ] Manual QA: full happy path (set key → chat → close tab → reopen → history persists)
- [ ] Add "Token usage" footer in panel
- [ ] `pnpm typecheck` pass

## Success Criteria

- Set BYOK Anthropic key → chat "explain consistent hashing in this chapter" → streaming starts <2s, full answer <15s
- Refresh page → key vẫn còn (localStorage), history vẫn còn (D1)
- Switch sang chapter khác → new thread; switch back → restored
- Network tab: chỉ thấy `/mentor/chat` POST + `/mentor/history` GET, không thấy raw Anthropic call (proxy hoạt động)
- typecheck + lint pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Anthropic 30s timeout vs Workers 30s | Set max_tokens=4096; abort upstream nếu >25s; show "Response truncated" |
| SSE buffering by Cloudflare | Disable buffering: `Cache-Control: no-cache, no-transform`, `X-Accel-Buffering: no` |
| BYOK passphrase UX (lost = re-enter) | Accept this; passphrase = 8+ chars, hint sau 30 ngày inactivity |
| User commit key vào git accidentally | Document trong README; key NEVER server-stored |
| D1 write quota / cost | Update conversation as single row update (UPDATE, not INSERT new row); index on read paths |
| History grows unbounded | Cap stored messages at 100 per thread; older drop silently |

## Security Considerations

- BYOK key NEVER logged in Workers (filter từ request body before any log)
- BYOK key NEVER stored in D1 (only ciphertext goes to localStorage)
- Better-Auth session required (`requireUser` middleware) on all mentor routes
- D1 query always filter `user_id = session.user.id` (prevent IDOR)
- Rate limit per user: 60 mentor/chat calls per hour (use Workers KV or D1 counter)

## Next Steps

→ Phase 3: Inline Explain button on properties panel + chapter progress + notes. Depends on this phase.
