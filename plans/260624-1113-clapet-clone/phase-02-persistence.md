# Phase 2 — Persistence (Projects + Diagrams CRUD)

## Context Links
- Brainstorm § 5 (data model), § 7 (routes)
- D1 docs: https://developers.cloudflare.com/d1/

## Overview
- Priority: P0
- Status: pending
- Depends: Phase 0 + Phase 1
- Save/load diagrams to D1, project folders, auto-save debounced, optimistic updates.

## Key Insights
- Lưu `level_data` (JSON cho 3 level) trong **1 column TEXT** — tránh JOIN, đơn giản. D1 row limit 1MB → dư.
- Optimistic update qua TanStack Query `useMutation` + `setQueryData`. Rollback nếu lỗi.
- Auto-save: debounce 1.5s sau last change. Idempotent PUT.
- Server-side validate JSON với cùng Zod schema từ `packages/shared`.

## Requirements
**Functional:**
- User tạo project (name)
- List projects của user
- Tạo diagram trong project (name, default empty 3 levels)
- Load diagram → populate canvas
- Auto-save khi edit (debounced)
- Rename/delete project/diagram
- Sidebar app shell: list projects + diagrams trong project active

**Non-functional:**
- Save round-trip < 500ms (p95)
- Load diagram < 300ms (p95)
- Conflict resolution: last-write-wins (KISS, no realtime v1)

## Architecture
```
apps/api/src/routes/
  ├─ projects.ts      GET /projects, POST /projects, PATCH /:id, DELETE /:id
  └─ diagrams.ts      GET /diagrams?projectId=, GET /diagrams/:id,
                      POST /diagrams, PUT /diagrams/:id, DELETE /diagrams/:id

apps/api/src/db/
  ├─ schema.sql       D1 schema (migration)
  └─ queries.ts       Typed query functions

apps/web/src/features/
  ├─ projects/
  │   ├─ projects-sidebar.tsx
  │   ├─ project-list-item.tsx
  │   └─ use-projects.ts        (TanStack Query hooks)
  └─ diagrams/
      ├─ use-diagram.ts         (load + auto-save)
      ├─ use-diagram-list.ts
      └─ diagram-card.tsx
```

## Data Model (D1 migration `0002_app_schema.sql`)
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_projects_owner ON projects(owner_id, updated_at DESC);

CREATE TABLE diagrams (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level_data TEXT NOT NULL,        -- JSON: { high, mid, low } each { nodes, edges }
  active_level TEXT NOT NULL DEFAULT 'high',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_diagrams_project ON diagrams(project_id, updated_at DESC);
CREATE INDEX idx_diagrams_owner ON diagrams(owner_id);
```

## Implementation Steps
1. Migration `0002_app_schema.sql`, apply qua `wrangler d1 migrations apply`.
2. Hono routes `projects.ts`, `diagrams.ts` — auth middleware check session, owner check.
3. Zod request/response schemas trong `packages/shared`.
4. Frontend TanStack Query setup, `apiClient` wrapper với `credentials: 'include'`.
5. Hook `useProjects` (list/create/rename/delete) + `useDiagrams(projectId)`.
6. Hook `useDiagram(id)`: GET diagram, hydrate Zustand store. `useAutoSave`: subscribe store changes, debounce 1.5s, PUT diagram.
7. UI: sidebar shell với project list, click project → list diagrams, click diagram → load canvas.
8. New project / New diagram dialogs (shadcn Dialog).
9. Rename inline (double-click name). Delete với confirm.
10. Error handling: PUT thất bại → toast + retry button. 401 → redirect /login.

## Todo List
- [ ] D1 migration projects + diagrams
- [ ] Hono routes: projects CRUD
- [ ] Hono routes: diagrams CRUD
- [ ] Zod schemas shared package
- [ ] TanStack Query setup + apiClient
- [ ] useProjects + useDiagrams hooks
- [ ] useDiagram + useAutoSave hooks
- [ ] Projects sidebar UI
- [ ] New/rename/delete project + diagram dialogs
- [ ] Error toast + 401 handling
- [ ] Smoke test: create → edit → reload → state preserved

## Success Criteria
- Tạo project, tạo diagram, edit canvas, reload → state restored 100%
- Auto-save không spam: 10 chỉnh sửa liên tục trong 1s → chỉ 1 PUT sau 1.5s
- Owner check: user khác không list/load được diagram của mình

## Risk Assessment
| Risk | Likelihood | Mitigation |
|---|---|---|
| Save race condition (concurrent edits từ 2 tab) | Med | Updated_at-based optimistic concurrency; reject nếu stale |
| D1 1MB row limit với diagram khổng lồ | Low | Validate size client-side, warn nếu >500KB |
| JSON corruption nếu save fail partial | Low | Atomic UPDATE; Zod validate server-side |

## Security Considerations
- Owner check trên MỌI route (project/diagram CRUD)
- Cascade delete khi user xoá account
- Rate limit save: 10 req/s/user

## Next Steps
→ Phase 3: AI BYOK generate vào diagram
