# Phase 4 — RAG with Cloudflare Vectorize

**Status:** pending | **Priority:** P2 (learning-driven, not user-need-driven) | **Effort:** 3–4 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260624-2337-system-design-mentor-feature.md)
- [Plan overview](./plan.md)
- Depends on: phase 2 (mentor.ts route to extend)
- **Note:** Phase này là LEARNING goal (mày muốn học Vectorize). Tao đã warn phase này over-engineering ở scale 28 chapters. Functional value marginal.

## Overview

Add semantic search across all 28 chapters. Chunk markdown → embed → store trong Cloudflare Vectorize → at chat time, retrieve top-K relevant chunks → inject into context. Replaces "stuff full chapter" strategy với "retrieve relevant chunks" cho cross-chapter queries.

## Key Insights

- Cloudflare Vectorize: managed vector DB, 5M free vectors, 30M queries/month free
- Embedding model: dùng Workers AI `@cf/baai/bge-base-en-v1.5` (768 dim, free trong Workers)
- Chunk strategy: markdown headers + ~500 token chunks với 50 token overlap
- Hybrid retrieval: vector search + chapter filter (metadata) cho better precision

## Requirements

**Functional:**
- One-time ingestion job: fetch 28 chapter markdown → chunk → embed → upsert Vectorize
- Mentor chat new mode: "Cross-chapter mode" toggle → use RAG instead of stuff
- Retrieval transparency: show "Citing: [chapter 5, chapter 12]" trong response

**Non-functional:**
- Ingestion: complete <5 minutes (run manually, không cần cron)
- Retrieval: <300ms per query
- Re-ingestion: idempotent (re-upsert overwrites)

## Architecture

```
apps/api/wrangler.toml                — ADD vectorize binding + Workers AI binding

apps/api/src/routes/mentor.ts         — EXTEND
  POST /mentor/chat?mode=rag           — new mode
  POST /mentor/ingest                  — admin-only trigger ingestion

apps/api/src/lib/rag/
  ├── chunker.ts                       — markdown → chunks
  ├── embedder.ts                      — Workers AI embed
  ├── retriever.ts                     — Vectorize query
  └── ingest-job.ts                    — orchestrate full ingestion

apps/web/src/features/mentor/
  mentor-panel.tsx                     — add Cross-chapter toggle
  use-mentor-chat.ts                   — pass mode param
```

## Related Code Files

**Create:**
- `apps/api/src/lib/rag/chunker.ts`
- `apps/api/src/lib/rag/embedder.ts`
- `apps/api/src/lib/rag/retriever.ts`
- `apps/api/src/lib/rag/ingest-job.ts`

**Modify:**
- `apps/api/wrangler.toml` (add vectorize + AI bindings)
- `apps/api/src/routes/mentor.ts` (extend chat + add ingest route)
- `apps/api/src/index.ts` (env type augmentation)
- `apps/web/src/features/mentor/mentor-panel.tsx` (toggle UI)
- `apps/web/src/features/mentor/use-mentor-chat.ts` (mode param)

## Implementation Steps

1. **Create Vectorize index** (CLI, one-time):
   ```bash
   pnpm -F @archlet/api wrangler vectorize create chapters-index --dimensions=768 --metric=cosine
   ```
2. **Update wrangler.toml**:
   ```toml
   [[vectorize]]
   binding = "VECTORIZE"
   index_name = "chapters-index"

   [ai]
   binding = "AI"
   ```
3. **Chunker** `chunker.ts`:
   - Parse markdown headers (h2, h3) as natural boundaries
   - Sliding window 500 tokens (~2K chars) với 50 token overlap
   - Output: `{ chunkId, chapterId, headerPath, text, tokenCount }`
4. **Embedder** `embedder.ts`:
   - `env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [...] })` batched 100
   - Returns Float32Array[]
5. **Ingest job** `ingest-job.ts`:
   - For each chapter (from `CHAPTERS_CATALOG`):
     - Fetch raw markdown
     - Chunk → embed → upsert to Vectorize với metadata `{ chapterId, chapterTitle, headerPath }`
   - Progress log per chapter
6. **Ingest route** `POST /mentor/ingest`:
   - Admin only (check user_id == owner)
   - Trigger ingest-job, return progress
7. **Retriever** `retriever.ts`:
   - Embed user query → `env.VECTORIZE.query(embedding, { topK: 5, returnMetadata: true })`
   - Optional filter by chapterId
8. **Extend chat** route:
   - Query param `?mode=rag`
   - If RAG: retrieve top-5 chunks → inject as `Context:\n[chapter X, "..."]\n[chapter Y, "..."]\n` before user message
   - If stuff (default): existing behavior (full chapter)
9. **UI toggle**:
   - mentor-panel header: "🔍 Cross-chapter" toggle
   - When ON: pass `mode=rag` + show citations footer trong response

## Todo List

- [ ] Create Vectorize index via CLI
- [ ] Update wrangler.toml với vectorize + AI bindings
- [ ] Implement `chunker.ts` + unit test on 1 chapter
- [ ] Implement `embedder.ts` + verify dimensions match
- [ ] Implement `ingest-job.ts`
- [ ] Add `POST /mentor/ingest` endpoint (admin-only)
- [ ] Run ingestion locally; verify Vectorize index populated
- [ ] Implement `retriever.ts`
- [ ] Extend `POST /mentor/chat` với `mode=rag` branch
- [ ] Add "Cross-chapter" toggle UI in mentor-panel
- [ ] Update use-mentor-chat hook để pass mode
- [ ] Render citations in chat-message component
- [ ] Manual QA: ask query that requires cross-chapter knowledge (e.g. "what's common between rate limiter and consistent hashing?")
- [ ] Document ingestion runbook in README
- [ ] `pnpm typecheck` pass

## Success Criteria

- Run ingest 1 lần → Vectorize shows ~500–1000 vectors (28 chapters * ~30 chunks avg)
- Toggle "Cross-chapter" ON → ask "compare leader election in chat vs payment chapter" → response cites 2+ chapters
- Stuff mode vẫn work (toggle OFF)
- Token usage RAG mode < stuff mode for same answer quality (the whole point)

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Vectorize free tier exhaustion | 5M vectors free → far exceed need. Skip mitigation. |
| BGE model quality vs OpenAI embeddings | Acceptable cho 28 chapter scale; if bad, swap to `@cf/baai/bge-large-en-v1.5` |
| Chunk boundaries cut mid-concept | Header-aware chunking; overlap 50 tokens; tune later if see bad retrievals |
| Ingestion non-idempotent → duplicate vectors | Use deterministic vector IDs `{chapterId}-{chunkIndex}` for upsert overwrite |
| RAG retrieval misses obvious answer | Hybrid: also pass chapter list summary; let LLM decide RAG context vs intrinsic chapter knowledge |
| User confused which mode to use | Default OFF; tooltip "Use cross-chapter when comparing concepts across multiple chapters" |

## Security Considerations

- Ingest endpoint admin-only (hardcode user_id check or require special env var)
- Vector metadata không chứa user data (chỉ chapter metadata)
- Rate limit RAG queries giống chat (60/h)

## Next Steps

After phase 4 ship: feature complete. Future ideas (out of scope):
- Auto-suggest variant on canvas based on current diagram pattern (cross-feature)
- Multi-language chapter content
- Public deploy với multi-tenant memory
