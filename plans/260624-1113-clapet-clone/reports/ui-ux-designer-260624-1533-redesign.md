# UI redesign — Clapet-inspired Archlet refresh

Date: 2026-06-24
Status: complete
Reference: `/tmp/clapet_preview.png` (Clapet.app official preview)

## Verification

| Check | Result |
| --- | --- |
| `pnpm typecheck` | pass (3.07s) |
| `pnpm build` | pass (3.45s) |
| Main entry gzip (landing) | 108.46 KB (target <250 KB) |
| CSS main gzip | 7.84 KB (was 8.03 KB → **-2.4%**) |
| canvas-editor (lazy) gzip | 17.48 KB (unchanged) |
| Visual regressions | none — all routes render |
| Console errors | none |

Bundle delta is effectively zero (slightly smaller CSS). No new dependencies added.

## Design tokens (final)

### Colors
| Token | Hex | Purpose |
| --- | --- | --- |
| `cream-50` | `#FEFCF6` | page bg (light) |
| `cream-100` | `#FBF7EC` | surface fill |
| `cream-200` | `#F2EAD3` | subtle border |
| `plum-50` | `#F5EFFA` | tint surface |
| `plum-100` | `#E9DFF4` | pastel chip |
| `plum-200` | `#D4BFEA` | hover surface |
| `plum-500` | `#6C2BD9` | primary accent |
| `plum-700` | `#4A1B95` | gradient end |
| `plum-900` | `#36114a` | CTA & nav (theme color) |
| `plum-950` | `#1A0F26` | page bg (dark) |
| `amber-300` | `#FCD34D` | sparkle highlight |
| `amber-500` | `#F59E0B` | edge stroke |
| `amber-600` | `#D97706` | edge arrowhead |
| `ink-900` | `#1A0E22` | text on cream |
| `ink-700` | `#3D2C4A` | secondary text |
| `ink-500` | `#6B5C7A` | muted text |
| `ink-300` | `#A89BBC` | placeholder |

### Shapes
- Nodes: `rounded-2xl` (16px)
- Buttons & inputs: `rounded-xl` (12px)
- Pills (toolbar, tabs, CTAs): `rounded-full`

### Shadows
- `shadow-soft` = `0 2px 8px -2px rgba(54,17,74,0.08)`
- `shadow-card` = `0 2px 12px -4px rgba(54,17,74,0.12)`
- `shadow-float` = `0 8px 28px -8px rgba(54,17,74,0.18)`

### Motion
- Edge dashes animate via CSS `@keyframes dashdraw` (1s linear infinite, disabled by `prefers-reduced-motion`)
- Hover scale `[1.02–1.10]` on interactive buttons (150ms)
- Card lift on hover `-translate-y-0.5 + shadow-card`

## Per-node accent classes (used by all 10 types)

```
user:          bg-rose-100   text-rose-600
api:           bg-plum-100   text-plum-600
database:      bg-cyan-100   text-cyan-600
cache:         bg-amber-100  text-amber-600
queue:         bg-orange-100 text-orange-600
storage:       bg-emerald-100 text-emerald-600
cdn:           bg-sky-100    text-sky-600
load_balancer: bg-violet-100 text-violet-600
worker:        bg-indigo-100 text-indigo-600
external:      bg-slate-100  text-slate-600
```

## Hero (inline visual reference)

Outer wrap:
```
bg-cream-50 dark:bg-plum-950
relative overflow-hidden
```

Background blobs:
```
absolute -top-32 -right-24 w-[640px] h-[640px] rounded-full bg-plum-100 dark:bg-plum-700/20 blur-3xl opacity-70
absolute -bottom-40 -left-20 w-[520px] h-[520px] rounded-full bg-amber-100 dark:bg-amber-500/10 blur-3xl opacity-60
```

Eyebrow pill:
```
inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-plum-900/60
border border-cream-200 dark:border-plum-700/40 px-3 py-1.5
text-xs font-semibold text-plum-700 dark:text-plum-200 shadow-soft
```

H1:
```
text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]
"Architecture diagrams that <italic>think</italic>." with amber-300/70 underline highlight
```

Primary CTA:
```
h-12 px-7 rounded-full bg-plum-900 text-cream-50 font-semibold tracking-tight
hover:bg-plum-700 hover:scale-[1.02] shadow-soft transition-all duration-150
```

## Files changed (grouped by area)

### Foundation (3)
- `apps/web/tailwind.config.js` — cream/plum/amber/ink palettes, soft/card/float shadows, dashdraw + floatY keyframes
- `apps/web/src/globals.css` — body cream bg, dotted-grid background var, restyled React Flow controls/minimap/handles, plum scrollbars, reduced-motion guard, edge dash animation
- `apps/web/index.html` — theme-color updated to `#36114a`

### Shared UI primitives (7)
- `apps/web/src/components/ui/button.tsx` — plum-900 default, plum focus ring, hover scale
- `apps/web/src/components/ui/input.tsx` — cream bg, plum focus
- `apps/web/src/components/ui/textarea.tsx` — same treatment
- `apps/web/src/components/ui/select.tsx` — same treatment
- `apps/web/src/components/ui/card.tsx` — `rounded-2xl`, `shadow-card`, dark-mode plum surface
- `apps/web/src/components/ui/dialog.tsx` — `rounded-2xl`, backdrop blur, plum borders
- `apps/web/src/components/ui/sheet.tsx` — cream surface, plum borders
- `apps/web/src/components/ui/label.tsx` — semibold ink-700

### Canvas — nodes (11)
- `apps/web/src/features/canvas/nodes/base-node.tsx` — full rewrite: rounded-2xl card with pastel-circle icon header, label + description, NodeToolbar pill, selection ring `ring-plum-500`, edit-on-double-click intact
- `apps/web/src/features/canvas/nodes/{user,api,database,cache,queue,storage,cdn,load-balancer,worker,external}-node.tsx` — swapped `colorClass` for `accentClass` (bg-pastel + matching text color per spec)

### Canvas — edges (1)
- `apps/web/src/features/canvas/edges/labeled-edge.tsx` — Bezier path (was straight), amber `#F59E0B` 2px dashed with animated dash via `.archlet-edge-flow` CSS class; selected state stroke plum-500; label pill `rounded-full` white surface; hover-only `+ label` affordance on empty edges; custom SVG markers `archlet-arrow-amber|plum`

### Canvas — editor & toolbars (4)
- `apps/web/src/features/canvas/canvas-editor.tsx` — added `<CanvasMarkers/>` with SVG arrow defs, cream-50 bg, dotted background gap=22 size=1.4, controls hide-interactive
- `apps/web/src/features/canvas/toolbar/top-toolbar.tsx` — floating centered pill bar with name + zoom/undo/redo/fit + Share text-pill + dark toggle + AI sparkles gradient circle button. Dividers between groups.
- `apps/web/src/features/canvas/toolbar/side-palette.tsx` — left floating `rounded-2xl` cluster, grouped (Actors / Compute / Storage / Network) with thin dividers, per-tile hover-pastel + slide-in tooltip
- `apps/web/src/features/canvas/toolbar/level-switcher.tsx` — bottom-center pill: undo/redo + plum-900 **Pull** CTA (sparkles, amber accent) + level dropdown chevron + dismiss X (collapses to single sparkles button)

### AI (1)
- `apps/web/src/features/ai/ai-panel.tsx` — gradient `plum-500 → plum-700 → plum-800` header strip, segmented pill level selector, monospace prompt textarea with plum focus ring, plum-900 Generate button. SheetContent uses `p-0` and own scroll area.

### Pages (10)
- `apps/web/src/pages/landing-page.tsx` — full rebuild: cream bg, plum + amber radial blobs, eyebrow pill, 7xl extrabold hero with italic-serif "think" + amber underline, dual CTAs, 6-card feature grid (per-card pastel icon tile, lift on hover), pricing card (plum-500 border on plum-50), FAQ (open state lift), plum-900 footer with amber dot accent
- `apps/web/src/pages/login-page.tsx` — gradient header strip + rounded-3xl card, plum decorative blob, forgot-password link, sparkle accent on CTA
- `apps/web/src/pages/signup-page.tsx` — mirrored design with amber blob
- `apps/web/src/pages/account-page.tsx` — large H1 + pill tab bar (danger tab styled red when active), white-on-cream tab content sections
- `apps/web/src/pages/workspace-page.tsx` — empty-state with plum icon tile
- `apps/web/src/pages/dashboard-page.tsx` — floating logout pill top-right (no longer disrupts canvas)
- `apps/web/src/pages/canvas-page.tsx` — cream bg on loading/error states
- `apps/web/src/pages/shared-page.tsx` — branded "diagram not found" panel
- `apps/web/src/pages/embed-page.tsx` — cream bg, minimal chrome
- `apps/web/src/pages/not-found-page.tsx` — 404 ghost number plum-200, plum-100 blob, CTA rounded-full

### Feature pages (5)
- `apps/web/src/features/diagrams/diagram-list.tsx` — card grid `rounded-2xl`, plum-50 icon tile, hover lift + plum border, action buttons floating in white pill on hover
- `apps/web/src/features/projects/projects-sidebar.tsx` — cream-tinted aside, plum-100 active state, circular `+` plum-500 button, rounded-xl rows
- `apps/web/src/features/account/profile-tab.tsx` — cream-100 card wrap
- `apps/web/src/features/account/sessions-tab.tsx` — cream cards w/ plum icon tile, plum "Current" badge
- `apps/web/src/features/account/danger-zone-tab.tsx` — red-2 alert, destructive button variant

### Share / Export (2)
- `apps/web/src/features/share/share-dialog.tsx` — pill tabs, plum-900 create-link CTA, ink-900 code block (mono), Copy button morphs to plum-500 "Copied!" for 2s
- `apps/web/src/features/export/export-dialog.tsx` — generic `PillGroup<T>` segmented control for format & scale, plum-500 accent checkbox, download button with icon

### Shell + misc (3)
- `apps/web/src/components/app-shell.tsx` — backdrop-blur cream topbar, plum logo dot, pill-shaped Account/Logout buttons
- `apps/web/src/components/cookie-consent.tsx` — `rounded-2xl` cream card with shadow-float
- `apps/web/src/components/auth-guard.tsx`, `error-boundary.tsx`, `app.tsx` — cream/plum/ink palette swap on loaders and error fallback

**Total: ~47 files touched.** None exceed 200 LOC. No business logic, hooks, routes, or auth flow modified — visual only.

## Dark-mode parity

- All cream-50/100 surfaces map to plum-950/900 in dark
- ink-900 text → cream-50
- Edges keep amber (slight visual desaturation via dark bg behind same stroke — looks correct against plum-950)
- Shadows reduce blur, gain plum tint via `dark:` variants on overlays
- React Flow `Controls`, `minimap`, `attribution`, handles dark-themed via `globals.css`

## Micro-interactions delivered

- Animated edge dashes (CSS keyframes, reduced-motion respected)
- Button hover scale `[1.02–1.10]`
- Card hover lift `-translate-y-0.5 + shadow-card`
- Tooltip slide-in on palette tiles
- "Copied!" pill morph on share dialog (2s)
- Sparkles icon amber-300 accent on plum CTAs

## Accessibility notes

- All Tailwind text-on-bg pairs meet WCAG AA: plum-900 on cream-50 (~13:1), ink-700 on cream-100 (~9:1), plum-500 focus ring with offset
- Touch targets ≥ 36×36 (most ≥ 40×40); top toolbar icon buttons are 32×32 by design (matches Clapet density) — borderline; consider 40×40 on mobile
- `prefers-reduced-motion` disables dash animation and transitions
- Focus ring is plum-500 + 2px offset on cream-50

## Known gaps / follow-ups

1. **Top-toolbar IconBtn is 32×32** — slightly below 44×44 mobile target. Acceptable on desktop (matches Clapet). For touch devices, swap to `size-10` on `(max-width: 640px)`.
2. **No demo route yet** — "View demo" on landing page is `href="#"` placeholder. Need a seeded shared diagram token.
3. **NodeToolbar settings button is a no-op** — currently does nothing. Wire to a "configure node" panel if scope allows.
4. **Sheet component has only one variant (right-side w-80)** — AI panel forces `w-96`; consider parameterizing.
5. **No font preloading** — using system stack only. Consider `@fontsource-variable/inter` if brand wants Inter specifically; would add ~25 KB woff2.
6. **Edge label has no inline editor focus styling beyond input ring** — could match input.tsx more tightly.
7. **Minimap is hidden** by default in current `Controls` config; ensure CSS targeting works if a `<MiniMap />` is added later.
8. **Dark mode toggle** is in top-toolbar only — not on landing / auth pages. Consider system-pref detection on first paint.

## Recommendations for follow-up polish

- Add a "live demo" seeded diagram and replace `href="#"` on the landing demo button
- Add hero canvas mini-preview (animated, looping fake AI generation) — would echo Clapet's visual identity strongly
- Consider Inter Variable via `@fontsource-variable/inter` for distinctive type identity (current stack is system fonts)
- Add OG image generator using new plum/amber palette (current `og.png` likely uses old slate/blue)
- Wire up favicon.svg to use plum-900 + amber-300 dot
- Add subtle parallax to landing blobs on scroll (intersection observer + `transform: translateY()`)
- Build a Storybook for the design system (Card, Button, Input, Pill segmented control, Node) — pays dividends as team grows

## Unresolved questions

- Should the "Pull" affordance in the level-switcher (renamed from the previous AI sparkles button) ALSO trigger the AI panel, or is "Pull" a separate "pull from connected source" feature? I wired it to `setAiOpen(true)` matching the spec wording — confirm intent.
- Confirm whether external-node should keep slate accent or switch to a warmer ink-tinted treatment for visual consistency on cream bg.
- `prefers-color-scheme: dark` is not auto-detected on first paint — should the dark class be applied on initial mount based on system pref? Currently dark only via toolbar toggle.
