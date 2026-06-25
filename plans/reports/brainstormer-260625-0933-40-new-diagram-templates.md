# 40 New Diagram Templates — Brainstorm Summary

**Date:** 2026-06-25
**Owner:** kingkongqn4444

## Problem Statement

User says "patterns sidebar có 1 cái ít vãi" + muốn thêm "khoảng 50 templates". Reality check:
- `templates.ts` đã có **10 templates** (Twitter, Netflix, Uber, WhatsApp, Payment, etc.)
- `patterns-catalog.ts` (442 lines) — riêng biệt, micro-patterns
- Mentor Phase 1 sẽ ship **28 system-design templates** (URL Shortener, Rate Limiter, etc.)
- Total sau Mentor Phase 1 = **38 templates**

→ Còn thiếu ~12 để đến 50. User chose **plan 40 new templates** anyway, mix 3 types (real-world apps + architectural patterns + industry-specific). Result: ~78 total.

## ⚠️ UX Disconnect Cần Verify Trước

Mày clicked "Patterns sidebar" thấy 1 cái. **Patterns sidebar có thể KHÔNG render templates** — chỉ render patterns-catalog. Verify trước khi plan 40 templates mới:
- Templates đang hiển thị ở tab/menu nào trong app?
- Có button "Use Template" hay chỉ drag-drop?
- Nếu templates chưa hiện đầy đủ → fix UX trước, có thể 10 templates hiện tại đã đủ trong 1 thời gian

**Recommended first task:** Inspect `apps/web/src/features/templates/` (hoặc tương đương) UI, confirm templates visible. Nếu không → wire up trước rồi mới add content.

## Scope: 40 New Templates

### Category 1: Real-World Apps (15 templates)

| # | Template | Difficulty | Tags |
|---|---|---|---|
| 1 | Spotify Music Streaming | medium | streaming, recommendation, mobile |
| 2 | Discord Real-time Chat | medium | websocket, voice, gaming |
| 3 | Airbnb Marketplace | hard | search, booking, payment, geo |
| 4 | TikTok Feed | hard | ml-rec, video, viral |
| 5 | Reddit Aggregator | medium | ranking, comments, voting |
| 6 | Slack Team Messaging | medium | channels, search, presence |
| 7 | Zoom Video Calls | hard | webrtc, signaling, recording |
| 8 | Stripe Payment Processing | hard | payments, webhooks, ledger |
| 9 | Shopify E-commerce | medium | catalog, cart, checkout |
| 10 | Coinbase Crypto Exchange | hard | orderbook, wallet, kyc |
| 11 | Pinterest Image Boards | medium | search, recommendation, cdn |
| 12 | LinkedIn Professional Net | medium | graph, feed, search |
| 13 | Dropbox File Sync | hard | sync, chunking, dedup |
| 14 | Yelp Local Search | medium | geo, reviews, ranking |
| 15 | Robinhood Trading | hard | orderbook, market-data, realtime |

### Category 2: Architectural Patterns (10 templates)

| # | Template | Difficulty | Tags |
|---|---|---|---|
| 16 | Microservices Skeleton | medium | service-mesh, api-gateway |
| 17 | Event Sourcing + CQRS | hard | event-store, projection |
| 18 | Saga Orchestration | hard | distributed-tx, compensation |
| 19 | Strangler Fig Migration | medium | refactor, legacy |
| 20 | Backend-for-Frontend (BFF) | easy | mobile, web, gateway |
| 21 | Sidecar Pattern | medium | service-mesh, observability |
| 22 | Circuit Breaker + Bulkhead | medium | resilience, fault-tolerance |
| 23 | Pub-Sub + Materialized Views | medium | event-driven, read-models |
| 24 | API Gateway + Service Mesh | medium | routing, observability |
| 25 | Hexagonal Architecture | easy | ports-adapters, clean-arch |

### Category 3: Industry-Specific (15 templates)

| # | Template | Difficulty | Tags |
|---|---|---|---|
| 26 | Healthcare/EHR (FHIR) | hard | hipaa, fhir, audit |
| 27 | Telemedicine Platform | hard | video, ehr, scheduling |
| 28 | FinTech Open Banking | hard | psd2, oauth, ledger |
| 29 | Insurance Claims Processing | medium | workflow, ocr, fraud |
| 30 | EdTech LMS | medium | course, video, assessment |
| 31 | Multiplayer Game Backend | hard | realtime, matchmaking, leaderboard |
| 32 | IoT Telemetry Pipeline | hard | mqtt, timeseries, alerting |
| 33 | Logistics Tracking | medium | gps, route, eta |
| 34 | Travel Booking (OTA) | hard | search, inventory, payment |
| 35 | Real Estate Listings | medium | search, geo, images |
| 36 | Music Royalty Distribution | hard | ledger, micropayments |
| 37 | Live Auction Platform | hard | realtime, bidding, payment |
| 38 | Loyalty / Rewards Program | easy | points, redemption |
| 39 | Smart Home Hub | medium | iot, automation, mobile |
| 40 | AI/LLM SaaS Backend | medium | embeddings, vector, rate-limit |

## Implementation Approach

**Per template effort:** ~30 phút design + ~30 phút code = **1h × 40 = 40h = ~5–7 ngày solo**.

**Pattern (reuse existing templates.ts shape):**
```ts
const spotify: Template = {
  id: "spotify-music",
  name: "Spotify Music Streaming",
  description: "Music streaming with personalization + recommendation.",
  category: "social", // or add new categories
  difficulty: "medium",
  tags: ["streaming", "recommendation", "mobile"],
  diagram: {
    nodes: [/* 8-15 nodes */],
    edges: [/* connecting edges */],
  },
};
```

**File structure:** templates.ts hiện 334 lines + 40 templates × ~25 lines/template = ~1330 lines → **violate 200-line rule**. Split như variants:
```
packages/shared/src/templates/
├── types.ts                      — Template type + TemplateCategory
├── index.ts                      — catalog + helpers
├── real-world-apps.ts            — 25 (existing 10 + new 15)
├── architectural-patterns.ts     — 10
├── industry-specific.ts          — 15
└── system-design.ts              — 28 (from Mentor Phase 1) — defer integration
```

**New TemplateCategory enum needs:**
- Existing: `social | messaging | streaming | marketplace | infra | fintech`
- Add: `architectural | healthcare | gaming | iot | edtech | logistics | ai`

## Risks

| Risk | Mitigation |
|---|---|
| **Overload backlog** | Mentor (18-23d) + Cloud (13-19d) + Templates (5-7d) = **36-49d** = 7-10 weeks solo. Risk: cả 3 dở dang. → Suggest serialize: ship Cloud Phase A (2d) + this Templates plan (5-7d) FIRST as quick wins, defer Mentor + Cloud B/C/D |
| **UX bug — templates không visible** | Verify trước khi create content (xem section "UX Disconnect" trên) |
| **Quality vs quantity** | 40 templates 30ph each = surface-level diagrams. Risk: nhìn đẹp số lượng nhưng mỗi cái không deep. Acceptable cho personal tool, document trade-off |
| **Variant config defaults** | Mỗi node trong template cần `config: {}` valid theo variant schema. Nếu schema đổi (vd Phase B Cloud variants → discriminatedUnion) → cần update templates. Add migration test |
| **Overlap với Mentor 28** | Một số chapter system-design overlap với real-world (vd: Mentor có "Chat System" = Discord/WhatsApp). De-dup: Mentor giữ abstract chapter, Templates plan có concrete app |

## Effort & Phasing

**Single phase plan (no sub-phases needed):**

1. **Modularize templates.ts** vào templates/ directory (~1d)
2. **Wire templates vào correct UI sidebar** + verify (~0.5d)
3. **Author 15 real-world apps** (~2d)
4. **Author 10 architectural patterns** (~1.5d)
5. **Author 15 industry-specific** (~2d)
6. **QA + adjust** (~0.5d)

**Total: 5–7 ngày.**

## Success Criteria

- Templates count visible trong UI: 38 → grow to 50 (after Mentor Ph1) → final ~78 (after this plan)
- Each new template drops cleanly: variant configs match current schema, no validation errors
- Categories well-organized: dropdown filter by category (existing + new)
- Search/filter templates by tag
- typecheck pass

## Unresolved Questions

1. **Verify UX disconnect first** — templates đang hiện ở UI nào? Maybe fix là wire templates vào patterns sidebar thay vì create 40 mới
2. **TemplateCategory enum extension** — chốt thêm category nào (architectural, healthcare, etc.)
3. **Mentor Phase 1 templates và Templates plan này — auto-merge hay riêng biệt?** Recommend riêng biệt, both export from `templates/index.ts`
4. **Difficulty rating method** — easy/medium/hard hiện hand-rated. Có cần rule (node count? edge count?)
5. **Template thumbnails / previews** — current không có. Cần khi 78 templates không?
