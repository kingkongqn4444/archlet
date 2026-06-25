# Phase 4 — IaC Export Stub per Service

**Status:** pending | **Priority:** P1 | **Effort:** 1-2d

## Goal

When exporting Terraform/IaC, emit comment-style placeholder for each cloud-service node (no real resource block — service catalog doesn't have schema). User edits manually.

## Architecture

### Extend IaC exporters
For each cloud-service node in diagram:
- AWS exporter emits:
  ```hcl
  # ${service.name} (${service.id})
  # See: ${service.docsUrl}
  # resource "aws_...." "${node.id}" {
  #   # TODO: configure ${service.category} service
  # }
  ```
- GCP / Azure analogous

### Group by cloud
- terraform-aws.ts collects all cloud-service nodes WHERE cloud === "aws"
- Outputs commented section "## Cloud Services (reference only)" with all stubs

### Optional: known-service mappings
- Top 30 services have hand-authored real Terraform blocks (not just stubs)
- Lookup table: `AWS_KNOWN_MAPPERS: Record<serviceId, IaCMapper>`
- Falls back to stub if no mapper

## TODO

- [ ] iac-stub-generator.ts (cloud-service → stub string)
- [ ] Extend terraform-aws.ts / gcp.ts / azure.ts to handle cloud-service nodes
- [ ] Optional: hand-author 10 known mappers for popular services (Lambda, S3 — already typed; ECS, Kinesis, EventBridge, SNS, Cognito, KMS, Step Functions, SageMaker)
- [ ] Section header in output: "## Cloud Services (manual config required)"
- [ ] Test: 3 sample diagrams export → terraform parse (syntax only)

## Risks

| Risk | Mitigation |
|---|---|
| User confused why stub not real resource | Clear comment + docs link; "Defined in catalog; configure manually" |
| Generated .tf doesn't `terraform validate` | Stubs ARE comments; valid TF; user fills in |
| Known-mapper drift from real AWS API | Comment "Verify against latest provider docs" in output |
| Export ordering ugly (stubs interleaved with real resources) | Group: all real resources first, then "Cloud Services (TODO)" section |

## Composability

- With **Cloud Phase C** (typed variants IaC export): cloud-service stubs appended to same file
- With **Phase 1** (catalog): docsUrl from CloudService used in stub comment
- With **Templates**: if template contains cloud-service nodes (added in future curation), stubs preserved on export
