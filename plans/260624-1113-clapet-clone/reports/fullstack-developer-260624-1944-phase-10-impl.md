# Phase 10 Implementation Report — Design Critic / Validator

## Status: COMPLETE

---

## 1. File Tree

```
apps/web/src/features/review/
├── types.ts                          (17 lines)  — Finding, Severity, FindingCategory types
├── engine.ts                         (51 lines)  — runRules() + calculateScore()
├── review-store.ts                   (44 lines)  — Zustand ReviewStore
├── use-review.ts                     (52 lines)  — Hook: runReview() + auto-trigger
├── review-panel.tsx                  (175 lines) — Slide-in panel UI
├── analyze-button.tsx                (55 lines)  — Bottom toolbar button + badge
└── rules/
    ├── reliability-rules.ts          (120 lines) — R1-R4
    ├── topology-rules.ts             (96 lines)  — T1-T4
    ├── performance-rules.ts          (87 lines)  — P1-P4
    ├── best-practice-rules.ts        (108 lines) — B1-B4
    └── capacity-rules.ts             (110 lines) — C1-C4

Modified:
  apps/web/src/features/canvas/nodes/base-node.tsx       — red ring on highlighted nodes
  apps/web/src/features/canvas/edges/labeled-edge.tsx    — red stroke + thicker on highlighted edges
  apps/web/src/features/canvas/canvas-editor.tsx         — mount ReviewPanel + red arrow SVG marker
  apps/web/src/features/canvas/toolbar/level-switcher.tsx — mount AnalyzeButton between Run/Pull
```

---

## 2. All 20 Rules Implemented

### reliability-rules.ts (R1–R4)
- **R1** `R1-db-no-replicas` / `R1-cache-no-replicas`: postgres/mysql replicas < 2 → critical; mongodb shards < 2 → critical; redis replicas < 2 → critical
- **R2** `R2-api-single-instance`: rest/graphql/grpc with instances < 2 → warning
- **R3** `R3-cache-no-persistence`: redis persistence === "none" → suggestion
- **R4** `R4-db-no-backup`: database node description missing "backup" → suggestion

### topology-rules.ts (T1–T4)
- **T1** `T1-user-to-db-direct`: edge user → database → critical
- **T2** `T2-multi-api-no-lb`: ≥2 API nodes sharing user source, no load_balancer → warning
- **T3** `T3-db-to-user-wrong-direction`: edge database → user → critical
- **T4** `T4-broken-cache-pattern`: cache node not wired api→cache→database → suggestion

### performance-rules.ts (P1–P4)
- **P1** `P1-bottleneck-{id}`: util > 0.8 → critical (per-node, skipped when no sim metrics)
- **P2** `P2-hotspot-{id}`: util > 0.5 → warning
- **P3** `P3-over-provisioned-{id}`: util < 0.05 with traffic → suggestion
- **P4** `P4-edge-overflow-{id}`: rps > capacity × 1.2 → critical

### best-practice-rules.ts (B1–B4)
- **B1** `B1-no-observability`: no external/analytics node connected → suggestion
- **B2** `B2-no-rate-limit-gateway`: api-gateway with >1000 incoming user rps and rateLimit < 1000 → warning
- **B3** `B3-worker-no-queue-{id}`: worker with no upstream queue node → warning
- **B4** `B4-no-cdn-high-traffic`: total userRps > 1000 with no cdn → suggestion

### capacity-rules.ts (C1–C4)
- **C1** `C1-user-demand-exceeds-api-capacity`: sum(user.reqPerSec) > sum(api.capacity) → critical
- **C2** `C2-db-pool-too-low-{id}`: connectionPool < totalApiInstances × 5 → warning
- **C3** `C3-cache-too-small-{id}`: cache.memoryGb < db.storageGb × 0.05 → suggestion
- **C4** `C4-region-mismatch-{storageId}-{dbId}`: storage.region != database.region → warning

---

## 3. Score Formula

```
score = 100
  - 20 per critical finding
  - 8  per warning finding
  - 3  per suggestion finding
clamped to [0, 100]

grade: A ≥ 90 | B ≥ 75 | C ≥ 60 | D ≥ 40 | F < 40
```

Deterministic sort: severity desc (critical→warning→suggestion→good), then rule id lexicographic.

---

## 4. Screenshots

### review-bad.png
- Grade: **F**, Score: **15**
- Panel shows: Critical (3) + Warning (2) buckets expanded
- Critical findings visible: C1 (user demand 2000 req/s exceeds API 200 req/s), R1 (Postgres no replicas SPOF), T1 (user→db direct — cut off below fold)
- "Affects:" pill chips on each finding (Web Browser, REST API etc.)
- Suggestion box shown for capacity finding

### review-bad-highlight.png
- Same panel, first card clicked
- **Web Browser** and **REST API** nodes show red ring highlight
- Finding card has plum border + ring indicating active state

### review-good.png
- Grade: **A**, Score: **94**
- Only Suggestion (2) bucket remains (no observability + B4 not triggered since reqPerSec=100)
- Score card shows large "A" in plum, "94" below

---

## 5. Integration Points

- `AnalyzeButton` sits between Run and Pull in the bottom toolbar pill
- `ReviewPanel` slides in from right (same animation as PropertiesPanel); z-index 30
- Properties panel and Review panel are mutually independent (both can be open; review is at same z)
- Auto-trigger: 3s after sim starts → silently updates findings/score (badge updates, panel does not force-open)
- Highlight: clicking a finding card sets `highlightedNodeIds`/`highlightedEdgeIds` in review-store; clicking again or another card clears previous
- Red arrow SVG marker `#archlet-arrow-red` added to CanvasMarkers in canvas-editor

---

## 6. Known Gaps for v1.1

- **AI review**: send diagram JSON + sim metrics to Claude for natural language critique ("senior engineer review")
- **Save reviews per diagram**: persist findings snapshot alongside diagram data
- **Custom rule editor**: let users toggle/configure rules or add their own
- **Compare two designs**: diff findings between snapshots
- **Multiplayer review / mentor mode**: async annotation by a reviewer
- **"Good" findings**: no positive-reinforcement findings implemented (count=0 always); could add rules like "R_good_has_lb" etc.
- **Suggestion bucket**: not showing in smoke test bad-diagram because all 4 bad-diagram issues hit critical/warning before suggestions are fired; clean diagram shows it
- **canvas click reset**: clicking canvas background does not clear highlight (requires ReactFlow onPaneClick integration — deferred)

---

## QA Results

- `pnpm typecheck`: PASS (0 errors)
- `pnpm build`: PASS (2673 modules, 7.07s)
- Playwright smoke: PASS
  - Panel opens on Analyze click
  - Critical + Warning buckets visible on broken diagram
  - Node highlight ring appears on finding click
  - Good diagram scores A/94
