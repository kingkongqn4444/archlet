# Phase 3 — Generic Config Form + Icon Resolution

**Status:** pending | **Priority:** P0 | **Effort:** 1-2d

## Goal

Cloud-service node renders với cloud-branded icon. Properties panel shows generic key/value config form (no Zod). Tooltip explains "not simulated".

## Architecture

### Node renderer
- New node type registration in `apps/web/src/features/canvas/nodes/cloud-service-node.tsx`
- Reuses BaseNodeProps shape; passes `icon` resolved from service catalog
- Visual distinction: dashed border or "🌐" subtle indicator → not-simulated
- Hover tooltip: "Reference node — not included in capacity simulation"

### Icon resolution
```ts
// service-icon.tsx
function resolveServiceIcon(service: CloudService): string {
  if (service.iconSlug) return `https://cdn.simpleicons.org/${service.iconSlug}/...`;
  // Fallback: per-category SVG bundled in public/icons/cloud/{category}.svg
  return `/icons/cloud/${service.category}.svg`;
}
```

Bundle 16 category fallback SVGs:
- compute, container, serverless, storage, database, cache, queue, stream, cdn,
  networking, dns, security, ml-ai, analytics, observability, devops

### Generic config form
- properties-panel.tsx — when node.type === "cloud-service":
  - Show service info (name, cloud, category, docs link)
  - Render KEY/VALUE rows (add/remove dynamic) for free-form config
  - No Zod validation; values stored as `{ [key]: string }`
- No CloudProvider dropdown (cloud already locked by service)

### Simulation skip
- capacity.ts — if node.type === "cloud-service", skip (no throughput contribution)
- rules engine — skip rules that depend on Zod schemas

## TODO

- [ ] cloud-service-node.tsx (renderer)
- [ ] service-icon.tsx with simpleicons + category fallbacks
- [ ] Bundle 16 category SVG fallbacks in public/icons/cloud/
- [ ] properties-panel.tsx: detect "cloud-service" type → render generic form
- [ ] Generic KeyValueForm component (rows, add/remove)
- [ ] capacity.ts: skip cloud-service nodes
- [ ] Tooltip on node body explaining "reference only"
- [ ] typecheck + smoke test 5 services from different categories

## Risks

| Risk | Mitigation |
|---|---|
| Visual indistinguishable from typed nodes | Dashed border + subtle "🌐" badge top-right |
| Config keys collision with typed variant keys (e.g., user adds "instances" key but it's free-form) | Don't simulate cloud-service nodes; keys are documentation only |
| Missing SVG fallback file → broken icon | Render text "?" or first letter of service name as fallback-of-fallback |
| Docs link rot | Show domain only (`docs.aws.amazon.com`); don't validate URLs at build |
