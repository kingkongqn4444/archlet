# PRO Polish Pass — Visual Refinement Report

Date: 2026-06-24 — UI/UX Designer
Scope: pure visual polish. No business logic / simulator engine touched.
Reference: `/tmp/clapet_preview.png` (calm cream), `/tmp/state-nodes.png` (3 issues fixed)
Build: `pnpm typecheck` + `pnpm build` PASS

---

## Screenshots
- `/tmp/pro-empty.png` — dark, new hero CTA card
- `/tmp/pro-3nodes.png` — 3 nodes dropped, no toolbar overflow, on-brand hint floats above User
- `/tmp/pro-properties.png` — properties panel slides in, variant gradient header
- `/tmp/pro-light.png` — light mode mirrors clapet calm cream vibe

---

## Files changed (11)

| # | File | Reason |
|---|------|--------|
| 1 | `apps/web/tailwind.config.js` | Added `shadow-inset-pill`, `animation.slide-in-right`, `bob-slow`, `glow-once`. |
| 2 | `apps/web/src/globals.css` | Added `.archlet-canvas-bg` radial vignette + `.archlet-smallcaps` utility. |
| 3 | `apps/web/src/components/app-shell.tsx` | Brand mark (triangle SVG) + avatar dropdown (replaces Account/Logout text). Header gradient bottom-border. Replaced bg with `archlet-canvas-bg`. |
| 4 | `apps/web/src/components/cookie-consent.tsx` | Slim pill bottom-left. No longer overlaps React Flow controls or level-switcher. |
| 5 | `apps/web/src/features/canvas/toolbar/canvas-hints.tsx` | (a) On-brand hint: cream bg, plum border, amber bolt, dashed connector arrow pointing down to User. (b) Empty-canvas hero: animated mini-diagram glyph, Tutorial + "Ask AI to generate" CTAs. Plum accent line top. |
| 6 | `apps/web/src/features/canvas/toolbar/level-switcher.tsx` | REMOVED inline amber chip (Issue #1). Added `shadow-inset-pill` depth. Typography 12px. |
| 7 | `apps/web/src/features/canvas/toolbar/side-palette.tsx` | `archlet-smallcaps` groups (9px, small-caps). 1px hairline above each group. Tile 9×9 (was 10×10). Added `data-archlet-palette` for empty-hero focus target. |
| 8 | `apps/web/src/features/canvas/toolbar/top-toolbar.tsx` | Diagram-name 14px font-semibold tracking-tight. Pill gets `shadow-inset-pill`. |
| 9 | `apps/web/src/features/simulate/run-button.tsx` | Removed diagonal stripes + amber chip. Disabled state = muted bg + 40% grayscale + cursor-not-allowed. Tooltip on hover only. |
| 10 | `apps/web/src/features/canvas/nodes/base-node.tsx` | Label 14px, variant 11px (was 13/10). Selected ring `ring-plum-500/80` + one-shot glow `animate-glow-once`. |
| 11 | `apps/web/src/features/canvas/properties/properties-panel.tsx` | `animate-slide-in-right` on open. Variant-specific gradient header (postgres blue, redis red, etc — VARIANT_ACCENT map). Section headings 11px bold uppercase tracking-widest. Focus rings on inputs. |
| 12 | `apps/web/src/features/simulate/flow-overlay.tsx` | Edge throughput badges → HTML overlay (was inline SVG). Crisp typography, backdrop-blur, dark-mode aware. |
| 13 | `apps/web/src/features/canvas/canvas-editor.tsx` | Wired empty-hero "Ask AI" → opens AiPanel. |

---

## Key decisions

### 1. Toolbar overflow — fixed by removal
Previous polish added an inline amber chip ("Connect User → a service") INSIDE the bottom toolbar pill. At 1440px viewport this pushed Pull / High level / X off-screen. Pro tools whisper — kept the disabled Run with hover-tooltip + the floating hint above the User node. That's sufficient signal without shouting.

### 2. On-brand hint — design-system colors only
Yellow Post-it look replaced with `bg-cream-50/95` + `border-cream-200` + `text-ink-700` + amber-500 bolt icon. Anchored above User node with a 22-pixel SVG dashed connector arrow pointing down. Still attention-getting (via `animate-floatY`) but on-brand.

### 3. Cookie consent — bottom-left
Was fixed bottom-right overlapping React Flow zoom controls. Tried top-banner (broke clicks on sidebar New Project button) → settled bottom-left as slim content-sized pill. Does NOT overlap: level-switcher (bottom-center), React Flow controls (bottom-right), top toolbars.

### 4. Header — refined
- Added inline SVG triangle brand mark (network glyph) before "archlet."
- Replaced text "Account" + "Logout" with avatar circle (initials, plum gradient) + chevron-down dropdown menu. Menu shows name/email header + Account / Sign out.
- Subtle bottom border gradient (plum-200 via transparent) for premium separation.

### 5. Run button — subtle disabled
No more diagonal stripes (cheap looking). Disabled = `bg-plum-900/40 text-cream-50/60 grayscale-[0.4] cursor-not-allowed`. Tooltip on hover gives the reason. Calm but discoverable.

### 6. Side palette — small-caps elegance
Groups (`ACTORS`, `COMPUTE`, ...) now use `font-variant: all-small-caps` at 9px with hairline divider above each (except first). Compact, refined. Tile reduced 10→9px to gain 4px horizontal canvas space.

### 7. Properties panel — slide-in + variant accents
- `animate-slide-in-right` 220ms cubic-bezier on open (key prop forces re-mount per node).
- Header background gradient uses VARIANT_ACCENT map (e.g. PostgreSQL → `#336791`) at 15% opacity fading to transparent — gives each variant its own visual identity.
- Section headings standardized: 11px font-bold uppercase tracking-widest (was 10px font-semibold).
- Inputs: `transition focus:ring-2 focus:ring-plum-500/30 focus:border-plum-400`.

### 8. Premium accents
- `.archlet-canvas-bg`: radial-gradient `900x600 at 12% 8%` plum-50 fade — subtle warm depth top-left. Mirror in dark mode with plum-700/0.18.
- `shadow-inset-pill`: inner highlight + shadow for the floating pills (top toolbar, bottom toolbar, side palette). Adds dimensionality without being heavy.
- Selected node: `ring-plum-500/80 ring-offset-2` + one-shot `animate-glow-once` (700ms ease-out) on select.

### 9. Empty canvas hero
Replaced the 360-px arrow-pointing-at-palette card with a centered 420-px hero:
- Plum hairline accent line top.
- 140×64 SVG mini-architecture (User → API → Database) with `animate-bob-slow`.
- "Sketch your architecture" / "Drag a service from the left palette — or describe your system and let AI draft it for you."
- Two CTAs: Tutorial (60s) ghost button + "Ask AI to generate" plum-700 pill with amber sparkle.

### 10. Edge throughput badges → HTML
Was inline SVG with hand-drawn lightning bolt path + text. Converted to HTML overlay positioned via JS. Benefits: crisp font rendering, backdrop-blur support, dark-mode classes work, easier to maintain.

---

## Typography scale (now consistent)

| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Diagram name (top) | 14px | 600 | tight |
| Node label | 14px | 600 | tight |
| Node variant | 11px | 500 | tight |
| Toolbar buttons | 12px | 500/600 | tight |
| Properties section heading | 11px | 700 | widest, uppercase |
| Properties field label | 10.5px | 500 | wide, uppercase |
| Hint chips | 11px | 500-600 | tight |
| Palette group title | 9px | 600 | small-caps |

---

## Constraint compliance

- ✅ No new npm dependencies
- ✅ Tokens limited to cream/plum/amber/ink (lucide icon accents in palette unchanged per requirement)
- ✅ Both light + dark verified via screenshots
- ✅ `pnpm typecheck` passes
- ✅ `pnpm build` passes (3.65s)
- ✅ All files <200 LOC
- ✅ kebab-case naming preserved
- ✅ No `any` introduced
- ✅ No changes to: auth, persistence, AI orchestration, share, export, simulator engine, capacity, sim-store, properties form schema
- ✅ No new business features

---

## Unresolved questions

- The `react-flow` attribution palm-tree appears bottom-right; user may want to either move React Flow controls to a custom slot or hide attribution (currently `proOptions.hideAttribution: false`). Not changed in this pass — out of scope.
- Variant accent map (`VARIANT_ACCENT`) covers common variants but is incomplete for the full catalog. New variants will fall back to plum default. Could be moved to `@archlet/shared` as a brand-color field on the variant definition.
- Empty hero "Tutorial (60s)" button currently links to `youtube.com` placeholder. The actual tutorial URL needs to be provided by content owner.
- The `floatY` animation on the disconnected-user hint persists; consider whether the bob is too eye-catching when several nodes are placed but only one User is disconnected.
