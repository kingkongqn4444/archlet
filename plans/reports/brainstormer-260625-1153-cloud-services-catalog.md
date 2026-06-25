# Cloud Services Catalog (AWS + GCP + Azure 600+) — Brainstorm Summary

**Date:** 2026-06-25
**Owner:** kingkongqn4444

## Problem Statement

Cloud Phase A/B chỉ cover ~11 AWS services qua typed variants + cloudProvider tag. User muốn comprehensive coverage 600+ services (AWS ~200, GCP ~120, Azure ~200) cho interview prep + reference. Typed Zod schema per-service = 600 schemas = không feasible.

## Approach Chốt: Untyped Service Catalog (Coexist)

**Coexist với existing typed variants:**
- **49 typed variants** = primary, có Zod schema + capacity rules + cost calc (kept)
- **600+ untyped services** = full catalog, generic config form, icon + label + cloud + category metadata only
- Service catalog rendered qua NEW node-type "cloud-service" hoặc enhancement to "external"

### Data structure

```ts
// packages/shared/src/cloud-services-catalog.ts
type CloudService = {
  id: string;          // "aws-glue"
  name: string;        // "AWS Glue"
  cloud: "aws" | "gcp" | "azure";
  category: ServiceCategory; // compute|storage|database|...
  iconSlug: string;    // simpleicons or custom
  description: string; // 1-line teaser
  docsUrl: string;     // official docs link
  tags: string[];      // ["etl", "serverless", "spark"]
};
```

### Categories (16)
compute, container, serverless, storage, database, cache, queue, stream, cdn,
networking, dns, security, ml-ai, analytics, observability, devops

### UI
- New palette tile "Cloud Service" (lucide Cloud icon)
- Click → modal with search/filter (by cloud, category, name)
- Pick service → drop generic node with iconSlug + label + free-form config (key/value pairs)
- Node renders với cloud-specific brand icon

### Generic config form
- KEY/VALUE pairs (add row dynamically)
- No Zod validation per field (string only)
- Capacity rules don't apply (only typed variants get rules)

### Coexist rules
- Existing 49 typed variants stay primary (Database/Cache/Worker/etc.)
- Cloud Service variants = "external" perspective — for completeness, not for simulation
- Capacity engine SKIPS cloud-service nodes (no req/s impact)

## Service Counts (target)

| Cloud | Total | Sample categories |
|---|---|---|
| AWS | ~200 | EC2, ECS, EKS, Fargate, SageMaker, Bedrock, Kinesis, MSK, EventBridge, Step Functions, Cognito, KMS, Route 53... |
| GCP | ~120 | Cloud Run, GKE, BigQuery, Pub/Sub, Vertex AI, Cloud Functions, Spanner, Memorystore, IAM... |
| Azure | ~200 | AKS, Functions, Cosmos DB, Service Bus, Synapse, OpenAI Service, Cognitive Services, AD B2C... |

**Source:**
- AWS: https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html (or services list page)
- GCP: https://cloud.google.com/products
- Azure: https://learn.microsoft.com/azure/?product=popular
- Scrape via WebFetch or one-time manual hand-curation

## Phasing (~7-10d)

| # | Phase | Effort |
|---|---|---|
| 1 | Catalog data (AWS+GCP+Azure JSON) — scrape/curate 600 entries | 2-3d |
| 2 | Generic CloudServiceNode + palette tile + service picker modal | 2-3d |
| 3 | Generic key/value config form + icon resolution + node render | 1-2d |
| 4 | IaC export (basic): emit comment-style placeholder per service | 1-2d |

## Risks (real)

| Risk | Mitigation |
|---|---|
| 600 dropdown = unusable | MANDATORY search filter + category facets; recent/favorites; max 50 shown at once |
| Catalog data stale | Hand-curated initial 600, refresh quarterly; "last updated YYYY-MM" badge |
| User confusion: typed vs untyped variants | Visual distinction (Cloud Service nodes have cloud-branded border); docs in tooltip |
| Capacity sim ignored = misleading | Tooltip on Cloud Service nodes: "Not included in simulation" |
| Icons missing (200+ AWS services don't all have simpleicons) | Fallback: AWS generic icon; per-category icon (Lambda → bolt icon) |
| Scope creep into 600 typed schemas | HARD line: untyped only this phase; revisit if real demand |

## Open Questions

1. **Catalog source:** scrape live (fragile) vs hand-curate (stale)? Recommend hand-curate top 100 per cloud, expand rolling
2. **Node-type naming:** new `cloud-service` enum value OR reuse `external`? Recommend new value cho clarity
3. **Cost calc:** skip entirely (recommended) OR rough $/node based on category? Skip
4. **Search UX:** dropdown vs full modal? Modal recommended (4xx items)
5. **Favorites / recents:** track user picks for quick access? Phase 5 nice-to-have
