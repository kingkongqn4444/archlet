# Phase C — IaC Export per Cloud (Terraform AWS / GCP / Azure)

**Status:** pending | **Priority:** P1 | **Effort:** 3–5 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260625-0007-cloud-provider-variants.md)
- [Plan overview](./plan.md)
- Depends on: Phase B (discriminated schemas drive per-cloud field mapping)

## Overview

Extend `apps/web/src/features/export/iac/` để mỗi node export ra Terraform resource đúng cloud của nó. AWS exporter đã exist → extend. Thêm GCP + Azure exporters. Output: single `.tf` file per cloud + 1 multi-cloud bundle nếu diagram mix.

## Key Insights

- Existing `terraform-aws.ts` đã có một số variant mapping → reuse pattern
- GCP Terraform provider: `google` + resources `google_sql_database_instance`, `google_storage_bucket`, etc.
- Azure: `azurerm` provider, `azurerm_postgresql_flexible_server`, `azurerm_storage_account`, etc.
- Per-variant IaC mapper: function `(node, config) => terraformResourceBlock string`
- Registry pattern: `Record<NodeType, Record<CloudProvider, IaCMapper>>`
- Output: organize bằng cloud → file per cloud + shared `provider` blocks

## Requirements

**Functional:**
- Export button → modal chọn target cloud(s)
- Single cloud → 1 `.tf` file
- Multi-cloud → ZIP với 1 file per cloud + README.md instructions
- Resource naming: `${node.id}` sanitized
- Tags: include `archlet-diagram: ${diagramId}` cho traceability
- Variables: extract sensitive config (region, secrets) sang `variables.tf`

**Non-functional:**
- Export <2s cho diagram 30 nodes
- Output validates với `terraform validate` (CI test 1 sample per cloud)

## Architecture

```
apps/web/src/features/export/iac/
├── terraform-aws.ts             — EXTEND (already exists)
├── terraform-gcp.ts             — NEW
├── terraform-azure.ts           — NEW
├── terraform-self-hosted.ts     — NEW (kubernetes manifests as fallback)
├── terraform-export.ts          — orchestrator
└── mappers/
    ├── postgres-mappers.ts      — per-cloud mapper functions
    ├── redis-mappers.ts
    ├── storage-mappers.ts
    └── ...                       (1 file per variant family)

packages/shared/src/iac/
└── iac-types.ts                  — NEW: IaCMapper type, common helpers

apps/web/src/features/export/
└── export-modal.tsx              — EXTEND: cloud target selector
```

## Related Code Files

**Create:**
- `packages/shared/src/iac/iac-types.ts`
- `apps/web/src/features/export/iac/terraform-gcp.ts`
- `apps/web/src/features/export/iac/terraform-azure.ts`
- `apps/web/src/features/export/iac/terraform-self-hosted.ts`
- `apps/web/src/features/export/iac/mappers/{postgres,redis,storage,worker,queue}-mappers.ts`

**Modify:**
- `apps/web/src/features/export/iac/terraform-aws.ts` (cover new fields từ Phase B)
- `apps/web/src/features/export/iac/terraform-export.ts` (orchestrator, route per cloudProvider)
- `apps/web/src/features/export/export-modal.tsx` (cloud target UI)

## Implementation Steps

1. **Define IaCMapper type** in `packages/shared/src/iac/iac-types.ts`:
   ```ts
   export type IaCMapper = (
     node: { id: string; data: { label: string; config: Record<string, unknown> } }
   ) => string; // terraform resource block
   ```
2. **Postgres mappers** `mappers/postgres-mappers.ts`:
   ```ts
   export const postgresMappers: Record<CloudProvider, IaCMapper> = {
     aws: (node) => {
       const c = node.data.config as { instanceClass: string; region: string; storageGb: number; multiAz: boolean; backupRetentionDays: number };
       return `resource "aws_db_instance" "${node.id}" {
   identifier           = "${node.id}"
   engine               = "postgres"
   instance_class       = "${c.instanceClass}"
   allocated_storage    = ${c.storageGb}
   multi_az             = ${c.multiAz}
   backup_retention_period = ${c.backupRetentionDays}
   tags = { archlet_diagram = var.diagram_id }
 }`;
     },
     gcp: (node) => {
       const c = node.data.config as { instanceClass: string; region: string };
       return `resource "google_sql_database_instance" "${node.id}" {
   name             = "${node.id}"
   database_version = "POSTGRES_16"
   region           = "${c.region}"
   settings {
     tier = "${c.instanceClass}"
   }
 }`;
     },
     azure: (node) => `resource "azurerm_postgresql_flexible_server" "${node.id}" { ... }`,
     "self-hosted": (node) => `# Self-hosted Postgres - use Docker compose or Helm chart`,
     cloudflare: () => "",
   };
   ```
3. **Repeat for variant families** (~10 mapper files):
   - postgres-mappers.ts (postgres, mysql, mongodb)
   - redis-mappers.ts (redis, memcached)
   - storage-mappers.ts (s3, gcs, azure-blob, r2)
   - worker-mappers.ts (nodejs/python/go/rust → containers, aws-lambda)
   - queue-mappers.ts (kafka, sqs, rabbitmq)
   - api-mappers.ts (rest service → ECS / Cloud Run / Container Apps)
4. **Cloud exporters** `terraform-aws.ts` etc.:
   ```ts
   export function exportTerraformAws(diagram: Diagram): string {
     const lines = [providerBlockAws()];
     for (const node of diagram.nodes) {
       const cfg = node.data.config as { cloudProvider?: CloudProvider };
       if (cfg.cloudProvider !== "aws") continue;
       const mapper = getMapper(node.type, "aws");
       if (mapper) lines.push(mapper(node));
     }
     return lines.join("\n\n");
   }
   ```
5. **Orchestrator** `terraform-export.ts`:
   - Group nodes by cloudProvider
   - Generate one file per cloud có nodes
   - Bundle zip với JSZip
6. **Export modal**:
   - Detect clouds present trong diagram
   - Default select all
   - "Generate" → download single .tf hoặc .zip
7. **Test fixtures**:
   - `apps/web/test-fixtures/aws-diagram.json`
   - Run `terraform fmt -check` + `terraform validate` against output trong CI
8. **Provider block helpers**:
   ```hcl
   terraform { required_providers { aws = { source = "hashicorp/aws" } } }
   provider "aws" { region = var.aws_region }
   variable "diagram_id" { type = string }
   variable "aws_region" { type = string; default = "us-east-1" }
   ```

## Todo List

- [ ] Create `iac-types.ts` with IaCMapper type
- [ ] Create mappers/postgres-mappers.ts (3 dbs × 4 clouds)
- [ ] Create mappers/redis-mappers.ts
- [ ] Create mappers/storage-mappers.ts (s3, gcs, azure-blob, r2)
- [ ] Create mappers/worker-mappers.ts (containers + lambda)
- [ ] Create mappers/queue-mappers.ts
- [ ] Create mappers/api-mappers.ts
- [ ] Extend terraform-aws.ts để cover Phase B new fields
- [ ] Create terraform-gcp.ts
- [ ] Create terraform-azure.ts
- [ ] Create terraform-self-hosted.ts (k8s manifests)
- [ ] Create orchestrator terraform-export.ts
- [ ] Update export-modal.tsx UI
- [ ] Add `jszip` dep nếu chưa có
- [ ] Test fixture + CI step `terraform validate`
- [ ] Manual QA: export sample diagram → run `terraform plan` locally (AWS)
- [ ] `pnpm typecheck` pass

## Success Criteria

- Diagram: Postgres(AWS) + Redis(AWS) → export 1 file `aws.tf` với 2 resources
- Diagram mix: Postgres(AWS) + GCS(GCP) → zip với `aws.tf` + `gcp.tf`
- `terraform validate` passes for AWS + GCP + Azure samples
- Variables file `variables.tf` extract region + diagram_id
- typecheck pass

## Risk Assessment

| Risk | Mitigation |
|---|---|
| 15 variants × 4 clouds = 60 mappers — tốn time | Ship rolling; defer Azure mappers cho 5 ít priority variants; only block core (postgres, redis, s3) |
| Terraform output non-runnable (syntax error) | CI `terraform fmt` + `terraform validate` automated; manual `plan` cho 1 sample |
| Sensitive fields leak vào output (passwords, keys) | Never embed secrets — always reference `var.X` placeholders |
| Resource ID conflicts (special chars in node.id) | Sanitize: `[a-z0-9-]` only; replace _, spaces → hyphens |
| Cloudflare provider không có cho most variants | Treat cloudflare-only mappers (r2, workers) separately; rest = warning "Not exportable" |
| Self-hosted output (k8s manifests) requires kubectl, not terraform | Document; provide both terraform + k8s yaml options |

## Security Considerations

- Sanitize all string interpolation (XSS không phải concern vì Terraform text, nhưng injection nếu user puts shell chars trong node.label)
- Generated output goes to user download — no server-side execution
- Variables for secrets — never inline

## Next Steps

→ Phase D: Cost estimation (uses same variant+cloud+SKU → lookup pricing table).
