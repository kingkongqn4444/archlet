---
status: pending
created: 2026-06-25
owner: kingkongqn4444
brainstorm: ../reports/brainstormer-260625-0007-cloud-provider-variants.md
---

# Cloud Provider Variants

Cho phép mỗi variant (postgres, redis, lambda...) chọn `cloudProvider` → biến hình config + icon + IaC export + cost calc theo cloud (AWS/GCP/Azure/Cloudflare/self-hosted). KHÔNG add 500+ variants riêng — dùng cloud tag trên 49 variants hiện có.

## Goal

Personal tool: drag variant → set cloud → cảnh quan đầy đủ (right icon, right SKUs, right Terraform output, right cost estimate).

## Stack

`packages/shared/src/variants/*` (49 variants per-category), `apps/web/src/features/canvas/properties/variant-config-form.tsx` (flat form — needs upgrade), `apps/web/src/features/export/iac/*` (exists partial), `packages/shared/src/pricing.ts` (cost infra exists).

## Phases

| # | Phase | Status | Effort | File |
|---|---|---|---|---|
| A | Cloud tag + icon swap | pending | 2d | [phase-A-cloud-tag-and-icon-swap.md](./phase-A-cloud-tag-and-icon-swap.md) |
| B | Conditional config form (discriminatedUnion) | pending | 5–7d | [phase-B-conditional-config-form.md](./phase-B-conditional-config-form.md) |
| C | IaC export per cloud (Terraform AWS/GCP/Azure) | pending | 3–5d | [phase-C-iac-export-per-cloud.md](./phase-C-iac-export-per-cloud.md) |
| D | Cost estimation + pricing table | pending | 3–5d | [phase-D-cost-estimation.md](./phase-D-cost-estimation.md) |

**Total:** 13–19 ngày solo.

## Key Decisions (from brainstorm)

- Add `cloudProvider: self-hosted|aws|gcp|azure|cloudflare` vào MỌI variant
- Per-variant `availableClouds` whitelist (vd: dynamodb chỉ aws)
- Per-(variant, cloud) `cloudIconSlug` override
- Schema: `z.discriminatedUnion('cloudProvider', [...])` — form phải support
- Top 15 variants priority phase B: postgres, mysql, mongodb, redis, cassandra, rest, nodejs, python, aws-lambda, s3, gcs, azure-blob, kafka, rabbitmq, sqs

## Dependencies

- B blocked by A (cloudProvider field must exist)
- C blocked by B (per-cloud config fields drive IaC mapping)
- D blocked by B (SKU/region per cloud needed for pricing lookup)

## Out of Scope (defer)

- Auto-fetch live pricing từ Vantage/Infracost API (hardcode table phase D)
- Pulumi/CDK export (chỉ Terraform)
- Multi-cloud cost optimization recommendations
- Compliance overlays (SOC2/HIPAA per cloud)

## Risks

| Risk | Mitigation |
|---|---|
| **Backlog overflow** | Mentor (18-23d) + Cloud (13-19d) = 31-42d. Suggest serialize: Phase A ngay (2d quick win), defer B/C/D until Mentor stable |
| Form refactor breaks 49 flat-schema variants | Backwards-compat: ZodObject branch untouched, only ADD discriminatedUnion branch |
| Per-cloud SKU lists stale | Manual quarterly refresh; document update process |
| Pricing accuracy ±20% | Caveat banner; link to official cloud calculator |
| Terraform export non-runnable | CI step: `terraform validate` per cloud sample |
| Migration of existing diagrams | `parseVariantConfig` defaults `cloudProvider: self-hosted` — auto-upgrade existing data |
