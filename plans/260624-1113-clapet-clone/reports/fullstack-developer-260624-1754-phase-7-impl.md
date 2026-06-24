# Phase 7 Implementation Report — Service Variants + Schema-Driven Config

## Status: Completed

---

## 1. Variants Catalog Summary

File: `packages/shared/src/variants.ts`

| Node Type     | Variants | Notable                                     |
|---------------|----------|---------------------------------------------|
| user          | 3        | web-browser, mobile-app, desktop-app        |
| api           | 5        | rest, graphql, grpc, websocket, api-gateway |
| database      | 6        | postgres, mysql, mongodb, dynamodb, cassandra, sqlite |
| cache         | 4        | redis, memcached, keydb, valkey             |
| queue         | 5        | rabbitmq, kafka, sqs, redis-streams, nats   |
| storage       | 5        | s3, r2, gcs, azure-blob, local-disk         |
| cdn           | 4        | cloudflare, cloudfront, fastly, akamai      |
| load_balancer | 5        | nginx, haproxy, aws-alb, envoy, cloudflare-lb |
| worker        | 6        | nodejs, python, go, rust, aws-lambda, cloudflare-workers |
| external      | 6        | payment-api, email-service, analytics, ai-provider, oauth-provider, custom-third-party |

**Total: 49 variants across 10 node types.**

Each variant has: `id`, `label`, `iconSlug?`, `description?`, `configSchema` (ZodObject with 2–5 fields and defaults).

Exported helpers: `getVariant`, `getDefaultVariant`, `getVariantConfigSchema`, `parseVariantConfig`.

---

## 2. New Files Created

| Path | Purpose |
|------|---------|
| `packages/shared/src/variants.ts` | Variants catalog + Zod config schemas + helpers |
| `apps/web/src/features/canvas/properties/use-properties-panel.ts` | Zustand store for panel open/close state |
| `apps/web/src/features/canvas/properties/variant-config-form.tsx` | Schema-driven form renderer |
| `apps/web/src/features/canvas/properties/properties-panel.tsx` | Slide-in properties panel (320px, right side) |

---

## 3. Schema-Driven Form Rendering (Zod → Form)

`VariantConfigForm` introspects `schema.shape` at runtime:

1. Unwraps `ZodDefault` to get the inner type
2. `ZodEnum` → `<Select>` dropdown with enum options
3. `ZodBoolean` → custom toggle switch
4. `ZodNumber` → `<Input type="number">`
5. `ZodString` (fallback) → `<Input type="text">`

Field labels auto-generated from camelCase keys via `toLabel()` (e.g. `memoryMb` → "Memory Mb").

Config changes debounced 300ms before calling `updateNodeConfig`. Variant switch resets config to schema defaults via `parseVariantConfig(type, variantId, {})`.

---

## 4. Files Modified

| Path | Change |
|------|--------|
| `packages/shared/src/diagram.ts` | Added `variant?: string`, `config?: Record<string, unknown>` to `DiagramNodeSchema.data`; fixed `z.record(z.string(), z.unknown())` for Zod v4 |
| `packages/shared/src/index.ts` | Re-exports everything from `./variants` |
| `apps/web/src/features/canvas/store/diagram-store.ts` | `toRFNode`/`fromRFNode` preserve variant+config; `addNode` fills default variant; added `updateNodeConfig`, `updateNodeVariant` actions |
| `apps/web/src/features/canvas/nodes/base-node.tsx` | Added `VariantBadge` component; Configure button wires to `usePropertiesPanel.open(id)` |
| `apps/web/src/features/canvas/canvas-editor.tsx` | Mounts `<PropertiesPanel />` inside editor (edit mode only) |
| `apps/web/public/_headers` | Added `https://cdn.simpleicons.org` to `img-src` in both `/*` and `/e/*` policies |

---

## 5. Backwards Compatibility

- `toRFNode` fills `variant` from `getDefaultVariant(type)` when absent
- `parseVariantConfig` falls back to schema defaults when config is missing/invalid
- Existing diagrams load silently with defaults; no user-facing migration prompt
- `getDiagram`/`fromRFNode` round-trip preserves both fields through auto-save

---

## 6. CSP Delta for Simple Icons

Both CSP blocks updated:

```diff
- img-src 'self' data: blob:
+ img-src 'self' data: blob: https://cdn.simpleicons.org
```

Applies to `/*` (main app) and `/e/*` (embed). Images gracefully degrade via `onError` handler that hides broken `<img>` tags.

---

## 7. TypeCheck + Build Status

- `pnpm typecheck`: **PASS** (all 3 packages)
- `pnpm build`: **PASS** (2656 modules, variants chunk 85.88 kB / 23.42 kB gzip)

Notable fixes applied during implementation:
- Zod v4: `z.record(z.unknown())` → `z.record(z.string(), z.unknown())`
- `noUncheckedIndexedAccess`: `[0]!` non-null assertion in `getDefaultVariant`
- `exactOptionalPropertyTypes`: avoids passing `variantId={undefined}` directly

---

## 8. Known Gaps + Recommendations for Phase 8

- **Traffic config** on user nodes (concurrentUsers → traffic simulation) deferred to Phase 8 per spec
- **Icon slugs** for a few variants (`grpc`, `websocket`, `memcached`, `keydb`, `valkey`) have no simple-icons slug; badge shows text-only label (graceful)
- **Config validation UI**: no inline error messages when a field fails Zod validation; silently clamped
- **Variant search/filter**: dropdown grows large for database/worker types; Phase 8 could add search
- **Panel auto-open on node drop**: `addNode` assigns default variant but doesn't auto-open panel; can add in Phase 8 by calling `usePropertiesPanel.open(id)` post-drop in `canvas-editor.tsx`
- **AI agent tool schema**: not updated (explicitly deferred); variants catalog available for Phase 9
