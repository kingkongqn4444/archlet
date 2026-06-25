---
status: pending
created: 2026-06-25
owner: kingkongqn4444
brainstorm: ../reports/brainstormer-260625-1153-cloud-services-catalog.md
---

# Cloud Services Catalog (600+ AWS / GCP / Azure)

Coexist với 49 typed variants. Add untyped cloud service catalog (600+) qua new node-type "cloud-service" + service picker modal. Generic key/value config (no Zod per service).

## Phases

| # | Phase | Effort | File |
|---|---|---|---|
| 1 | Catalog data (JSON, 600 entries) | 2-3d | [phase-1-catalog-data.md](./phase-1-catalog-data.md) |
| 2 | CloudServiceNode + palette tile + picker modal | 2-3d | [phase-2-node-and-picker.md](./phase-2-node-and-picker.md) |
| 3 | Generic config form + icon resolution | 1-2d | [phase-3-generic-config-and-icons.md](./phase-3-generic-config-and-icons.md) |
| 4 | IaC export placeholder per service | 1-2d | [phase-4-iac-export-stub.md](./phase-4-iac-export-stub.md) |

**Total:** 7-10d.

## Dependencies

- Sequential: Phase 1 → 2 → 3 → 4
- Independent of Mentor 2/3 UI and Interview Prep Pack
- Cloud Phase A complete (cloudProvider field — reused)

## Key Decisions (from brainstorm)

- Coexist (not replace) typed variants — typed gets simulation, untyped doesn't
- Hand-curate top 100/cloud first, expand rolling
- Search/filter modal mandatory (4xx items)
- Generic key/value config form — no per-service Zod
- Capacity engine skips cloud-service nodes (tooltip warns)

## Out of Scope

- Live pricing / cost calc per cloud service (defer)
- Auto-fetch service updates from cloud catalogs (cron)
- Service dependency hints (e.g., "S3 commonly paired with CloudFront")
- Favorites / recents tracking (Phase 5+)
- IaC deep mappings (Phase 4 = comment stubs only)

## Risks

| Risk | Mitigation |
|---|---|
| Backlog overflow | Adds ~10d to already-massive backlog. Defer until Mentor 2 UI + Prep Pack done. |
| Catalog stale within 6mo | Quarterly refresh process; "updated YYYY-MM" badge |
| 600 dropdown unusable | Hard requirement: search + category facets in picker |
| User confusion typed vs untyped | Visual distinction + tooltip on Cloud Service nodes: "Reference only, not simulated" |
| 200 AWS services without simpleicon | Per-category fallback icons + AWS generic logo |
