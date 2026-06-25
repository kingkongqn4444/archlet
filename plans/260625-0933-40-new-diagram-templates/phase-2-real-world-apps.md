# Phase 2 — 15 Real-World Apps

**Status:** pending | **Priority:** P0 | **Effort:** 2 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260625-0933-40-new-diagram-templates.md)
- [Plan overview](./plan.md)
- Depends on: Phase 1 (module structure)

## Overview

Author 15 templates mô phỏng real-world apps. Mỗi template ~8-15 nodes, edges + labels. Append vào `templates/real-world-apps.ts` cùng 10 cái cũ.

## Template List

| # | id | name | category | difficulty | tags |
|---|---|---|---|---|---|
| 1 | spotify-music | Spotify Music Streaming | streaming | medium | streaming, recommendation, mobile |
| 2 | discord-chat | Discord Real-time Chat | messaging | medium | websocket, voice, gaming |
| 3 | airbnb-marketplace | Airbnb Marketplace | marketplace | hard | search, booking, payment, geo |
| 4 | tiktok-feed | TikTok For-You Feed | social | hard | ml-rec, video, viral |
| 5 | reddit-aggregator | Reddit Aggregator | social | medium | ranking, comments, voting |
| 6 | slack-messaging | Slack Team Messaging | messaging | medium | channels, search, presence |
| 7 | zoom-video | Zoom Video Calls | messaging | hard | webrtc, signaling, recording |
| 8 | stripe-payment | Stripe Payment Processing | fintech | hard | payments, webhooks, ledger |
| 9 | shopify-ecommerce | Shopify E-commerce | marketplace | medium | catalog, cart, checkout |
| 10 | coinbase-exchange | Coinbase Crypto Exchange | fintech | hard | orderbook, wallet, kyc |
| 11 | pinterest-boards | Pinterest Image Boards | social | medium | search, recommendation, cdn |
| 12 | linkedin-network | LinkedIn Professional Network | social | medium | graph, feed, search |
| 13 | dropbox-sync | Dropbox File Sync | infra | hard | sync, chunking, dedup |
| 14 | yelp-local | Yelp Local Search | marketplace | medium | geo, reviews, ranking |
| 15 | robinhood-trading | Robinhood Trading | fintech | hard | orderbook, market-data, realtime |

## Template Skeleton Pattern

```ts
const spotify: Template = {
  id: "spotify-music",
  name: "Spotify Music Streaming",
  description: "Music streaming với personalization + recommendation pipeline.",
  category: "streaming",
  difficulty: "medium",
  tags: ["streaming", "recommendation", "mobile"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 100 }, data: { label: "Mobile App", variant: "mobile-app", config: { concurrentUsers: 100_000_000, reqPerSec: 10_000, platforms: "both" } } },
      { id: "n2", type: "cdn", position: { x: 240, y: 100 }, data: { label: "CDN", variant: "cloudfront", config: { defaultTtlSec: 86400 } } },
      { id: "n3", type: "load_balancer", position: { x: 480, y: 100 }, data: { label: "LB", variant: "aws-alb", config: { targetGroups: 5 } } },
      { id: "n4", type: "api", position: { x: 720, y: 100 }, data: { label: "API Server", variant: "rest", config: { instances: 50 } } },
      { id: "n5", type: "cache", position: { x: 960, y: 0 }, data: { label: "Playlist Cache", variant: "redis", config: { memoryGb: 32 } } },
      { id: "n6", type: "database", position: { x: 960, y: 100 }, data: { label: "User DB", variant: "postgres", config: { replicas: 3 } } },
      { id: "n7", type: "storage", position: { x: 960, y: 200 }, data: { label: "Audio Files", variant: "s3", config: { storageClass: "standard" } } },
      { id: "n8", type: "worker", position: { x: 720, y: 300 }, data: { label: "Recommendation Worker", variant: "python", config: { instances: 10 } } },
      { id: "n9", type: "queue", position: { x: 480, y: 300 }, data: { label: "Listen Events", variant: "kafka", config: { partitions: 100 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "CDN" },
      { id: "e2", source: "n2", target: "n3", label: "" },
      { id: "e3", source: "n3", target: "n4", label: "" },
      { id: "e4", source: "n4", target: "n5", label: "cache" },
      { id: "e5", source: "n4", target: "n6", label: "metadata" },
      { id: "e6", source: "n4", target: "n7", label: "stream" },
      { id: "e7", source: "n4", target: "n9", label: "events" },
      { id: "e8", source: "n9", target: "n8", label: "" },
      { id: "e9", source: "n8", target: "n6", label: "writes" },
    ],
  },
};
```

## Implementation Steps

1. Cho mỗi template (15 cái):
   - Decide canonical architecture (8-15 nodes)
   - Pick variants từ `variants/` registry
   - Position nodes hợp lý (avoid overlap)
   - Add labels meaningful
   - Set realistic config (rps, instances, etc.)
2. Append vào `templates/real-world-apps.ts` (đã có 10 từ Phase 1)
3. Update `REAL_WORLD_APPS` export array
4. Verify category tags match enum
5. typecheck + smoke test in UI per template

## Todo List

- [ ] spotify-music
- [ ] discord-chat
- [ ] airbnb-marketplace
- [ ] tiktok-feed
- [ ] reddit-aggregator
- [ ] slack-messaging
- [ ] zoom-video
- [ ] stripe-payment
- [ ] shopify-ecommerce
- [ ] coinbase-exchange
- [ ] pinterest-boards
- [ ] linkedin-network
- [ ] dropbox-sync
- [ ] yelp-local
- [ ] robinhood-trading
- [ ] `pnpm typecheck` pass
- [ ] Manual QA: drop 3 random templates → render correctly

## Success Criteria

- 15 new + 10 existing = 25 in REAL_WORLD_APPS
- Each template drop → diagram valid, no schema errors
- Variants used exist in catalog
- File `real-world-apps.ts` < 800 lines (otherwise split by sub-category)
- typecheck pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| 30min/template too short for accuracy | Accept surface-level; mark difficulty="hard" cho cái cần deep |
| Variant config drift (vd: kafka thiếu field) | typecheck catch; fix or simplify |
| Layout overlap (nodes stacked) | Use consistent grid: x = level × 240, y = lane × 150 |
| File size > 800 lines | Split: `real-world-social.ts` + `real-world-fintech.ts` + `real-world-marketplace.ts` |

## Next Steps

→ Phase 3: 10 architectural patterns.
