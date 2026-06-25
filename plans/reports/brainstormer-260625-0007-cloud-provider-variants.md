# Cloud Provider Variants — Brainstorm Summary

**Date:** 2026-06-25
**Owner:** kingkongqn4444
**Approach chốt:** Cloud tag trên variant hiện có + full A→D phases

---

## Problem Statement

User muốn "thêm tất cả services AWS / Microsoft / GCP" để dễ kéo thả + config. Real goal (multi-select): IaC export chính xác + cost estimation + visual branding + general coverage.

**Tao đã push back:** thêm 500+ services riêng biệt = YAGNI fail, duplicate (RDS Postgres == self-hosted Postgres + tag), maintenance nightmare. **Cloud tag approach** giải quyết tất cả 4 goals với 1/10 effort.

---

## Final Architecture: Cloud Tag

Add `cloudProvider` field vào MỌI variant. Value đổi → variant biến hình:

```ts
const postgresConfig = z.discriminatedUnion("cloudProvider", [
  z.object({
    cloudProvider: z.literal("self-hosted"),
    instanceClass: z.string().default("custom"),
    /* existing fields */
  }),
  z.object({
    cloudProvider: z.literal("aws"),
    instanceClass: z.enum(["db.t3.micro", "db.t3.small", "db.m5.large", "db.m5.xlarge", "db.r5.2xlarge"]),
    region: z.enum([...AWS_REGIONS]),
    storageType: z.enum(["gp3", "gp2", "io1", "io2"]),
    /* ... */
  }),
  z.object({
    cloudProvider: z.literal("gcp"),
    instanceClass: z.enum(["db-f1-micro", "db-n1-standard-1", "db-n1-standard-4", "db-n1-highmem-8"]),
    region: z.enum([...GCP_REGIONS]),
    tier: z.enum(["enterprise", "enterprise-plus"]),
  }),
  z.object({
    cloudProvider: z.literal("azure"),
    tier: z.enum(["Basic", "GeneralPurpose", "MemoryOptimized"]),
    region: z.enum([...AZURE_REGIONS]),
    skuName: z.enum(["GP_Gen5_2", "GP_Gen5_4", "MO_Gen5_8"]),
  }),
]);
```

**Per variant whitelist** (not all clouds have every service):
```ts
type Variant = {
  /* existing fields */
  availableClouds?: CloudProvider[]; // default: ['self-hosted']
  cloudIconSlug?: Partial<Record<CloudProvider, string>>; // override iconSlug per cloud
};
```

---

## Evaluated Approaches (recap)

| | Pros | Cons | Verdict |
|---|---|---|---|
| **A. Cloud tag (chosen)** | 1 variant covers N clouds; no duplication; clean | Form cần upgrade discriminatedUnion | ✅ |
| B. New variant per service (RDS, ElastiCache, etc.) | Explicit, simple Zod | 500+ variants; massive duplication; dropdown hell | ❌ |
| C. JSON catalog, no Zod per service | Cover 500 in hours | Mất type safety; generic key/value form xấu | ❌ |
| D. Status quo (49 variants) | Zero work | Không có IaC/cost per cloud | ❌ |

---

## Phasing (Full Ship A→D, ~13–19 ngày)

### Phase A — Cloud Tag + Icon Swap (2 ngày)
- Add `CloudProvider` type, `AVAILABLE_CLOUDS` enum
- Add `cloudProvider` to mọi variant (default `self-hosted`)
- Add `availableClouds` whitelist per variant
- Add `cloudIconSlug` map; node-card swap icon dynamically
- Cloud icons: lucide + simpleicons (aws, googlecloud, microsoftazure, cloudflare)

### Phase B — Conditional Config per Cloud (5–7 ngày)
- Upgrade `variant-config-form.tsx` hỗ trợ `z.ZodDiscriminatedUnion`:
  - Detect discriminator key → render dropdown
  - On change → switch to matching schema branch
  - Preserve common fields, reset cloud-specific
- Hand-author top 15 variants với 4 cloud branches:
  - DB: postgres, mysql, mongodb, redis, cassandra
  - Compute: rest, nodejs, python, aws-lambda
  - Storage: s3, gcs, azure-blob (already cloud-specific)
  - Messaging: kafka, rabbitmq, sqs
- Còn lại keep self-hosted only hoặc rolling

### Phase C — IaC Export per Cloud (3–5 ngày)
- Extend `apps/web/src/features/export/iac/`:
  - `terraform-aws.ts` (exists) → cover added fields
  - `terraform-gcp.ts` (new)
  - `terraform-azure.ts` (new)
  - `pulumi-aws.ts` (optional, defer)
- Per variant + cloud combo → resource block template
- Test: export 1 demo diagram per cloud → run `terraform plan` locally

### Phase D — Cost Estimation (3–5 ngày)
- Pricing table: `packages/shared/src/cloud-pricing.ts`
  - Hand-author USD/month per (variant, cloud, instanceClass, region)
  - Top 50 SKUs only (covers 90% use case)
- Cost overlay UI: badge on each node = "$X/mo"
- Diagram total: sum + breakdown chart
- **Stale data warning:** show "as of YYYY-MM" + manual refresh

---

## Implementation Considerations

### Form upgrade for discriminatedUnion
Current `variant-config-form.tsx` only handles `z.ZodObject`. Must add branch:
```ts
if (schema instanceof z.ZodDiscriminatedUnion) {
  const discriminator = schema.discriminator;
  const currentValue = values[discriminator];
  const branch = schema.optionsMap.get(currentValue);
  // render discriminator dropdown + branch fields
}
```

### Icon swap
`node-card.tsx` reads `variant.iconSlug`. Change to:
```ts
const slug = variant.cloudIconSlug?.[config.cloudProvider] ?? variant.iconSlug;
```

### IaC mapping registry
```ts
// packages/shared/src/iac-mappings/postgres.ts
export const postgresIaC: Record<CloudProvider, IaCMapper> = {
  aws: (node) => `resource "aws_db_instance" "${node.id}" { ... }`,
  gcp: (node) => `resource "google_sql_database_instance" "${node.id}" { ... }`,
  azure: (node) => `resource "azurerm_postgresql_flexible_server" "${node.id}" { ... }`,
  "self-hosted": (node) => `# self-hosted ${node.id}\n`,
  cloudflare: () => "",
};
```

---

## Risks

| Risk | Mitigation |
|---|---|
| **Total backlog overflow** | Mentor (18-23d) + Cloud (13-19d) = **31-42d solo (~6-8 tuần)**. Risk: cả 2 unfinished. → Suggest serialize: ship Cloud A (2d) ngay, defer B/C/D after Mentor done |
| Form refactor breaks existing flat variants | Backwards-compat: keep `ZodObject` branch untouched; only add discriminatedUnion branch |
| Per-cloud SKU lists drift (cloud thêm instance mới) | Accept; manual refresh quarterly; document update process |
| Pricing data accuracy | Caveat banner "estimate only, see official cloud calc"; defer auto-pricing API integration |
| IaC export buggy / non-runnable | Add 1 example per cloud + manual `terraform validate` test in CI |
| Variant count balloons trong dropdown | Variant count KHÔNG đổi — vẫn 49. Chỉ config field thay đổi theo cloudProvider |
| Conditional config UX rối | Visual cue: when cloudProvider changes → animate field swap + show "AWS RDS config" header |

---

## Success Metrics

- Set Postgres → cloudProvider=aws → icon swap RDS, fields appear (instanceClass dropdown 5 AWS SKUs)
- Export Terraform → ra `aws_db_instance` resource đúng config
- Cost badge hiển thị `$45/mo` cho node, total diagram `$340/mo`
- typecheck pass after refactor; existing 49-variant flow chưa break

---

## Next Steps

**Recommend serialize** (do NOT parallel với Mentor):
1. Phase A (2d) ngay — quick win cho visual
2. Pause cloud work; ship Mentor Phase 1 first
3. Phase B/C/D sau khi Mentor stable

Hoặc **commit full parallel** nếu mày OK với 6-8 tuần backlog.

---

## Unresolved Questions

1. **Cost data source:** hardcode SKU table vs integrate Vantage/Infracost API? Free Vantage có rate limit.
2. **Cloudflare là cloud thứ 5?** Hiện `r2`, `cloudflare-workers` v.v. là variant riêng. Maybe consolidate: `storage` + cloudProvider=cloudflare = r2. Cần audit existing variants để decide merge/keep.
3. **Self-hosted có cần config region không?** Region nghĩa khác (data center DC vs cloud region). Keep `region: z.string()` free text cho self-hosted.
4. **Multi-cloud diagram support?** User có thể có 1 diagram dùng cả AWS + GCP nodes. Current architecture support được — chỉ là warning trong rules engine.
5. **Phase B variant priority list (top 15) — đúng chưa?** Mày có service ưu tiên khác không?
