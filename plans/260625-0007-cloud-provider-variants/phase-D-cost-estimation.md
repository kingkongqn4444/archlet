# Phase D — Cost Estimation + Pricing Table

**Status:** pending | **Priority:** P1 | **Effort:** 3–5 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260625-0007-cloud-provider-variants.md)
- [Plan overview](./plan.md)
- Depends on: Phase B (per-cloud SKU + region needed for pricing lookup)

## Overview

Compute USD/month per node based on (variant, cloudProvider, instanceClass/SKU, region). Hardcoded pricing table for top 50 SKUs (covers 90% use case). Display badge per node + total diagram cost + breakdown. KHÔNG live-fetch from cloud pricing APIs (defer to future).

## Key Insights

- `packages/shared/src/pricing.ts` đã exist với `estimateCost` + `LineItem` → reuse infra, just feed cloud-aware data
- Pricing structure: monthly cost = compute hourly × 730 + storage GB × $/GB + network egress (estimate)
- Many costs depend on usage (req/s, storage growth) — for static diagram, estimate steady-state
- Cloud pricing public: AWS pricing.us-east-1.amazonaws.com JSON, GCP Cloud Billing API, Azure Retail Prices API — all complex. Hardcode top SKUs instead
- Show `Estimate ±20%` caveat + last-updated date

## Requirements

**Functional:**
- Per node: badge bottom-right "$X/mo"
- Diagram total: floating panel với breakdown (per cloud, per node type)
- Breakdown chart: pie / stacked bar by cloud
- "Update pricing" manual refresh (no-op for now, just bumps `pricingTableUpdatedAt`)
- Toggle hide/show cost (some users prefer clean view)

**Non-functional:**
- Cost calc <50ms per node
- Pricing table source-controlled, easy to update quarterly
- Diagram total updates reactive khi node config changes

## Architecture

```
packages/shared/src/pricing/
├── pricing.ts                    — EXISTING, refactor as orchestrator
├── pricing-table-aws.ts          — NEW: AWS SKU → USD/month
├── pricing-table-gcp.ts          — NEW: GCP SKU → USD/month
├── pricing-table-azure.ts        — NEW: Azure SKU → USD/month
├── pricing-table-self-hosted.ts  — NEW: VPS price assumptions
├── pricing-types.ts              — NEW: PricingEntry, CostBreakdown types
└── estimate-node-cost.ts         — NEW: main entry point

apps/web/src/features/cost/
├── cost-store.ts                 — EXISTING, refactor for cloud awareness
├── cost-badge.tsx                — NEW: per-node $X/mo badge
├── cost-panel.tsx                — NEW: floating total + breakdown
├── cost-chart.tsx                — NEW: pie/stacked bar
└── use-diagram-cost.ts           — NEW: reactive hook
```

## Related Code Files

**Create:**
- `packages/shared/src/pricing/pricing-table-{aws,gcp,azure,self-hosted}.ts`
- `packages/shared/src/pricing/pricing-types.ts`
- `packages/shared/src/pricing/estimate-node-cost.ts`
- `apps/web/src/features/cost/cost-badge.tsx`
- `apps/web/src/features/cost/cost-panel.tsx`
- `apps/web/src/features/cost/cost-chart.tsx`
- `apps/web/src/features/cost/use-diagram-cost.ts`

**Modify:**
- `packages/shared/src/pricing.ts` → re-export from new pricing/ dir (preserve public API)
- `apps/web/src/features/cost/cost-store.ts` → integrate new estimate-node-cost
- `apps/web/src/features/canvas/nodes/node-card.tsx` → mount CostBadge

## Implementation Steps

1. **Pricing types**:
   ```ts
   export type PricingEntry = {
     variantId: string;
     cloudProvider: CloudProvider;
     sku: string;
     region?: string;
     monthlyUsd: number;
     unit: "instance" | "gb-month" | "request-million" | "hour";
   };

   export type CostBreakdown = {
     totalUsd: number;
     perCloud: Record<CloudProvider, number>;
     perNode: Array<{ nodeId: string; label: string; usd: number; variant: string }>;
     updatedAt: string; // "as of YYYY-MM"
   };
   ```
2. **AWS pricing table** (sample, ~50 entries):
   ```ts
   export const AWS_PRICING: PricingEntry[] = [
     { variantId: "postgres", cloudProvider: "aws", sku: "db.t3.micro", monthlyUsd: 12.96, unit: "instance" },
     { variantId: "postgres", cloudProvider: "aws", sku: "db.m5.large", monthlyUsd: 124.49, unit: "instance" },
     { variantId: "postgres", cloudProvider: "aws", sku: "storage-gp3", monthlyUsd: 0.115, unit: "gb-month" },
     { variantId: "s3", cloudProvider: "aws", sku: "standard", monthlyUsd: 0.023, unit: "gb-month" },
     { variantId: "aws-lambda", cloudProvider: "aws", sku: "requests", monthlyUsd: 0.20, unit: "request-million" },
     { variantId: "aws-lambda", cloudProvider: "aws", sku: "gb-second", monthlyUsd: 0.0000166667, unit: "hour" }, // pro-rated
     /* … */
   ];
   ```
3. **GCP + Azure tables**: similar shape, ~30-40 entries each
4. **Self-hosted table**: assumption VPS pricing (DigitalOcean / Hetzner) per CPU + RAM tier
5. **estimate-node-cost**:
   ```ts
   export function estimateNodeCost(node: Node): { usd: number; breakdown: string[] } {
     const cfg = node.data.config as any;
     const cloud = cfg.cloudProvider ?? "self-hosted";
     const table = PRICING_TABLES[cloud];
     // lookup instance/sku → multiply storage/requests as relevant → sum
     let total = 0;
     const breakdown: string[] = [];
     // Instance cost
     const skuKey = cfg.instanceClass ?? cfg.sku ?? cfg.tier;
     const instance = table.find(p => p.variantId === node.type && p.sku === skuKey && p.unit === "instance");
     if (instance) {
       const inst = (cfg.replicas ?? 1) * instance.monthlyUsd;
       total += inst;
       breakdown.push(`${instance.sku} × ${cfg.replicas ?? 1} = $${inst.toFixed(2)}`);
     }
     // Storage cost
     if (cfg.storageGb) {
       const storage = table.find(p => p.variantId === node.type && p.unit === "gb-month");
       if (storage) {
         const storageCost = cfg.storageGb * storage.monthlyUsd;
         total += storageCost;
         breakdown.push(`${cfg.storageGb} GB × $${storage.monthlyUsd}/GB = $${storageCost.toFixed(2)}`);
       }
     }
     return { usd: total, breakdown };
   }
   ```
6. **use-diagram-cost hook**: subscribe to diagram-store, recompute on change, memoized
7. **CostBadge**: render bottom-right of node card, click → popover với breakdown
8. **CostPanel**: floating right-bottom, total + chart
9. **Toggle**: button in toolbar "Show costs", persisted to localStorage

## Todo List

- [ ] Refactor `packages/shared/src/pricing.ts` to pricing/ directory
- [ ] Create `pricing-types.ts`
- [ ] Author AWS_PRICING table (~50 entries, top SKUs)
- [ ] Author GCP_PRICING table (~30 entries)
- [ ] Author AZURE_PRICING table (~30 entries)
- [ ] Author SELF_HOSTED_PRICING table (~15 entries, VPS tiers)
- [ ] Implement `estimate-node-cost.ts`
- [ ] Create `use-diagram-cost.ts` hook
- [ ] Create `cost-badge.tsx`
- [ ] Create `cost-panel.tsx` với total + breakdown
- [ ] Create `cost-chart.tsx` (use recharts or simple SVG)
- [ ] Mount CostBadge trong node-card.tsx (conditional on cost-toggle)
- [ ] Add "Show costs" toolbar toggle
- [ ] Update cost-store.ts integration
- [ ] Caveat banner "Estimates ±20%, last updated YYYY-MM"
- [ ] Manual QA: build diagram (3 nodes AWS), verify total reasonable vs AWS calculator
- [ ] `pnpm typecheck` pass

## Success Criteria

- Drop Postgres (AWS, db.m5.large, 100GB) → badge shows `$136/mo` (instance + storage)
- Add Redis (AWS, cache.m5.large) → badge `$140/mo`
- Total panel: `$276/mo` + AWS pie 100%
- Switch Postgres cloud → GCP → cost recalculates với GCP SKU
- Toggle "Hide costs" → badges disappear, panel hides
- Compares within ±20% of official AWS pricing calculator for same config
- typecheck pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Pricing data stale (3+ months) | Display `updatedAt` banner; document quarterly refresh process |
| Missing SKU → no cost shown | Show "N/A" badge instead of zero; log warning |
| User misinterprets estimate as actual bill | Bold caveat in cost panel + tooltip on every badge |
| Diagram with 100+ nodes → slow recompute | Memoize per node by config-hash; debounce 100ms |
| Pricing varies by region (us-east-1 vs eu-west-1) | Phase D simplification: use us-east-1 as baseline; document; add region-aware in future |
| Network egress missing (real cost driver) | Approximate per edge based on `req/s` simulation data; or skip with note "egress not included" |
| Reserved instance discounts ignored | Document; show "On-demand price" only |

## Security Considerations

None — pure calculation, no secrets, no external calls.

## Next Steps

After phase D ship: feature complete (cloud variants A+B+C+D). Future ideas:
- Live pricing via Vantage/Infracost API (replace hardcoded tables)
- Multi-region cost comparison view
- Reserved instance / Savings Plan optimizer
- Cost alerting threshold notifications
