# Phase 11 Implementation Report

## Executed Phase
- Phase: Phase 11 — Variant-aware side palette (flyout) + smarter review
- Plan: /Volumes/ssd/MyApp/System_design/plans/260624-1113-clapet-clone
- Status: completed

## Files Modified

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/features/canvas/toolbar/variant-flyout.tsx` | created | 93 lines — flyout panel component |
| `apps/web/src/features/canvas/toolbar/side-palette.tsx` | rewritten | 175 lines — hover trigger, flyout wiring |
| `apps/web/src/features/canvas/canvas-editor.tsx` | modified | onDrop parses JSON `{type,variantId}` with legacy fallback |
| `apps/web/src/features/review/types.ts` | modified | added `impact?: number`, added `"patterns"` FindingCategory |
| `apps/web/src/features/review/rules/pattern-rules.ts` | created | 8 good-emitter rules (GD1–GD8) |
| `apps/web/src/features/review/engine.ts` | rewritten | includes pattern rules, tags default impact, sort by impact within bucket |
| `apps/web/src/features/review/rules/reliability-rules.ts` | rewritten | concrete data in all titles/descriptions, explicit impact fields |
| `apps/web/src/features/review/review-panel.tsx` | rewritten | CategoryBarChart, ImpactChip, left stripe, "Fix this →" CTA, Re-run spinner |

## Tasks Completed

### Part A — Variant flyout palette
- [x] A1: 150ms hover delay → flyout, 300ms grace on mouse-leave, Escape closes, one flyout at time
- [x] A2: Flyout panel — bg-white/95 dark:bg-plum-900/95 backdrop-blur, 240px, rounded-2xl, shadow-float; header "TYPE — N variants"; variant cards with simple-icons CDN icon, label, description, cursor-grab
- [x] A3: `onDrop` in canvas-editor parses JSON `{type,variantId}` — backward compat with plain string
- [x] A4: `addNode` already accepted variant in data — confirmed and used as-is

### Part B — Smarter review
- [x] B1: `pattern-rules.ts` — 8 good-emitter rules GD1–GD8
- [x] B2: `impact?: number` field on Finding type; engine tags defaults (critical=-20, warning=-8, suggestion=-3, good=+5)
- [x] B3: CategoryBarChart — horizontal bars per category, color by worst severity, count labels
- [x] B4: Sort: critical→warning→suggestion→good, within same bucket sorted by |impact| desc
- [x] B5: Left severity stripe 4px on each card; impact chip top-right; "Fix this →" CTA highlighting nodes and opening properties panel
- [x] B6: Reliability rules rewritten with actual numbers (replica count, node label) in title/description
- [x] B7: Re-run spinner — 200ms delay before runReview(), RefreshCw animates with `animate-spin`

## Tests Status
- Type check: **pass** (0 errors, 0 warnings)
- Unit tests: n/a (no test runner configured in web app)
- Integration tests: manual Playwright visual verification passed

## Screenshots
- `/tmp/p11-flyout.png` — palette + Database flyout open (6 variants shown)
- `/tmp/p11-flyout-closeup.png` — close-up: "DATABASE — 6 VARIANTS", icons from simple-icons CDN
- `/tmp/p11-review-improved.png` — full canvas with review panel
- `/tmp/p11-review-closeup.png` — review panel: grade B/88, category breakdown chart, -8pts chip, left stripe, Fix this CTA

## Design Notes
- Flyout uses `position: fixed` (left: 64px) so it escapes the palette's stacking context cleanly
- Close timer (300ms grace) on both palette and flyout mouseLeave prevents flicker when crossing the gap
- `flyoutHoveredRef` tracks whether mouse is currently over flyout to guard the close timer
- Category bar chart filters out zero-count categories to keep it clean
- Good-finding bonus in score is capped at +10 to prevent score inflation
- "Fix this →" only renders for negative findings with at least one affected nodeId

## Issues Encountered
None. All type errors were resolved before first typecheck run.

## Next Steps
- Phase 12 or follow-on: keyboard shortcut to open palette type (deferred v1.2)
- Docs impact: minor — no public API changes, internal feature additions only
