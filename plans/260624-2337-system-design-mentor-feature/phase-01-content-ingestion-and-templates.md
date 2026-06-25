# Phase 1 — Content Ingestion + 28 Templates

**Status:** pending | **Priority:** P0 | **Effort:** 10–12 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260624-2337-system-design-mentor-feature.md)
- Source repo: https://github.com/liquidslr/system-design-notes
- Existing infra: `packages/shared/src/{patterns-catalog,templates,variants/}.ts`

## Overview

Build foundation: chapter metadata catalog, runtime fetcher cho markdown raw từ GitHub, markdown viewer UI, và 28 canonical templates kéo thả vào canvas. KHÔNG touch AI, KHÔNG touch D1.

## Key Insights

- Templates infra đã tồn tại (`templates.ts` 334 lines) → extend chứ không build mới
- Markdown content KHÔNG mirror vào repo → fetch raw từ `https://raw.githubusercontent.com/liquidslr/system-design-notes/master/{folder}/README.md`
- 28 chapter folder format: `01. Scaling`, `02. Back Of the Envelope Estimation`… (có khoảng trắng + số đầu)
- xyflow + variants registry sẵn → mỗi template chỉ cần `nodes[]` + `edges[]` JSON

## Requirements

**Functional:**
- User mở tab "Learn" → list 28 chapter với title + 1-line summary
- Click chapter → markdown render full content (images inline)
- Click "Use template" → diagram canonical drop vào canvas
- Cache markdown đã fetch in-memory (TanStack Query) tránh re-fetch

**Non-functional:**
- Fetch raw GitHub: <2s per chapter
- Markdown render: react-markdown + remark-gfm (check đã có chưa)
- Image URLs: rewrite relative paths → absolute GitHub raw URLs

## Architecture

```
apps/web/src/features/learn/
├── learn-panel.tsx           — sidebar tab, chapter list
├── chapter-viewer.tsx        — markdown render + image proxy
├── use-chapter.ts            — TanStack Query hook fetch GH raw
├── chapter-catalog.ts        — re-export from shared
└── use-template-apply.ts     — drop template vào current diagram

packages/shared/src/
├── chapters-catalog.ts       — 28 chapter metadata
└── templates.ts              — EXTEND với 28 templates

scripts/
└── ingest-chapter-metadata.ts — one-time: scan repo, generate catalog
```

## Related Code Files

**Create:**
- `packages/shared/src/chapters-catalog.ts`
- `apps/web/src/features/learn/learn-panel.tsx`
- `apps/web/src/features/learn/chapter-viewer.tsx`
- `apps/web/src/features/learn/use-chapter.ts`
- `apps/web/src/features/learn/use-template-apply.ts`
- `scripts/ingest-chapter-metadata.ts`

**Modify:**
- `packages/shared/src/index.ts` (export chapters-catalog)
- `packages/shared/src/templates.ts` (add 28 entries)
- `apps/web/src/features/canvas/` (add Learn tab to existing sidebar)
- `apps/web/package.json` (add `react-markdown`, `remark-gfm` nếu thiếu)

## Implementation Steps

1. **Audit existing deps**: check `apps/web/package.json` xem có `react-markdown` chưa; nếu không, `pnpm -F @archlet/web add react-markdown remark-gfm rehype-raw`
2. **Write ingestion script** `scripts/ingest-chapter-metadata.ts`:
   - Use `gh api repos/liquidslr/system-design-notes/contents/` để liệt kê 28 folder
   - Parse `XX. Title` → `{ id: "url-shortener", number: 8, title: "URL Shortener", folder: "08. URL Shortener" }`
   - Output JSON inline vào `chapters-catalog.ts` (không lưu separate JSON)
3. **Create `chapters-catalog.ts`**:
   ```ts
   export type Chapter = {
     id: string;           // kebab-case slug
     number: number;       // 1-28
     title: string;
     folder: string;       // exact GitHub folder name with %20
     rawUrl: string;       // computed raw GH base URL
     summary: string;      // 1-line, hand-written
     keyConcepts: string[]; // for AI context, hand-written
     relatedVariants: string[]; // variant IDs (e.g. ["redis", "postgres"]) for "this template uses…"
   };
   export const CHAPTERS_CATALOG: Chapter[] = [/* 28 entries */];
   ```
4. **Build chapter fetcher hook** `use-chapter.ts`:
   - TanStack Query, `queryKey: ["chapter", id]`, `staleTime: Infinity`
   - Fetch `https://raw.githubusercontent.com/liquidslr/system-design-notes/master/{encodeURIComponent(folder)}/README.md`
   - Rewrite relative image paths: `![](images/x.png)` → absolute raw URL
5. **Build `chapter-viewer.tsx`**:
   - Render markdown với `react-markdown` + `remark-gfm` + `rehype-raw`
   - "Use Template" button ở header → call `useTemplateApply(chapterId)`
6. **Build `learn-panel.tsx`**:
   - Sidebar tab thứ 2 (Patterns | Learn)
   - List 28 chapter, click → set active chapter → chapter-viewer mount
7. **Author 28 templates** trong `templates.ts`:
   - Mỗi chapter 1 template: ~5-15 nodes, edges, vị trí hợp lý
   - Order ưu tiên: URL Shortener → Rate Limiter → Chat → News Feed → Notification → KV Store → Web Crawler → S3 → Unique ID → Consistent Hashing → Autocomplete → Distributed Queue → Metrics → còn lại
8. **Wire Learn tab** vào canvas sidebar; ensure mutual exclusion với Patterns/Properties.

## Todo List

- [ ] Audit react-markdown deps; install nếu thiếu
- [ ] Write `scripts/ingest-chapter-metadata.ts` (skeleton + 28 folder parse)
- [ ] Create `packages/shared/src/chapters-catalog.ts` với 28 entries (summary + keyConcepts hand-written)
- [ ] Export chapters-catalog từ shared index
- [ ] Create `use-chapter.ts` hook
- [ ] Create `chapter-viewer.tsx` (markdown + image rewrite)
- [ ] Create `learn-panel.tsx` (chapter list)
- [ ] Wire Learn tab vào canvas sidebar
- [ ] Create `use-template-apply.ts` (drop template nodes/edges)
- [ ] Author template 01-08 (popular first): URL Shortener, Rate Limiter, Chat, News Feed, Notification, KV Store, Web Crawler, S3
- [ ] Author template 09-18
- [ ] Author template 19-28
- [ ] Manual QA: mở mỗi chapter, drop template, verify render
- [ ] `pnpm typecheck` pass

## Success Criteria

- Open app → Learn tab → 28 chapters listed
- Click "URL Shortener" → markdown loads <2s với images
- Click "Use Template" → canonical URL shortener diagram drops vào canvas (load balancer + app servers + KV cache + DB + ID generator)
- Test 5 random chapters → templates render hợp lý
- typecheck + lint pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| GitHub raw rate limit (60/h anonymous) | Use `Authorization: Bearer GITHUB_TOKEN` nếu thấy 429; cache TanStack Query infinity |
| Markdown image paths rewriting edge cases | Test 5 random chapters; fallback proxy through `apps/api/src/routes/proxy.ts` nếu cần |
| Template handcraft tốn thời gian | Ship rolling: phase 2 không block nếu ≥14 templates done |
| Folder names có ký tự lạ (`27.  Digital Wallet` 2 spaces) | Encode strictly với `encodeURIComponent`, test corner cases |

## Security Considerations

- No secrets in this phase
- GitHub fetch: read-only, public repo, no auth needed (rate limit acceptable)
- Markdown render: dùng `rehype-raw` cẩn thận (XSS từ embedded HTML); sanitize với `rehype-sanitize`

## Next Steps

→ Phase 2: AI Mentor core (chat sidebar + BYOK + D1 + history). Depends on: nothing in phase 1 (D1 schema mới).
