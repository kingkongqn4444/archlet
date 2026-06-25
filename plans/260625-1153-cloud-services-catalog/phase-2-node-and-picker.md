# Phase 2 — CloudServiceNode + Palette Tile + Picker Modal

**Status:** pending | **Priority:** P0 | **Effort:** 2-3d

## Goal

Add new node-type "cloud-service" + palette tile in side-palette + picker modal with search/filter/category.

## Architecture

### New NodeType
Extend `packages/shared/src/diagram.ts` NodeType: add `"cloud-service"`.

### Palette tile
- side-palette.tsx — add tile "Cloud Service" với Cloud icon
- Click tile → open ServicePickerModal (not flyout — too many items)
- Drag tile = legacy variant drag pattern (drop creates default cloud-service node)

### ServicePickerModal
```
apps/web/src/features/cloud-services/
├── service-picker-modal.tsx     — modal with search + filter
├── service-card.tsx              — service card (icon, name, category badge)
├── use-service-search.ts         — debounced search hook
└── service-icon.tsx              — icon resolver with fallbacks
```

Modal UI:
```
┌─ Cloud Services ────────────────────────── [×] ┐
│ [🔍 Search 600 services...........        ]    │
│                                                 │
│ Cloud: [All] [AWS 200] [GCP 120] [Azure 200]   │
│ Category: [All] [Compute] [Storage] [DB] [ML]  │
│                                                 │
│ ┌─────┬─────┬─────┬─────┐                      │
│ │ ECS │ EKS │ S3  │ ... │                      │
│ └─────┴─────┴─────┴─────┘                      │
│ (50 shown of 184 matching)                      │
└─────────────────────────────────────────────────┘
```

### Drop flow
- Click service card → onSelect(serviceId)
- Modal closes → addNode of type "cloud-service" at canvas center
- Node has `data: { label: service.name, serviceId, cloud, category, config: {} }`

## TODO

- [ ] Extend NodeType enum with "cloud-service"
- [ ] Update diagram-store.ts to handle new type
- [ ] side-palette.tsx: add Cloud Service tile (after PatternsGroup, before LearnGroup)
- [ ] service-picker-modal.tsx (search + filter UI, cap 50 shown)
- [ ] service-card.tsx (icon + name + category badge)
- [ ] use-service-search.ts (fuzzy match + filter)
- [ ] Wire palette tile click → open modal → pick → addNode
- [ ] Smoke test: pick 3 services from 3 clouds → drops onto canvas with correct icons

## Risks

| Risk | Mitigation |
|---|---|
| 600 dropdown freeze browser | Cap render to 50; virtualize if needed (react-window) |
| Search slow on 600 entries | In-memory; debounce 150ms; index by lowercase name + tags |
| Modal width can't fit cloud + category facets + card grid | Use 800px modal; vertical filter sidebar |
| Drop position ambiguous (modal blocks canvas) | Always drop at viewport center, random offset |
