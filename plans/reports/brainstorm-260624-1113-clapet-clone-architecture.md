# Brainstorm — Clapet Clone Architecture

**Date:** 2026-06-24
**Source:** https://clapet.app/d (decoded from SPA bundle + CSP + UI screenshot)
**Goal:** Clone 100% feature-set của clapet.app — AI-assisted system architecture diagram tool

---

## 1. Problem Statement

Clone tool diagram kiến trúc hệ thống (giống Eraser.io / Excalidraw + AI agent), feature-parity với clapet.app:
- Canvas node-based với edges có label
- AI agent generate/refine diagram theo abstraction level
- Account, project folders, share read-only, embed
- BYOK (user dùng key OpenAI/Anthropic/DeepSeek của riêng mình)

**Out of scope v1:** real-time collab (CRDT/live cursors), billing/credits, mobile.

---

## 2. Clapet — Decoded Stack (sự thật quan sát được)

| Layer | Clapet dùng | Bằng chứng |
|---|---|---|
| Frontend host | Cloudflare Pages | `server: cloudflare`, CF NEL headers |
| Frontend | React + Vite SPA | `<div id="root">`, `/assets/index-*.js` |
| Canvas | React Flow (xyflow) | 53× `Handle` ref, UI layout chuẩn xyflow |
| TS runtime | Effect-TS (@effect/schema, Micro fiber) | Strings từ bundle |
| Auth | **Better Auth** | Endpoint match 100%: `/sign-in/email`, `/get-session`, `/revoke-other-sessions`, `/verify-email` |
| Backend host | VPS sau **Caddy** | `server: Caddy` trên api.clapet.app |
| Backend lang | Node/Bun (không xác định cụ thể) | — |
| Database | Postgres (suy luận) | Better Auth + serious backend → default |
| AI | **BYOK direct from browser** | CSP `connect-src` whitelist `api.openai.com`, `api.anthropic.com`, `api.deepseek.com` |
| Errors | Sentry (de.sentry.io org 4511608116674560) | URL trong bundle |
| Analytics | PostHog (us+eu) | Bundle + CSP |
| Routes lộ | `/`, `/d`, `/d/:id`, `/e/:id`, `/shared/:id`, `/project/:id`, account routes | Strings từ bundle |

**Insight quan trọng nhất:** BYOK = backend không proxy AI → cost AI = 0 → 1 VPS rẻ chịu được toàn bộ traffic.

---

## 3. Quyết định kiến trúc cho clone

| Quyết định | Lựa chọn | Lý do |
|---|---|---|
| Frontend host | **Cloudflare Pages** | Mirror clapet, free tier rộng |
| Frontend stack | **React 18 + Vite + TypeScript + React Flow + Tailwind/shadcn** | Mirror clapet (trừ Effect-TS) |
| State client | **TanStack Query + Zod + Zustand** | Thay Effect-TS — đơn giản hơn cho solo dev, kết quả tương đương |
| Backend host | **Cloudflare Workers** (khác clapet) | User chọn, match skills sẵn, zero ops |
| Backend framework | **Hono** | Chuẩn de-facto cho Workers, lightweight |
| Database | **Cloudflare D1** (SQLite) | User chọn, đủ cho diagram tool |
| Auth | **Better Auth + Workers adapter + D1** | Mirror clapet, có official adapter cho Workers/D1 |
| AI | **BYOK 100%** — client → OpenAI/Anthropic/DeepSeek | Mirror clapet, zero AI cost |
| API key storage | **localStorage** (v1) | Đơn giản. v2: AES-encrypt rồi sync server |
| Storage | **R2** cho exports (PNG/SVG/PDF) | Diagram JSON nằm D1 |
| Realtime collab | **Không có v1** | Read-only share + invite editor đã đủ |
| Diagrams CRUD | REST trên Workers, optimistic update phía client | KISS |
| Telemetry | **PostHog + Sentry** | Mirror clapet |
| Embed `/e/:id` | Public read-only render route, CORS open, no auth | Tránh CSP iframe issue: dùng full page chứ không widget |
| Share `/shared/:id` | Public read-only với unguessable token | KISS |

---

## 4. High-level architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  Browser (React + React Flow SPA)                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Canvas editor   │  AI panel   │  Project sidebar  │  Share  │  │
│  └────────┬───────────────┬──────────────┬──────────────┬─────┘  │
└───────────┼───────────────┼──────────────┼──────────────┼────────┘
            │               │              │              │
            │ cookie+REST   │ BYOK fetch   │ REST         │ link
            ▼               ▼              ▼              ▼
   ┌──────────────────┐  ┌──────────┐  ┌──────────────────┐
   │ Cloudflare       │  │ OpenAI / │  │ Cloudflare Pages │
   │ Workers (Hono)   │  │Anthropic/│  │ (static /shared/)│
   │ api.<your>.app   │  │ DeepSeek │  └──────────────────┘
   │ ──────────────── │  └──────────┘
   │ • Better Auth    │
   │ • /projects      │      ┌────────────────────────────┐
   │ • /diagrams      │─────▶│ D1 (SQLite)                │
   │ • /shared/:tok   │      │  users, sessions, accounts │
   │ • /export        │      │  projects, diagrams, edges │
   │                  │      │  share_tokens              │
   └────────┬─────────┘      └────────────────────────────┘
            │
            ▼
   ┌──────────────────┐
   │ R2 bucket        │   exports/<diagram>.png|svg|pdf
   └──────────────────┘

   Sentry ◀──── error events ────  Browser + Workers
   PostHog ◀── product events ──── Browser
```

---

## 5. Data model (D1, tối thiểu)

```
users          (Better Auth schema)
sessions       (Better Auth schema)
accounts       (Better Auth schema — providers)
verifications  (Better Auth schema)

projects        id, owner_id, name, created_at, updated_at
diagrams        id, project_id, owner_id, name, level_data (JSON),
                current_level (high|mid|low), updated_at
share_tokens    token, diagram_id, mode (view|embed), expires_at
exports         id, diagram_id, type (png|svg|pdf), r2_key, created_at
```

`level_data` = JSON document chứa 3 layers (high/mid/low) — mỗi layer là `{nodes:[], edges:[]}` theo schema React Flow. Lưu trong 1 column duy nhất tránh join phức tạp. D1 row limit 1MB — dư cho diagram thường.

---

## 6. AI flow (BYOK)

```
User mở AI panel
  ├─ Lần đầu: nhập API key (OpenAI / Anthropic / DeepSeek)
  │           → lưu localStorage (key: clapet_keys_v1)
  ├─ Chọn provider + model
  ├─ Nhập prompt: "Design Instagram-like photo service"
  ├─ Chọn level: High / Mid / Low
  └─ Submit
        │
        ▼
  Browser fetch trực tiếp → api.<provider>.com (streaming SSE)
        │
        ▼
  Tool-use response:
    add_node(id, type, label, description, position)
    add_edge(from, to, label)
    remove_node(id) / remove_edge(id)
        │
        ▼
  Apply incrementally vào React Flow state
  → user thấy diagram được dựng từng node một
        │
        ▼
  Save vào D1 (debounced, qua Workers API)
```

System prompt = template cho biết schema node types có sẵn (CDN, LoadBalancer, API, Database, Cache, Queue, Storage, CDN, External User...) + format JSON tool call.

**Abstraction level**: cùng prompt, thay system prompt theo level (High = 3-7 nodes, Mid = 8-15, Low = 16+ với sub-components).

---

## 7. Route map

| Route | Auth | Mô tả |
|---|---|---|
| `/` | public | Landing + login CTA |
| `/login`, `/signup` | public | Better Auth UI |
| `/d` | auth | New diagram (auto-create or pick) |
| `/d/:id` | auth (owner/editor) | Editor canvas |
| `/e/:id` | public | Embed view (no chrome) |
| `/shared/:token` | public | Read-only share |
| `/project/:id` | auth | Project folder view |
| `/account` | auth | Profile, change email/password, API keys, delete |
| `/api/*` | mixed | Workers backend |

---

## 8. Approaches evaluated (briefly)

### A. Mirror Clapet 100% (VPS + Caddy + Node + Postgres)
- ✅ Same shape, zero surprises
- ❌ User không muốn ops VPS, không match skill stack
- **Rejected**

### B. **Workers + D1 + BYOK** ← chosen
- ✅ Zero ops, free tier khủng, edge latency, match skills user
- ✅ D1 đủ cho v1 (~1k diagrams/user OK)
- ⚠️ D1 write throughput thấp hơn Postgres (~50/sec) — không vấn đề cho use case này
- ⚠️ Better Auth Workers adapter mới hơn, ít battle-tested hơn Node version

### C. Workers + Hyperdrive + Postgres (Neon)
- ✅ SQL phong phú hơn (jsonb, full-text)
- ❌ Thêm tầng (Hyperdrive) + cost Neon (free tier giới hạn compute hours)
- ❌ Over-engineering cho v1
- **Defer** — migrate sang nếu D1 chật

### D. Convex (all-in-one realtime)
- ✅ Realtime miễn phí, schema + query trong 1 nơi
- ❌ Vendor lock, không BYOK pattern không match
- ❌ Không cần realtime v1
- **Rejected**

---

## 9. Implementation considerations & risks

### Risks
1. **Better Auth + Workers + D1 adapter** — chưa quá phổ biến. Mitigation: prototype auth flow trước cùng, fallback Lucia hoặc Auth.js nếu vỡ.
2. **localStorage chứa API key** — XSS = leak key. Mitigation: CSP nghiêm như clapet, không inline script, không 3rd-party iframe.
3. **Tool-use streaming khác nhau giữa 3 providers** — OpenAI/Anthropic/DeepSeek schema khác. Mitigation: abstract `AIClient` interface, 3 implementations.
4. **D1 1MB row limit** — diagram cực lớn (>10k nodes) sẽ vỡ. Mitigation: split level_data thành 3 rows (1 per level) nếu vượt 500KB.
5. **Copyright** — clone UI/branding 1:1 = rủi ro pháp lý. Mitigation: rebrand toàn bộ (tên, logo, màu), giữ structure code/feature.

### YAGNI cắt khỏi v1
- Real-time collab (Yjs/DO)
- Server-side AI proxy + billing
- Mobile app
- Versioning/history (chỉ updated_at)
- Comments trên diagram
- Templates marketplace
- Team workspaces (chỉ personal projects)

### KISS principles applied
- Diagram = 1 JSON blob, không normalize nodes/edges thành rows riêng
- AI = client-side, không Workers AI gateway
- Share = unguessable token, không signed JWT
- Export = trigger Workers function tạo PNG/SVG, lưu R2

---

## 10. Success criteria (v1)

| Metric | Target |
|---|---|
| Time-to-first-diagram (new user) | < 60s |
| AI generation latency (first node visible) | < 3s |
| Diagram save → load round-trip | < 500ms |
| Workers cost @ 1k DAU | < $5/month |
| Auth flow success rate | > 99% |
| Sentry error rate | < 0.5% sessions |

---

## 11. Phase breakdown (suggested for /plan)

1. **Phase 0 — Skeleton & Auth**: Vite+React+Tailwind skeleton, Workers+Hono+D1, Better Auth, login/signup/verify email
2. **Phase 1 — Canvas editor**: React Flow setup, custom node types (CDN/DB/API/...), edge labels, mini-toolbar, undo/redo
3. **Phase 2 — Persistence**: Projects + Diagrams CRUD, auto-save debounce, optimistic update
4. **Phase 3 — AI BYOK**: API key UI + storage, 3-provider client abstraction, tool-use streaming, system prompts per level
5. **Phase 4 — Share & Embed**: `/shared/:token`, `/e/:id`, public read-only renderer
6. **Phase 5 — Export & Account**: PNG/SVG/PDF export to R2, account settings, delete user
7. **Phase 6 — Polish**: PostHog + Sentry, dark mode, landing page, OG image

Each phase shippable. Phase 4–6 có thể song song nếu cần.

---

## 12. Unresolved questions

1. **Tên & brand** của clone? (cần để register domain + asset)
2. **Có cần verify email** ngay v1 hay defer? (Better Auth hỗ trợ sẵn nhưng cần SMTP — Resend free tier OK)
3. **API key encryption server-side** hay chỉ localStorage v1? (mặc định: localStorage; nếu muốn sync across devices → AES-GCM với key derived từ user password)
4. **Custom node types**: clone chính xác 10–20 node types của clapet, hay define mới? (cần screenshot thêm các node types khác)
5. **Embed `/e/:id`**: full-page hay iframe-friendly widget? (CSP của clapet hiện cấm iframe — chưa rõ ý đồ)
6. **Pricing model** sau v1: free forever (BYOK), hay free tier + pro (proxy AI có quota)?

---

**End of brainstorm report.**
