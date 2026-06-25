# Phase 4 — 15 Industry-Specific Templates

**Status:** pending | **Priority:** P0 | **Effort:** 2 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260625-0933-40-new-diagram-templates.md)
- [Plan overview](./plan.md)
- Depends on: Phase 1 (module structure + new categories: healthcare/gaming/iot/edtech/logistics/ai)

## Overview

Author 15 templates đặc thù theo industry. Khác Phase 2/3: focus vào domain constraint (HIPAA compliance, FHIR for healthcare; PSD2 for fintech; realtime requirements for gaming).

## Template List

| # | id | name | category | difficulty | tags |
|---|---|---|---|---|---|
| 1 | healthcare-ehr-fhir | Healthcare EHR (FHIR) | healthcare | hard | hipaa, fhir, audit |
| 2 | telemedicine-platform | Telemedicine Platform | healthcare | hard | video, ehr, scheduling |
| 3 | fintech-open-banking | FinTech Open Banking | fintech | hard | psd2, oauth, ledger |
| 4 | insurance-claims | Insurance Claims Processing | fintech | medium | workflow, ocr, fraud |
| 5 | edtech-lms | EdTech LMS | edtech | medium | course, video, assessment |
| 6 | multiplayer-game-backend | Multiplayer Game Backend | gaming | hard | realtime, matchmaking, leaderboard |
| 7 | iot-telemetry-pipeline | IoT Telemetry Pipeline | iot | hard | mqtt, timeseries, alerting |
| 8 | logistics-tracking | Logistics Tracking | logistics | medium | gps, route, eta |
| 9 | travel-booking-ota | Travel Booking (OTA) | marketplace | hard | search, inventory, payment |
| 10 | real-estate-listings | Real Estate Listings | marketplace | medium | search, geo, images |
| 11 | music-royalty | Music Royalty Distribution | fintech | hard | ledger, micropayments |
| 12 | live-auction | Live Auction Platform | marketplace | hard | realtime, bidding, payment |
| 13 | loyalty-rewards | Loyalty / Rewards Program | fintech | easy | points, redemption |
| 14 | smart-home-hub | Smart Home Hub | iot | medium | iot, automation, mobile |
| 15 | llm-saas-backend | AI/LLM SaaS Backend | ai | medium | embeddings, vector, rate-limit |

## Example Skeleton (LLM SaaS)

```ts
const llmSaasBackend: Template = {
  id: "llm-saas-backend",
  name: "AI/LLM SaaS Backend",
  description: "LLM API service with rate limiting, embedding cache, vector retrieval.",
  category: "ai",
  difficulty: "medium",
  tags: ["embeddings", "vector", "rate-limit", "openai"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 150 }, data: { label: "Developer App", variant: "web-browser", config: { reqPerSec: 200 } } },
      { id: "n2", type: "api", position: { x: 240, y: 150 }, data: { label: "API Gateway", variant: "api-gateway", config: { provider: "cloudflare", rateLimit: 10000, auth: true } } },
      { id: "n3", type: "worker", position: { x: 480, y: 150 }, data: { label: "Inference Service", variant: "python", config: { instances: 20 } } },
      { id: "n4", type: "external", position: { x: 720, y: 50 }, data: { label: "LLM Provider", variant: "ai-provider", config: { provider: "anthropic", modelName: "claude-sonnet-4-6" } } },
      { id: "n5", type: "cache", position: { x: 720, y: 250 }, data: { label: "Embedding Cache", variant: "redis", config: { memoryGb: 64 } } },
      { id: "n6", type: "database", position: { x: 480, y: 350 }, data: { label: "Vector DB", variant: "postgres", config: { replicas: 2 } } },
      { id: "n7", type: "queue", position: { x: 240, y: 350 }, data: { label: "Async Jobs", variant: "sqs", config: {} } },
      { id: "n8", type: "worker", position: { x: 0, y: 350 }, data: { label: "Embedding Worker", variant: "python", config: { instances: 5 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "POST /v1/chat" },
      { id: "e2", source: "n2", target: "n3", label: "" },
      { id: "e3", source: "n3", target: "n5", label: "cache lookup" },
      { id: "e4", source: "n3", target: "n6", label: "vector query" },
      { id: "e5", source: "n3", target: "n4", label: "completion" },
      { id: "e6", source: "n3", target: "n7", label: "log usage" },
      { id: "e7", source: "n7", target: "n8", label: "" },
      { id: "e8", source: "n8", target: "n6", label: "embed + insert" },
    ],
  },
};
```

## Implementation Steps

1. Research per industry: typical components + compliance requirements
2. Skeleton 7-12 nodes per template
3. Add domain-specific labels (vd: "FHIR Bundle", "PSD2 Consent", "Match Tick")
4. Append vào `templates/industry-specific.ts`
5. Update `INDUSTRY_SPECIFIC` export

## Todo List

- [ ] healthcare-ehr-fhir
- [ ] telemedicine-platform
- [ ] fintech-open-banking
- [ ] insurance-claims
- [ ] edtech-lms
- [ ] multiplayer-game-backend
- [ ] iot-telemetry-pipeline
- [ ] logistics-tracking
- [ ] travel-booking-ota
- [ ] real-estate-listings
- [ ] music-royalty
- [ ] live-auction
- [ ] loyalty-rewards
- [ ] smart-home-hub
- [ ] llm-saas-backend
- [ ] `pnpm typecheck` pass
- [ ] Manual QA 5 random templates (cover all new categories)

## Success Criteria

- 15 templates in `INDUSTRY_SPECIFIC`
- All 6 new categories used (healthcare, gaming, iot, edtech, logistics, ai)
- Domain-specific labels meaningful (not generic "request"/"response")
- typecheck pass
- Filter "AI" in UI shows llm-saas-backend

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Domain accuracy (FHIR / PSD2 / HIPAA correctness) | Use approximation, mark difficulty="hard"; not production blueprints |
| Compliance overlay nodes missing (audit log, encryption gateway) | Add as labeled nodes/edges; defer dedicated "compliance" variants |
| Some industries niche (music royalty, live auction) — user never uses | Acceptable for personal learning tool; quantity is the explicit goal |
| Realtime gaming requires WebSocket variant + matchmaking | Use existing `websocket` variant + worker labeled "Matchmaker" |

## Next Steps

Feature ship complete. Future ideas:
- AI auto-generate template from app description (defer to Mentor)
- Template marketplace / share library
- Template thumbnails for visual picker
- Localized templates (Vietnam-specific: VietQR payment, etc.)
