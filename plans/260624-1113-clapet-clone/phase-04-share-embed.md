# Phase 4 — Share & Embed

## Context Links
- Brainstorm § 7 (route map)

## Overview
- Priority: P1
- Status: pending
- Depends: Phase 2
- Read-only share via unguessable token; embed route render full-page không chrome.

## Key Insights
- Share = generate random 22-char token (`nanoid`), bind diagram_id. Không cần auth.
- `/e/:id` cũng public read-only — khác `/shared/:token` ở chỗ: `/e/` cho biết diagram_id công khai (cho owner copy embed link); `/shared/:token` ẩn id.
- Read-only render = reuse CanvasEditor với `readOnly` prop → disable interaction (no drag, no edit, no toolbar).
- Embed view: chỉ canvas full viewport, no sidebar/topbar. Có thể iframe được dù CSP cấm với main app (set CSP riêng cho route này).

## Requirements
**Functional:**
- Owner click "Share" → tạo token, copy link to clipboard
- Owner xem list shared links, revoke
- `/shared/:token` render diagram read-only
- `/e/:id` render diagram nếu diagram có `public_embed: true`
- Embed CSP: cho phép `frame-ancestors *` (chỉ route /e/)

**Non-functional:**
- Share link load < 500ms
- Cache public diagrams ở CF edge (Cache API)

## Architecture
```
apps/api/src/routes/
  ├─ share.ts                POST /share, GET /share/:token, DELETE /share/:token
  └─ public.ts               GET /public/diagram/:token (CF cache)
                             GET /public/embed/:id

apps/web/src/routes/
  ├─ shared.tsx              /shared/:token
  └─ embed.tsx               /e/:id (custom layout, no app shell)

apps/web/src/features/canvas/
  └─ CanvasEditor.tsx        (extend with readOnly prop)
```

## Data Model (D1 migration `0003_share.sql`)
```sql
CREATE TABLE share_tokens (
  token TEXT PRIMARY KEY,
  diagram_id TEXT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER  -- nullable = never
);
CREATE INDEX idx_share_diagram ON share_tokens(diagram_id);

ALTER TABLE diagrams ADD COLUMN public_embed INTEGER NOT NULL DEFAULT 0; -- 0|1
```

## Implementation Steps
1. Migration `0003_share.sql`.
2. Hono routes:
   - `POST /share` body `{ diagramId, expiresIn? }` → tạo token (`nanoid(22)`), return URL.
   - `GET /public/diagram/:token` → resolve token → trả diagram JSON. Cache 60s qua `cache.put`.
   - `DELETE /share/:token` → owner only.
   - `PATCH /diagrams/:id/embed` → set `public_embed=1`.
   - `GET /public/embed/:id` → check `public_embed`, return JSON. Cache 60s.
3. Frontend: ShareDialog (Top toolbar → Share button).
   - Tab "Share link": create + copy + revoke list.
   - Tab "Embed": toggle public, show iframe snippet `<iframe src="https://archlet.app/e/:id">`.
4. CanvasEditor `readOnly` prop: pass to ReactFlow as `nodesDraggable={false}`, `nodesConnectable={false}`, `elementsSelectable={false}`. Hide toolbars.
5. `/shared/:token` route: TanStack Query fetch public endpoint, render CanvasEditor readOnly. Show small "Made with Archlet" footer.
6. `/e/:id` route: minimal layout (chỉ canvas), no header/sidebar. CSP header override qua Pages `_headers` file: `Content-Security-Policy: ... frame-ancestors *;`.
7. Open Graph: `/shared/:token` generate dynamic OG image qua Workers (basic via satori-html or skip v1 — dùng static OG).

## Todo List
- [ ] Migration share_tokens + public_embed column
- [ ] Hono routes share CRUD + public endpoints
- [ ] CF Cache API integration cho public endpoints
- [ ] ShareDialog UI 2 tabs
- [ ] CanvasEditor readOnly mode
- [ ] /shared/:token route
- [ ] /e/:id route + Pages _headers override CSP
- [ ] Smoke test: share link incognito mở được, revoke link 404

## Success Criteria
- Owner tạo share link → mở incognito tab → thấy diagram readonly
- Owner revoke → share link 404 ngay
- Embed iframe trong test page hiển thị diagram
- Cache hit rate public endpoints > 80% sau warm

## Risk Assessment
| Risk | Likelihood | Mitigation |
|---|---|---|
| Token brute-force | Low | 22-char nanoid = 130 bits entropy |
| Cache stale sau edit | Med | Bust cache khi PUT diagram (purge by tag) |
| CSP override leak vào main app | Med | _headers chỉ match `/e/*` path |

## Security Considerations
- Token là URL secret → không log full token trong Sentry
- Public endpoints không trả `owner_id` hay PII
- Rate limit public endpoints: 60 req/min/IP

## Next Steps
→ Phase 5: export + account settings
