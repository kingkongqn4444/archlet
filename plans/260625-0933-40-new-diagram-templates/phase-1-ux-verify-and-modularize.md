# Phase 1 — UX Verify + Modularize templates.ts

**Status:** pending | **Priority:** P0 | **Effort:** 1.5 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260625-0933-40-new-diagram-templates.md)
- [Plan overview](./plan.md)

## Overview

CRITICAL prework. User saw "1 cái ít" trong patterns sidebar — đó là `patterns-catalog.ts`, KHÔNG phải templates. Verify templates đang render ở UI nào trước khi grind 5.5d content. Sau đó modularize templates.ts → templates/ directory (sẽ phình to 1330 lines).

## Key Insights

- `templates.ts` 334 lines, 10 templates → adding 40 = ~1330 lines → vi phạm 200-line rule
- Split per category file giống cách vừa làm với `variants/`
- Patterns sidebar ≠ templates picker — likely separate UI surfaces
- Template picker UI có thể đã ẩn / chưa wire / filter out empty categories

## Requirements

**Functional:**
- Inspect UI: tìm chính xác file render templates (probably `apps/web/src/features/templates/` hoặc `apps/web/src/features/canvas/sidebar/`)
- Confirm 10 existing templates visible trong UI
- Nếu KHÔNG visible → fix wire first
- Modularize templates.ts → templates/ directory, no behavioral change
- Backwards-compat: `import { TEMPLATES } from "@archlet/shared"` vẫn work

**Non-functional:**
- typecheck pass after split
- All 10 existing templates still load

## Architecture

```
packages/shared/src/templates/
├── types.ts                       — Template, TemplateCategory, TemplateDifficulty types
├── index.ts                       — TEMPLATES array + helpers; barrel
├── real-world-apps.ts             — existing 10 + future 15
├── architectural-patterns.ts      — future 10
├── industry-specific.ts           — future 15
└── _helpers.ts                    — common node/edge builders if patterns repeat
```

## Related Code Files

**Investigate:**
- `apps/web/src/features/canvas/sidebar/` (templates picker likely here)
- `apps/web/src/features/templates/` (if exists)
- Grep `TEMPLATES` import sites — find UI consumers

**Create:**
- `packages/shared/src/templates/types.ts`
- `packages/shared/src/templates/index.ts`
- `packages/shared/src/templates/real-world-apps.ts`
- `packages/shared/src/templates/architectural-patterns.ts` (empty placeholder, populate phase 3)
- `packages/shared/src/templates/industry-specific.ts` (empty placeholder, populate phase 4)
- `packages/shared/src/templates/_helpers.ts` (if needed)

**Delete:**
- `packages/shared/src/templates.ts` (after split)

**Modify:**
- `packages/shared/src/index.ts` (barrel — should be no-op nếu still exports same names)
- Possibly UI template picker if not wired

## Implementation Steps

1. **UI scout**: grep `TEMPLATES` import + read template picker component
   ```bash
   grep -rn "TEMPLATES\|from \"@archlet/shared\"" apps/web/src --include="*.tsx" | grep -i template
   ```
2. **Run dev server**, open app, check sidebar/menu → templates visible?
3. **If templates not visible** → fix UI first (priority blocker). Common issues:
   - Template picker hidden behind feature flag
   - Empty state shown despite TEMPLATES non-empty
   - Filter logic bug (vd: filter by category that doesn't exist)
4. **Extend TemplateCategory enum** in `types.ts`:
   ```ts
   export type TemplateCategory =
     | "social" | "messaging" | "streaming" | "marketplace" | "infra" | "fintech"
     // new:
     | "architectural" | "healthcare" | "gaming" | "iot" | "edtech" | "logistics" | "ai";
   ```
5. **Move types + Template interface** to `templates/types.ts`
6. **Move existing 10 templates** to `templates/real-world-apps.ts` (no content change)
7. **Create empty `architectural-patterns.ts` + `industry-specific.ts`** (export empty arrays)
8. **`templates/index.ts`**:
   ```ts
   export * from "./types";
   import { REAL_WORLD_APPS } from "./real-world-apps";
   import { ARCHITECTURAL_PATTERNS } from "./architectural-patterns";
   import { INDUSTRY_SPECIFIC } from "./industry-specific";
   export const TEMPLATES: Template[] = [
     ...REAL_WORLD_APPS,
     ...ARCHITECTURAL_PATTERNS,
     ...INDUSTRY_SPECIFIC,
   ];
   export function getTemplate(id: string): Template | undefined {
     return TEMPLATES.find(t => t.id === id);
   }
   export function getTemplatesByCategory(cat: TemplateCategory): Template[] {
     return TEMPLATES.filter(t => t.category === cat);
   }
   ```
9. **Delete `templates.ts`** (Node resolution will pick templates/index.ts)
10. **`pnpm typecheck`** — must pass
11. **Smoke test in UI** — 10 templates still appear

## Todo List

- [ ] Grep TEMPLATES import sites, locate UI picker
- [ ] Run dev server, verify 10 templates visible
- [ ] If hidden → fix UI wire (blocker)
- [ ] Extend TemplateCategory enum (+7 new)
- [ ] Create `templates/types.ts`
- [ ] Create `templates/real-world-apps.ts` (move existing 10)
- [ ] Create `templates/architectural-patterns.ts` (empty stub)
- [ ] Create `templates/industry-specific.ts` (empty stub)
- [ ] Create `templates/index.ts` (barrel + helpers)
- [ ] Delete old `templates.ts`
- [ ] `pnpm typecheck` pass
- [ ] Smoke test UI: 10 templates visible

## Success Criteria

- UI shows all 10 existing templates (post-modularize, same as before)
- 13 TemplateCategory values valid
- typecheck pass
- File sizes: each <250 lines
- Phase 2/3/4 unblocked

## Risk Assessment

| Risk | Mitigation |
|---|---|
| UI picker bug worse than expected (rewrite needed) | Time-box 4h; if not fixed, file separate issue + continue modularize |
| `templates.ts` vs `templates/` conflict at import resolution | Delete templates.ts BEFORE testing imports — Node won't pick directory if file exists |
| Existing template configs reference removed variant fields | typecheck will catch; fix in same PR |
| Existing tests reference templates | Re-run test suite after split |

## Security Considerations

None — refactor only.

## Next Steps

→ Phase 2: 15 real-world apps. Author into `real-world-apps.ts`.
