# System Design Mentor Feature — Brainstorm Summary

**Date:** 2026-06-24
**Owner:** kingkongqn4444 (personal tool)
**Source repo to ingest:** https://github.com/liquidslr/system-design-notes (28 chapters, notes của Alex Xu's *System Design Interview*)

---

## Problem Statement

Build feature trong app `System_design` (Cloudflare Workers + Vite/React + D1) cho phép:
1. Học toàn bộ 28 chapter từ repo trên (mentor + reference)
2. Có 28 canonical diagram templates kéo thả vào canvas
3. AI mentor trả lời câu hỏi, nhớ context xuyên session
4. Personal tool — không cần multi-user, không cần auth/billing phức tạp

**Đối tượng:** chỉ user (BYOK Anthropic/OpenAI key)
**Scope đã chốt:** Full ship (templates + chat + inline explain + memory + RAG)

## FINAL DECISIONS (chốt sau debate)

| Decision | Chọn | Note |
|---|---|---|
| Templates phase 1 | **28 templates (no cut)** | User từ chối cắt còn 8. Grind ~10–12 ngày |
| RAG / Vectorize | **GIỮ** (phase 4 riêng) | User muốn học Cloudflare Vectorize. +3–4 ngày |
| Chapter content source | **Fetch raw GitHub** | Tránh IP risk, có thể cache lazy vào R2 sau |
| BYOK key storage | localStorage (encrypted) | Personal tool, KISS |
| LLM access | Proxy qua `mentor.ts` Workers | Rate limit + log |
| Memory | D1 (3 tables) | Stack hiện có |
| Inline Explain | Có (phase 3) | Trên properties panel của selected node |

**Revised timeline:** Phase 1 (10–12d, 28 templates + ingestion) + Phase 2 (3–4d, AI core) + Phase 3 (2–3d, polish + inline) + Phase 4 (3–4d, RAG/Vectorize) = **~18–23 ngày solo**.

---

## Evaluated Approaches

### A. Markdown viewer + 28 templates, KHÔNG AI (cheapest)
- **Pros:** Zero LLM cost, build 3 ngày, không phụ thuộc API key
- **Cons:** Mất phần "mentor" — phải đọc chay
- **Verdict:** Đã từ chối. User muốn AI.

### B. Chat-only AI mentor, KHÔNG templates
- **Pros:** Build 4 ngày, AI làm hết
- **Cons:** Không có canonical diagram để học visual; mất giá trị canvas
- **Verdict:** Từ chối. Templates là core value cho app diagram.

### C. Full ship CÓ RAG (user chọn)
- **Pros:** Semantic search cross-chapter, "production-grade"
- **Cons:** RAG = Vectorize + chunking + embeddings + ingestion pipeline. Cho 28 chapter ~840KB markdown là **dùng đại bác bắn ruồi**. Modern model 200K context stuff được nguyên chapter
- **Verdict:** Recommend **bỏ RAG**, dùng phương án D bên dưới

### D. Full ship KHÔNG RAG (RECOMMEND)
- **Pros:** Tất cả tính năng user muốn, infra đơn giản hơn 1 bậc
- **Cons:** Nếu sau cần cross-chapter semantic query thì phải retrofit. Acceptable.
- **Verdict:** **CHỌN CÁI NÀY**

---

## Recommended Architecture

### 4 Layers

```
┌─────────────────────────────────────────────────┐
│  apps/web (existing canvas + new "Learn" tab)   │
│  - Sidebar chat panel (streaming)               │
│  - Inline "Explain" button on selected node     │
│  - Chapter list + markdown viewer               │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  apps/api/src/routes/mentor.ts (Cloudflare WK)  │
│  - POST /mentor/chat  (BYOK passthrough)         │
│  - POST /mentor/explain (node-context preset)    │
│  - GET  /mentor/history?diagramId&chapterId      │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  D1 (3 new tables)                              │
│  - mentor_chats         (history)               │
│  - chapter_progress     (read/notes per user)   │
│  - chapter_summary_cache (precomputed)          │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│  Static content (R2 or apps/web/public/learn/)  │
│  - 28 chapter markdown mirrored at build time   │
│  - chapter-index.json (metadata + key concepts) │
└─────────────────────────────────────────────────┘
```

### Storage layer (D1)

```sql
CREATE TABLE mentor_chats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  diagram_id TEXT,            -- nullable: chat ngoài context diagram
  chapter_id TEXT,            -- nullable: chat tự do
  messages TEXT NOT NULL,     -- JSON array [{role, content, ts}]
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_chats_user_diag ON mentor_chats(user_id, diagram_id);

CREATE TABLE chapter_progress (
  user_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  read_at INTEGER,
  notes TEXT,                 -- user's personal markdown notes
  PRIMARY KEY (user_id, chapter_id)
);

CREATE TABLE chapter_summary_cache (
  chapter_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,      -- AI-generated 200-word summary
  key_concepts TEXT NOT NULL, -- JSON array string
  related_variants TEXT,      -- JSON array of variant IDs in canvas
  generated_at INTEGER NOT NULL
);
```

**BYOK key storage:** lưu trong `localStorage` phía web (encrypted với user passphrase) HOẶC trong D1 với AES-GCM dùng session key. Personal tool → localStorage là đủ, kiss.

### Context strategy (no RAG)

Mỗi LLM call gửi:
1. **System prompt** (~500 token): role = mentor, style hướng dẫn
2. **Chapter markdown** (~3K–20K token tuỳ chapter): full text của chapter user đang xem
3. **Current diagram JSON** (~1K–5K token): nodes + edges + variant configs hiện tại
4. **Conversation history** (last 10 messages, ~2K token)
5. **User question** (~100 token)

Tổng max ~30K token / call → fit thoải mái trong 200K window. Không cần RAG.

**Nếu sau cần cross-chapter:**
- Naive: gửi `chapter-index.json` (~5K token list 28 title + 1 dòng summary) → AI tự chọn chapter
- Vẫn không cần Vectorize

### Content ingestion (one-time)

Script `scripts/ingest-chapters.ts`:
1. Clone `liquidslr/system-design-notes` vào `/tmp`
2. Parse mỗi folder `XX. Topic/` → đọc `README.md` + danh sách ảnh
3. Output:
   - `apps/web/public/learn/chapters/{slug}.md` (mirrored markdown)
   - `apps/web/public/learn/chapters/{slug}/*.png` (mirrored images)
   - `packages/shared/src/chapters-catalog.ts` (chapter metadata + slug + relatedVariants)
4. Chạy 1 lần. Re-run khi upstream update.

**Pháp lý:** Repo là notes của sách Alex Xu. Mirror toàn bộ có thể vi phạm IP. **Safer:** chỉ mirror metadata + link out, fetch markdown raw từ GitHub tại runtime (CORS cho phép). Hoặc xin permission tác giả repo.

### Templates layer

Mở rộng `packages/shared/src/templates.ts`:
- Mỗi chapter có 1 template entry: `{ chapterId, title, nodes, edges, description }`
- 28 templates handcraft = 5–7 ngày grind (mỗi template ~30 phút design)
- **Đề xuất:** ship 8 templates phổ biến trước (URL Shortener, Rate Limiter, Chat System, News Feed, Notification, KV Store, Web Crawler, S3) → còn 20 ship rolling

UI: thêm tab "Learn" trong patterns sidebar, group templates theo chapter.

### AI Mentor UX

**Chat sidebar:**
- Vị trí: right panel toggle (giống properties panel hiện tại)
- Streaming responses (SSE từ Cloudflare Workers)
- Per-(diagram, chapter) thread → resume khi chuyển diagram
- Markdown render với code highlighting

**Inline "Explain" button:**
- Trong properties panel của node được chọn → button "Explain this in context of [chapter]"
- Auto-fill prompt: "Explain why [variant] is used here in [chapter] design"
- Output append vào chat thread đang mở

---

## Phasing (revised — ngắn hơn 2-3 tuần user lo)

| Phase | Scope | Effort |
|---|---|---|
| **1. Content + 8 templates** | Ingestion script, chapter viewer, 8 canonical templates, chapters-catalog.ts | 4–5 ngày |
| **2. AI Mentor core** | mentor.ts route, chat sidebar, BYOK config UI, D1 tables, history storage | 3–4 ngày |
| **3. Polish** | Inline Explain button, chapter progress tracker, notes per chapter, summary cache job | 2–3 ngày |
| **4. Remaining 20 templates** | Rolling, hand-author dần khi học chapter đó | continuous |

**Tổng phase 1–3:** ~10–12 ngày solo. **Không 2–3 tuần** vì bỏ RAG.

---

## Implementation Considerations & Risks

| Risk | Mitigation |
|---|---|
| 28 templates handcraft = grind, nhiều cái không bao giờ dùng | Ship 8 phổ biến nhất trước; còn lại làm khi học tới |
| BYOK key bị leak (XSS, log) | localStorage + chỉ inject vào fetch headers, không log; mentor.ts pass-through không lưu |
| Markdown licensing | Link out thay vì mirror; hoặc xin tác giả; document rõ source |
| AI hallucinate kiến thức ngoài chapter | System prompt strict: "Only answer from provided chapter content; if not in chapter, say so" |
| Cost runaway (BYOK user là tao, vẫn tốn tiền) | Cap tokens per response (4K); cap conversation length (drop messages > 20); show running token count |
| Cloudflare Workers 30s timeout | Streaming + chia long answers; nếu cần >30s → dùng Cloudflare Workflows |
| Future cần cross-chapter query | Defer; bắt đầu naive (chapter-index in prompt); chỉ thêm RAG khi đo được nó cần |

---

## Success Metrics (personal tool)

- ✅ Drag-drop 1 template URL Shortener → ra đúng canonical diagram trong <5s
- ✅ Mở chat sidebar → hỏi "tại sao cần consistent hashing ở đây?" → trả lời đúng từ chapter
- ✅ Quay lại app sau 1 tuần → chat history còn nguyên, biết tao đã học chapter nào
- ✅ Token budget 1 conversation < $0.10 (BYOK Anthropic Haiku/Sonnet)

---

## Next Steps & Dependencies

**Immediate (Phase 1):**
1. Viết `scripts/ingest-chapters.ts` — clone + parse + emit catalog
2. Tạo `packages/shared/src/chapters-catalog.ts` với 28 chapter metadata
3. Add `learn-panel.tsx` trong `apps/web/src/features/learn/` (markdown viewer)
4. Hand-author 8 canonical templates trong `templates.ts`
5. D1 migration: 3 tables mới

**Dependencies:**
- Quyết: mirror markdown hay link out (legal)
- Quyết: BYOK lưu localStorage hay D1 encrypted (UX vs security)
- Anthropic API key sẵn sàng để test

**Open architectural decisions cần chốt khi plan:**
- SSE streaming protocol cụ thể (native EventSource vs SSE polyfill)
- Markdown renderer (`react-markdown` đã có chưa? cần check)
- D1 migration tooling hiện đang dùng gì

---

## Unresolved Questions

1. **Mirror chapter markdown hay link out?** Ảnh hưởng lớn tới legal + offline UX. Tao recommend link out + fetch raw từ GitHub tại runtime để né IP issue.
2. **8 templates ưu tiên phase 1 — đúng list trên hay đổi?** (URL Shortener, Rate Limiter, Chat, News Feed, Notification, KV Store, Web Crawler, S3)
3. **AI Mentor có gọi thẳng từ web (CORS) hay phải proxy qua mentor.ts?** Proxy an toàn hơn (rate limit + log), CORS đơn giản hơn. Khuyến nghị proxy.
4. **Chapter "summary cache" pre-compute lúc nào?** Cron job nightly? On-demand lần đầu mở chapter? On-demand đơn giản hơn — defer cron.
5. **Có muốn integrate với canvas hiện tại chặt hơn không?** Ví dụ: AI suggest variant phù hợp khi user drag node → cross-feature, scope lớn hơn. Phase 4+.
