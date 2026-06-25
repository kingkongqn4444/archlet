---
status: pending
created: 2026-06-25
owner: kingkongqn4444
brainstorm: ../reports/brainstormer-260625-0933-40-new-diagram-templates.md
---

# 40 New Diagram Templates

Add 40 templates vào `packages/shared/src/templates.ts` (hiện có 10). Sau ship: 50 templates standalone + 28 sẽ thêm từ Mentor Phase 1 = **78 total**.

## Goal

Tăng library template để mỗi lần mày học/diễn system mới đều có canonical starter, không phải build from scratch. Cover 3 dimension: real-world apps + architectural patterns + industry-specific stacks.

## Stack

`packages/shared/src/templates.ts` (will be modularized to templates/), `packages/shared/src/diagram.ts` (DiagramNode/Edge types), `packages/shared/src/variants/` (49 variants for node configs). UI rendering via existing template picker.

## Phases

| # | Phase | Status | Effort | File |
|---|---|---|---|---|
| 1 | UX verify + modularize templates.ts | pending | 1.5d | [phase-1-ux-verify-and-modularize.md](./phase-1-ux-verify-and-modularize.md) |
| 2 | 15 real-world apps | pending | 2d | [phase-2-real-world-apps.md](./phase-2-real-world-apps.md) |
| 3 | 10 architectural patterns | pending | 1.5d | [phase-3-architectural-patterns.md](./phase-3-architectural-patterns.md) |
| 4 | 15 industry-specific | pending | 2d | [phase-4-industry-specific.md](./phase-4-industry-specific.md) |

**Total:** 7 ngày solo (~1h/template × 40 + modularize + verify).

## Key Decisions (from brainstorm)

- 3 categories: 15 real-world + 10 architectural + 15 industry
- Modularize templates.ts (1330 lines projected) into `templates/` directory
- Extend TemplateCategory enum: add `architectural | healthcare | gaming | iot | edtech | logistics | ai`
- Phase 1 critical: verify templates render trong UI trước khi handcraft 40 cái
- Each template ~30min design + ~30min code = ~1h

## Dependencies

- Phase 2/3/4 blocked by Phase 1 (need module structure + verified UI wiring)
- Phase 2/3/4 independent of each other → có thể parallel hoặc serialize tùy mood

## Out of Scope

- Template thumbnails / preview images (defer, 78 templates không cần)
- AI auto-generate from description (defer to Mentor feature)
- Template versioning / forking by user
- Marketplace / community templates

## Risks (incl. backlog)

| Risk | Mitigation |
|---|---|
| **TOTAL BACKLOG OVERFLOW** | Mentor (18-23d) + Cloud (13-19d) + Templates (7d) = **38-49d (~7-10 tuần)**. 12 phases pending. Risk: cả 3 dở dang. Suggest serialize: Templates phase 1 (1.5d verify+modular) ngay → quyết content quality trước khi grind 5.5d |
| Quality vs quantity (~30min/template) | Surface-level diagrams. Acceptable cho personal tool, document trade-off |
| Variant config defaults stale | Templates reference variant configs; nếu Cloud Phase B đổi schema → templates break. Add migration test |
| Overlap với Mentor Phase 1 28 templates | Mentor = abstract system-design chapters (URL Shortener, Rate Limiter, etc.). This plan = concrete real-world apps + patterns. De-dup: pick distinct names |
| TemplateCategory enum proliferation | 6 existing + 7 new = 13 categories. UI filter dropdown vẫn manageable |
| File size 1330 lines projected | Modularize per category = each file <300 lines. Fine. |
