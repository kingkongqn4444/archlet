# Brainstorm — Phase 15: Health Heatmap (color-coded edges + node borders)

**Date:** 2026-06-24 21:07
**Status:** queued — wait for Phase 14 agents to finish before implementation
**Trigger:** user request — "line nào bị lỗi hay warning hay chạy ổn k bị nén cổ chai thì hiển thị color lên luôn"

---

## Decisions chốt

| Decision | Choice |
|---|---|
| **When to apply color** | Sim running → metrics-driven; idle → review-findings-driven |
| **Logic** | Per-edge color = derived from TARGET node's util + status (KISS) |
| **Node border tint** | YES — sync với edge color cho consistency at-a-glance |
| **Schedule** | Phase 15, after Phase 14a + 14b agents finish (avoid file conflict with Failure Mode agent) |

---

## Color logic

### Sim running mode
| State | Trigger | Edge | Node border |
|---|---|---|---|
| 🔴 Critical | target dead OR util > 0.8 | `red-500` solid 2.5px + glow + fast dash | `border-red-500` + soft pulse |
| 🟡 Warning | target util > 0.5 ≤ 0.8 | `amber-500` dashed + slow pulse | `border-amber-500` |
| 🟢 Healthy | target util ≤ 0.5 AND traffic > 0 | `emerald-500` solid + animated dash | `border-emerald-500` |
| ⚪ Idle | no traffic | default `slate-400/40` dashed | default cream-200 |

### Sim idle mode (review-driven)
| State | Trigger | Edge | Node border |
|---|---|---|---|
| 🔴 Critical | review finding critical hits this edge/node | `red-500` solid + glow | `border-red-500` |
| 🟡 Warning | review finding warning hits | `amber-500` dashed | `border-amber-500` |
| ⚪ Default | no finding | default amber dashed (existing) | default |

When sim transitions running ↔ idle, transition smoothly (300ms ease).

---

## Data sources

- **Sim running:** `useSimStore.nodeMetrics[targetId].util` → bucket into red/amber/green
- **Sim idle (review-driven):** `useReviewStore.findings` → for each finding, `nodeIds[]` and `edgeIds[]` mark those edges/nodes with severity
- **Failure Mode:** `useSimStore.deadNodes` (after Phase 14b ships) → dead node → red border, all incoming edges → red

---

## Implementation outline (for future agent)

### Files to modify
- `apps/web/src/features/canvas/edges/labeled-edge.tsx`
  - Read `useSimStore` + `useReviewStore`
  - Derive `healthColor` for current edge based on target node state
  - Apply stroke color + style class via prop on `<BaseEdge>`
- `apps/web/src/features/canvas/nodes/base-node.tsx`
  - Derive `healthColor` per node
  - Apply border tint via Tailwind class on the card wrapper
- `apps/web/src/features/canvas/health/health-store.ts` (new)
  - Helper hook `useNodeHealth(nodeId)` returns `"critical" | "warning" | "healthy" | "idle"`
  - Helper hook `useEdgeHealth(edgeId)` returns same
  - Pure functions; no state of its own — derives from sim + review stores
- `apps/web/src/globals.css`
  - Add 3 keyframes: `.archlet-edge-critical` (fast dash 0.4s + red glow), `.archlet-edge-warning` (slow dash 1.2s amber), `.archlet-edge-healthy` (smooth dash 0.6s emerald)

### Hooks structure
```ts
// health-store.ts
export function useNodeHealth(nodeId: string): HealthLevel {
  const isRunning = useSimStore(s => s.isRunning);
  const nodeMetric = useSimStore(s => s.nodeMetrics[nodeId]);
  const deadNodes = useSimStore(s => s.deadNodes); // after Phase 14b
  const findings = useReviewStore(s => s.findings);

  if (deadNodes?.has(nodeId)) return "critical";
  if (isRunning && nodeMetric) {
    if (nodeMetric.util > 0.8) return "critical";
    if (nodeMetric.util > 0.5) return "warning";
    if (nodeMetric.arrivalRate > 0) return "healthy";
    return "idle";
  }
  // idle mode — check review findings
  const matching = findings.filter(f => f.nodeIds.includes(nodeId));
  if (matching.some(f => f.severity === "critical")) return "critical";
  if (matching.some(f => f.severity === "warning")) return "warning";
  return "idle";
}

export function useEdgeHealth(edgeId: string): HealthLevel {
  // similar but check edges_ids + derive from target node
}
```

### KISS choices
- No animated transitions between health states beyond CSS 300ms ease — no React Spring
- Only 4 buckets — no intermediate gradient
- Reuse existing CSS infrastructure (`archlet-edge-active`, `archlet-edge-flow`)
- No new dependency

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Visual noise (every edge changing color) | Default to idle/dim when no signal; only colorize meaningful states |
| Performance (re-render on every sim tick) | useSimStore selector returns stable refs; React.memo on edge components |
| Conflict with Phase 14b Failure Mode | Phase 15 reads `deadNodes` AFTER 14b ships — natural dependency, no race |
| Edge color = target color: misleads when SOURCE is healthy but TARGET overloaded | Acceptable: that IS the bottleneck signal (target backed-up) |

---

## Success criteria

- User opens canvas with templates loaded → review auto-runs → critical findings paint edges red without sim running
- User clicks Run → packets flow; util on a node spikes > 80% → that node + incoming edges turn red live
- User stops sim → colors persist from last review state (or fade to idle if no findings)
- Color transitions smooth (300ms), no flicker

---

## Implementation timeline

**Wait for:** Phase 14a (Mentor + Cost) + Phase 14b (Failure + Patterns) to merge.

**Then spawn:** single fullstack-developer agent for ~40k tokens, ~30 min.

**Verification:** playwright capture 3 states (idle review-critical → run-sim → after stop).

---

## Unresolved questions
None — all decisions chốt by user.
