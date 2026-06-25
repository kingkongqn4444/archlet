# Phase A — Cloud Tag + Icon Swap

**Status:** pending | **Priority:** P0 | **Effort:** 2 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260625-0007-cloud-provider-variants.md)
- [Plan overview](./plan.md)

## Overview

Minimal cloud awareness: add `cloudProvider` field vào mọi variant config (default `self-hosted`), per-variant whitelist `availableClouds`, per-(variant, cloud) `cloudIconSlug` để swap icon trên canvas. KHÔNG conditional config fields (Phase B), KHÔNG IaC (Phase C), KHÔNG cost (Phase D).

## Key Insights

- 49 variants vừa được modularize → mỗi file (user/api/database/cache/...ts) thêm field `cloudProvider` enum + default
- `Variant` type ở `types.ts` cần extend với `availableClouds` + `cloudIconSlug`
- Icon render: `node-card.tsx` đọc `variant.iconSlug` → thêm logic resolve theo `config.cloudProvider`
- Simple Icons (`simpleicons.org`) có sẵn `amazonwebservices`, `googlecloud`, `microsoftazure`, `cloudflare`
- Service-specific brand icons (RDS, Lambda…) — use cloud-provider base icon, defer per-service icons sang Phase B nếu cần

## Requirements

**Functional:**
- Mỗi variant config có `cloudProvider` dropdown (5 options) trong properties panel
- Node icon swap theo cloudProvider (AWS icon nếu `cloudProvider=aws`, GCP nếu `gcp`, etc.)
- Variants chỉ self-hosted (vd: sqlite, local-disk) chỉ hiện 1 option trong dropdown
- Variants cloud-locked (vd: dynamodb, aws-lambda, r2) auto-pin cloudProvider không cho đổi

**Non-functional:**
- Backwards-compat: existing diagram (saved JSON không có cloudProvider) load không break — default to first allowed cloud per variant

## Architecture

```
packages/shared/src/
├── cloud-providers.ts            — NEW: CloudProvider enum + region lists + cloud display names
└── variants/
    ├── types.ts                  — EXTEND: availableClouds, cloudIconSlug
    ├── user.ts                   — add cloudProvider field per variant
    ├── api.ts                    — same
    ├── database.ts               — same
    ├── cache.ts                  — same
    ├── queue.ts                  — same
    ├── storage.ts                — same
    ├── cdn.ts                    — same
    ├── load-balancer.ts          — same
    ├── worker.ts                 — same
    └── external.ts               — same

apps/web/src/features/canvas/
├── nodes/node-card.tsx           — MODIFY: resolve icon by cloudProvider
└── properties/variant-config-form.tsx — already auto-renders enum (no change phase A)
```

## Related Code Files

**Create:**
- `packages/shared/src/cloud-providers.ts` (~50 lines)

**Modify (all in packages/shared/src/variants/):**
- `types.ts` (add 2 optional fields)
- All 10 category files: add `cloudProvider` to each variant's schema + assign `availableClouds` + optional `cloudIconSlug` map
- `index.ts` (re-export cloud-providers)
- `apps/web/src/features/canvas/nodes/node-card.tsx` (icon resolver)

## Implementation Steps

1. **Create `cloud-providers.ts`**:
   ```ts
   export const CLOUD_PROVIDERS = ["self-hosted", "aws", "gcp", "azure", "cloudflare"] as const;
   export type CloudProvider = typeof CLOUD_PROVIDERS[number];

   export const CLOUD_DISPLAY_NAMES: Record<CloudProvider, string> = {
     "self-hosted": "Self-Hosted",
     aws: "AWS",
     gcp: "Google Cloud",
     azure: "Microsoft Azure",
     cloudflare: "Cloudflare",
   };

   export const CLOUD_ICON_SLUGS: Record<CloudProvider, string> = {
     "self-hosted": "ubuntu", // fallback
     aws: "amazonwebservices",
     gcp: "googlecloud",
     azure: "microsoftazure",
     cloudflare: "cloudflare",
   };

   export const AWS_REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1", "ap-northeast-1"] as const;
   export const GCP_REGIONS = ["us-central1", "us-east1", "europe-west1", "asia-southeast1"] as const;
   export const AZURE_REGIONS = ["eastus", "westus2", "westeurope", "southeastasia"] as const;
   ```
2. **Extend `Variant` type** in `types.ts`:
   ```ts
   import type { CloudProvider } from "../cloud-providers";
   export type Variant = {
     id: string;
     label: string;
     iconSlug?: string;
     description?: string;
     configSchema: VariantConfigSchema;
     availableClouds?: readonly CloudProvider[]; // default ["self-hosted"]
     cloudIconSlug?: Partial<Record<CloudProvider, string>>; // override per cloud
   };
   ```
3. **Per variant — add field**: ở 49 variants, thêm vào config schema:
   ```ts
   const postgresConfig = z.object({
     cloudProvider: z.enum(["self-hosted", "aws", "gcp", "azure"]).default("self-hosted"),
     /* existing fields */
   });
   ```
   Quan trọng: `.enum([...])` literal phải MATCH `availableClouds`. Helper:
   ```ts
   const dbAvailableClouds = ["self-hosted", "aws", "gcp", "azure"] as const;
   ```
   Reuse across variants in same file.
4. **Per variant — set availableClouds** trong VARIANT array:
   ```ts
   { id: "postgres", ..., configSchema: postgresConfig, availableClouds: ["self-hosted", "aws", "gcp", "azure"] }
   { id: "dynamodb", ..., availableClouds: ["aws"] }
   { id: "sqlite", ..., availableClouds: ["self-hosted"] }
   { id: "r2", ..., availableClouds: ["cloudflare"] }
   ```
5. **Per variant — cloudIconSlug** (optional, only when default cloud icon insufficient):
   ```ts
   { id: "postgres", ..., cloudIconSlug: { aws: "amazonrds", gcp: "googlecloud", azure: "microsoftazure" } }
   ```
   Defer most — use generic cloud icon initially.
6. **Icon resolver** in `node-card.tsx`:
   ```ts
   const cfg = data.config as { cloudProvider?: CloudProvider };
   const cloud = cfg?.cloudProvider ?? "self-hosted";
   const slug = cloud !== "self-hosted"
     ? variant.cloudIconSlug?.[cloud] ?? CLOUD_ICON_SLUGS[cloud]
     : variant.iconSlug;
   ```
7. **Backwards-compat in `parseVariantConfig`**: Zod default đã handle. Verify: load 1 existing diagram, ensure cloudProvider auto-populates.
8. **Properties panel auto-renders** cloudProvider field như enum dropdown (existing logic in `variant-config-form.tsx` line 49-66) — no change needed.

## Todo List

- [ ] Create `packages/shared/src/cloud-providers.ts`
- [ ] Export from `packages/shared/src/index.ts`
- [ ] Extend `Variant` type với 2 optional fields
- [ ] Update all 10 variant category files: add `cloudProvider` enum + default to each schema, add `availableClouds` to variant entries
- [ ] Identify cloud-locked variants (dynamodb, aws-lambda, sqs, r2, cloudflare-workers, gcs, azure-blob, etc.) — limit `availableClouds`
- [ ] Update `node-card.tsx` icon resolver
- [ ] Verify backwards-compat: load 1 saved diagram → no errors, cloudProvider default applied
- [ ] Manual QA: drop Postgres → properties panel show CloudProvider dropdown → switch to AWS → icon swaps
- [ ] `pnpm typecheck` pass

## Success Criteria

- Drop Postgres node → properties show `Cloud Provider: Self-Hosted ▼` dropdown
- Change to "AWS" → node icon swaps to AWS logo
- Drop DynamoDB → dropdown only shows "AWS" (locked)
- Drop SQLite → dropdown only shows "Self-Hosted" (locked)
- Existing diagrams (no cloudProvider field) load cleanly with default applied
- typecheck pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Enum mismatch giữa `availableClouds` và Zod enum literal | Use shared `as const` array; lint rule to verify consistency (manual review for now) |
| Icon slug not in simpleicons → 404 | Fallback to existing `variant.iconSlug` nếu cloudIconSlug undefined |
| Variants với fixed iconSlug (vd: postgres icon) override cloud icon UX confusion | Document: cloud icon takes precedence khi cloudProvider !== self-hosted |
| Capacity rules / simulator references config fields | Phase A doesn't change existing fields, only ADD cloudProvider; existing consumers unaffected |

## Security Considerations

None — pure UI / config addition.

## Next Steps

→ Phase B: Conditional config form (discriminatedUnion + per-cloud SKU fields).
