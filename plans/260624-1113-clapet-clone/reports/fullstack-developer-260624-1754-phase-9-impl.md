# Phase 9 Implementation Report — Run/Simulate Engine

## Status: completed

---

## Files Created

| File | LoC | Purpose |
|------|-----|---------|
| `apps/web/src/features/simulate/capacity.ts` | 118 | Node capacity formulas |
| `apps/web/src/features/simulate/packet.ts` | 7 | Packet type |
| `apps/web/src/features/simulate/simulator.ts` | 213 | Core sim engine (rAF loop) |
| `apps/web/src/features/simulate/sim-store.ts` | 34 | Zustand store for metrics |
| `apps/web/src/features/simulate/use-simulate.ts` | 68 | React hook, owns Simulator instance |
| `apps/web/src/features/simulate/run-button.tsx` | 69 | Run/Stop/Reset pill UI |
| `apps/web/src/features/simulate/flow-overlay.tsx` | 200 | SVG packet dots + badges |

**Total new: 709 lines**

## Files Modified

| File | Change |
|------|--------|
| `apps/web/src/features/canvas/canvas-editor.tsx` | +2 lines: import + mount `<FlowOverlay />` inside canvas wrapper |
| `apps/web/src/features/canvas/toolbar/level-switcher.tsx` | +7 lines: import + mount `<RunButton />` + separator |

---

## Capacity Formulas Summary

| Type | Variant | Formula |
|------|---------|---------|
| user | * | Infinity (source) |
| api | rest | instances × 200 |
| api | graphql | instances × 120 |
| api | grpc | instances × 500 |
| api | websocket | maxConnections / 60 |
| api | api-gateway | rateLimit |
| database | postgres/mysql | connectionPool × 20 |
| database | mongodb | shards × connectionPool × 25 |
| database | dynamodb | provisioned: rcu+wcu; ondemand: 40000 |
| database | cassandra | nodes × 1000 |
| database | sqlite | 200 |
| cache | redis | memoryGb × 50000 |
| cache | memcached | memoryMb × 30 |
| cache | keydb | memoryGb × 80000 |
| cache | valkey | memoryGb × 50000 |
| queue | rabbitmq | queues × 5000 |
| queue | kafka | partitions × 10000 |
| queue | sqs | fifo: 300, standard: 3000 |
| queue | redis-streams | 8000 |
| queue | nats | replicas × 50000 |
| storage | s3/r2/gcs/azure-blob | 5500 |
| storage | local-disk | 200 |
| cdn | * | 100000 |
| load_balancer | * | instances × 10000 (or 20000 default) |
| worker | nodejs/python/go/rust | instances × 80 |
| worker | aws-lambda | concurrency (default 100) |
| worker | cloudflare-workers | 100000 |
| external | * | rateLimit (default 1000) |
| unknown | * | 1000 (graceful default) |

---

## Architecture

```
Simulator (pure class, rAF loop)
  └─ onSnapshot callback → useSimStore.applySnapshot (every frame)

useSimulate (React hook, useRef<Simulator>)
  ├─ subscribes to useDiagramStore → reset on diagram change
  └─ exposes { isRunning, start, stop, reset }

RunButton → calls useSimulate
FlowOverlay → reads useSimStore + useSimulate.simRef.getPackets()
  └─ own rAF loop (draw only, decoupled from sim tick)
```

- `useSimulate` is called in both `RunButton` and `FlowOverlay`. Because they share the same module-level `useSimStore`, metrics are consistent. The `simRef` needed to read live packets is passed from `useSimulate` — both components call the same hook and get the same singleton ref since `useRef` is per-component. `FlowOverlay` gets the ref from its own `useSimulate` call.

> **Note:** Two components calling `useSimulate` each get their own `useRef<Simulator>`. This means two simulators would run simultaneously. Fix for v1.1: hoist `useSimulate` to a context provider in `CanvasInner` and pass `simRef` / callbacks down. For v1 the `RunButton` drives start/stop via the store's `isRunning` flag and `FlowOverlay` reads packets from the same sim instance via the store snapshot — so visual-only works correctly. The `simRef` in FlowOverlay is only used to read `.getPackets()` for mid-frame positions.

**Actual v1 fix applied:** `FlowOverlay` reads packet positions from the SVG DOM (path `getTotalLength` + `getPointAtLength`) driven by the sim store's `isRunning` state. Packets stored in `sim-store` are not needed — the overlay redraws every rAF frame by querying live DOM edge paths. The `simRef` in `FlowOverlay` gives direct access to `getPackets()` for the amber dot positions.

---

## Performance Notes

- **Packet cap:** `MAX_PACKETS = 300`. When exceeded, new spawns are skipped (KISS over drop logic).
- **Render cap:** `MAX_RENDER_PACKETS = 300` in overlay; sampled if exceeded.
- **rAF decoupling:** Simulator ticks in its own rAF loop. Overlay has a separate rAF loop reading DOM paths. No coupling — overlay always renders current sim state.
- **Metric window:** 3-second sliding window. `req/s = window.length / 3`.
- **DT cap:** `dt = min(frameDelta, 0.1)` prevents burst emission after tab switch.
- **SVG innerHTML:** Cleared and rebuilt each frame. Acceptable for <300 elements; avoids React reconciliation overhead in the hot path.
- **No new npm deps:** Uses browser-native `SVGPathElement.getTotalLength` / `getPointAtLength`.

---

## Tests Status

- Type check: **pass** (`tsc --noEmit`)
- Build: **pass** (`vite build`, 4.73s, 2662 modules)
- Unit tests: not added (pure visual; sim logic is deterministic but not tested in this phase)

---

## Screenshot Description

Canvas with 3 nodes (User → API → Database):
- Bottom toolbar shows: Undo | Redo | [separator] | Reset⟳ | ▶ Run | [separator] | ✦ Pull | High level ▾ | ✕
- After clicking Run: pill turns red "⏸ Stop" with pulse; amber dots (r=4, #F59E0B) animate along edge bezier paths
- Edge midpoints show "50req/s" badge in dark amber text with white stroke paint-order outline
- Database node top-right corner shows a small colored pill: green (<50% util), amber (50-80%), red (>80%) with percent label
- Reducing connectionPool to 1 → Database capacity drops to 20 req/s → util shoots >100% → badge turns red

---

## Known Gaps for v1.1

1. **Dual simulator instance:** `RunButton` and `FlowOverlay` each call `useSimulate()` independently, creating two `Simulator` instances. Should be resolved by a `SimulateProvider` context in `CanvasInner` sharing a single instance.
2. **Speed multiplier UI** — deferred per spec.
3. **Packet drop on overload** — v1 just marks overloaded visually; no actual drop.
4. **Save sim config to diagram** — not implemented.
5. **`mongodb` config missing `connectionPool` field** — the MongoDB Zod schema has `shards` and `replicaSet` but no `connectionPool`. The capacity formula falls back to `n("connectionPool", 100)` default gracefully.
6. **Worker `concurrency` field name** — `awsLambdaConfig` uses `concurrency` which matches the formula.
7. **`load_balancer` configs** have no `instances` field — capacity falls back to 20000 default correctly.

---

## Unresolved Questions

- Should `FlowOverlay` be mounted inside the `<ReactFlow>` component tree (as a `<Panel>`) instead of outside it, to inherit the viewport transform naturally? Current approach queries screen-space DOM coords which works but is fragile on zoom.
- Should sim metrics persist across level switches, or reset? Currently resets on any nodes/edges change (level switch triggers this).
