# Phase B — Conditional Config Form (discriminatedUnion)

**Status:** pending | **Priority:** P0 | **Effort:** 5–7 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260625-0007-cloud-provider-variants.md)
- [Plan overview](./plan.md)
- Depends on: Phase A (cloudProvider field + availableClouds whitelist must exist)

## Overview

Upgrade `variant-config-form.tsx` để hỗ trợ `z.discriminatedUnion('cloudProvider', [...])`. Khi user đổi cloudProvider → form re-render với per-cloud fields (instance class, region, tier, etc.). Hand-author top 15 variants với 4-cloud branches.

## Key Insights

- Current form chỉ handle flat `z.ZodObject`. Discriminated union → cần new branch
- `z.ZodDiscriminatedUnion` exposes `discriminator` + `optionsMap`
- Khi switch cloud branch: preserve common fields, reset cloud-specific (call `parseVariantConfig` với new cloudProvider)
- Phase A đã add cloudProvider as plain enum — Phase B replaces với discriminatedUnion → existing data migration: keep common fields, drop unmatched

## Requirements

**Functional:**
- Form detect discriminatedUnion → render discriminator dropdown + matching branch fields
- Change cloudProvider → form reset to new branch's defaults (common fields preserved if name matches)
- Top 15 variants có discriminated schema với 2-4 cloud branches each
- Remaining 34 variants stay flat (still have cloudProvider as plain enum from Phase A)

**Non-functional:**
- Form re-render <100ms on cloud switch
- No data loss for fields present in both branches (vd: `region` common)
- typecheck pass với discriminated union type inference

## Architecture

```
packages/shared/src/variants/
├── _shared.ts                 — NEW: shared cloud branch helpers
├── database.ts                — REWRITE postgres, mysql, mongodb, cassandra schemas
├── cache.ts                   — REWRITE redis
├── api.ts                     — REWRITE rest
├── worker.ts                  — REWRITE nodejs, python, aws-lambda
├── storage.ts                 — REWRITE s3, gcs, azure-blob (already cloud-locked)
├── queue.ts                   — REWRITE kafka, rabbitmq, sqs
└── types.ts                   — EXTEND VariantConfigSchema = ZodObject | ZodDiscriminatedUnion

apps/web/src/features/canvas/properties/
└── variant-config-form.tsx    — ADD discriminatedUnion branch
```

## Related Code Files

**Create:**
- `packages/shared/src/variants/_shared.ts` — common Zod helpers for AWS/GCP/Azure region enums, SKU lists, etc.

**Modify:**
- `packages/shared/src/variants/types.ts` — `VariantConfigSchema = z.ZodObject<any> | z.ZodDiscriminatedUnion<any, any>`
- 6 variant category files (database, cache, api, worker, storage, queue): rewrite ~15 schemas
- `apps/web/src/features/canvas/properties/variant-config-form.tsx` — discriminatedUnion handling
- `packages/shared/src/variants/index.ts` — `parseVariantConfig` handle both schema types

## Implementation Steps

1. **Shared helpers** `_shared.ts`:
   ```ts
   import { z } from "zod";
   import { AWS_REGIONS, GCP_REGIONS, AZURE_REGIONS } from "../cloud-providers";

   export const awsRegion = z.enum(AWS_REGIONS).default("us-east-1");
   export const gcpRegion = z.enum(GCP_REGIONS).default("us-central1");
   export const azureRegion = z.enum(AZURE_REGIONS).default("eastus");

   export const AWS_DB_CLASSES = ["db.t3.micro", "db.t3.small", "db.t3.medium", "db.m5.large", "db.m5.xlarge", "db.r5.2xlarge"] as const;
   export const GCP_SQL_CLASSES = ["db-f1-micro", "db-g1-small", "db-n1-standard-1", "db-n1-standard-2", "db-n1-standard-4", "db-n1-highmem-8"] as const;
   export const AZURE_DB_TIERS = ["Basic", "GeneralPurpose", "MemoryOptimized"] as const;
   ```
2. **Type extension** `types.ts`:
   ```ts
   export type VariantConfigSchema =
     | z.ZodObject<z.ZodRawShape>
     | z.ZodDiscriminatedUnion<"cloudProvider", z.ZodObject<z.ZodRawShape>[]>;
   ```
3. **Rewrite postgres schema** as discriminated:
   ```ts
   const postgresCommon = {
     version: z.enum(["14", "15", "16", "17"]).default("16"),
     replicas: z.number().min(0).default(1),
     storageGb: z.number().min(1).default(50),
     connectionPool: z.number().min(1).default(100),
     /* ... other common fields */
   };
   const postgresConfig = z.discriminatedUnion("cloudProvider", [
     z.object({
       cloudProvider: z.literal("self-hosted"),
       ...postgresCommon,
       region: z.string().default("us-east-1"),
     }),
     z.object({
       cloudProvider: z.literal("aws"),
       ...postgresCommon,
       region: awsRegion,
       instanceClass: z.enum(AWS_DB_CLASSES).default("db.m5.large"),
       storageType: z.enum(["gp3", "gp2", "io1", "io2"]).default("gp3"),
       multiAz: z.boolean().default(true),
       backupRetentionDays: z.number().min(0).max(35).default(7),
     }),
     z.object({
       cloudProvider: z.literal("gcp"),
       ...postgresCommon,
       region: gcpRegion,
       instanceClass: z.enum(GCP_SQL_CLASSES).default("db-n1-standard-2"),
       tier: z.enum(["enterprise", "enterprise-plus"]).default("enterprise"),
       backupEnabled: z.boolean().default(true),
     }),
     z.object({
       cloudProvider: z.literal("azure"),
       ...postgresCommon,
       region: azureRegion,
       tier: z.enum(AZURE_DB_TIERS).default("GeneralPurpose"),
       skuName: z.enum(["GP_Gen5_2", "GP_Gen5_4", "MO_Gen5_8"]).default("GP_Gen5_2"),
       haEnabled: z.boolean().default(false),
     }),
   ]);
   ```
4. **Repeat for 14 priority variants**:
   - DB: mysql, mongodb, redis, cassandra (similar pattern)
   - Compute: rest, nodejs, python, aws-lambda
   - Storage: s3, gcs, azure-blob (single-cloud → single-branch but still discriminated for consistency)
   - Queue: kafka, rabbitmq, sqs
5. **Form upgrade** `variant-config-form.tsx`:
   ```tsx
   if (schema instanceof z.ZodDiscriminatedUnion) {
     const discriminator = schema.discriminator;
     const currentDiscValue = values[discriminator] as string;
     const branch = schema.optionsMap.get(currentDiscValue);
     if (!branch) return null;
     return (
       <div className="flex flex-col gap-3">
         {/* render discriminator dropdown */}
         <FieldRow label="Cloud Provider">
           <Select value={currentDiscValue} onChange={(e) => onChange(discriminator, e.target.value)}>
             {Array.from(schema.optionsMap.keys()).map((opt) => (
               <option key={opt} value={opt}>{CLOUD_DISPLAY_NAMES[opt as CloudProvider]}</option>
             ))}
           </Select>
         </FieldRow>
         {/* render branch fields (recurse with branch as ZodObject) */}
         <VariantConfigForm schema={branch} values={values} onChange={onChange} />
       </div>
     );
   }
   ```
6. **Update `parseVariantConfig`** in `variants/index.ts`:
   - When schema is discriminatedUnion, safeParse → if fail, retry with `cloudProvider: "self-hosted"` default
   - Preserve fields common to old + new branch on cloud switch
7. **Migration test**: Existing diagram with `{ cloudProvider: "aws" }` only (no instanceClass) → parseVariantConfig adds defaults for missing AWS fields.

## Todo List

- [ ] Create `_shared.ts` với region enums + SKU class lists
- [ ] Extend `VariantConfigSchema` type
- [ ] Update `parseVariantConfig` để handle both schema types
- [ ] Add discriminatedUnion branch trong `variant-config-form.tsx`
- [ ] Rewrite postgres schema (verify form works end-to-end before mass migration)
- [ ] Rewrite mysql, mongodb, redis, cassandra
- [ ] Rewrite rest, nodejs, python, aws-lambda
- [ ] Rewrite s3, gcs, azure-blob (single-branch)
- [ ] Rewrite kafka, rabbitmq, sqs
- [ ] Verify backwards-compat trên 5 saved diagrams
- [ ] Manual QA: Postgres → switch cloud aws→gcp→azure→self-hosted, fields swap correctly
- [ ] `pnpm typecheck` pass

## Success Criteria

- Postgres node: change CloudProvider AWS → GCP → fields swap (instanceClass enum changes from AWS SKUs to GCP machine types)
- Common fields preserved across switch (replicas, storageGb)
- Single-cloud variants (s3) only show 1 cloud option, fields specific to that cloud
- Saved diagrams from Phase A still load (Phase A had plain enum, Phase B has discriminatedUnion — auto-upgrade via parseVariantConfig)
- typecheck pass với strict mode

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Form recursion bug (discriminatedUnion containing nested discriminatedUnion) | Document: only top-level discriminator on `cloudProvider`; reject nested in code review |
| Data loss on cloud switch (instanceClass="db.m5.large" → switch to GCP) | Drop unmatched fields silently; show toast "Some fields reset for new cloud" |
| Zod discriminatedUnion type inference complex → TS errors | Cast schema as needed; brand `VariantConfigSchema` carefully |
| 15 variant rewrite = big diff, hard to review | Do 1 variant first (postgres), get E2E working, then batch rest |
| Existing `capacity.ts` reads `config.instanceClass` directly → breaks for self-hosted (no instanceClass) | Update `capacity.ts` để optional chain `config.instanceClass` |

## Security Considerations

None — pure schema + UI work.

## Next Steps

→ Phase C: IaC export per cloud (uses discriminated branch to generate Terraform).
→ Phase D: Cost estimation (uses cloud + instanceClass + region for pricing lookup).
