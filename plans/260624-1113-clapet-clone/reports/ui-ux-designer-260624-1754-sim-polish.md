# Sim Polish — Run UX + Simulator visuals + Canvas affordances

Date: 2026-06-24
Scope: fix disabled-Run discoverability, gorgeous simulator visuals, canvas onboarding

## TL;DR

- Disabled Run is now visually unmistakable (ghost outline + diagonal stripes + strikethrough "Run" + cursor-not-allowed).
- Inline amber chip + on-hover tooltip explain why Run is disabled and what to do next ("Connect User → a service", etc.).
- Empty canvas now shows a centered onboarding card with an animated "← From the left palette" cue.
- Disconnected User node gets a floating amber "Drag from the dot to connect" hint with pulsing dot + left-pointing arrow.
- "Simulating" green badge with pulsing dot pinned top-center while sim runs.
- Packets are now soft-glowing radial-gradient dots; edge throughput rendered as cream/amber pill with a mini lightning bolt + drop shadow; node util is an HTML chip top-right with colored dot + pulse on red.
- Side palette grouped with ACTORS / COMPUTE / STORAGE / NETWORK labels and improved hover affordance (scale + tooltip slide-in).
- Bigger glowing handles + subtle "selected" pulse halo on selected node.
- Fixed a real underlying bug (the original "bấm Run mà éo thấy chạy"): the simulator subscription was rebuilding on every node drag/select; FlowOverlay was reading from a stale Simulator ref so packets/badges never rendered. Now topology-keyed rebuild + getSim accessor + ref-based rAF loop.

## Files changed

Created
- `apps/web/src/features/canvas/toolbar/canvas-hints.tsx` — EmptyHero, DisconnectedUserHint, SimulatingBadge

Modified
- `apps/web/src/features/simulate/run-button.tsx` — new disabled state, inline chip, tooltip
- `apps/web/src/features/simulate/flow-overlay.tsx` — gradient/glow SVG defs, pill badges, HTML util chip moved out, rAF ref-loop, getSim accessor
- `apps/web/src/features/simulate/use-simulate.ts` — topology-key based rebuild + getSim accessor
- `apps/web/src/features/canvas/nodes/base-node.tsx` — absolute-positioned util chip + `archlet-selected-pulse` class
- `apps/web/src/features/canvas/toolbar/side-palette.tsx` — group labels + hover affordance
- `apps/web/src/features/canvas/canvas-editor.tsx` — mount `<CanvasHints/>`
- `apps/web/src/globals.css` — bigger glowing handles, selected pulse halo, active-edge filter

## Before / after — Run disabled state

Before
- bg `plum-900/40` + text `cream-50/40` — nearly indistinguishable from the enabled `bg-plum-900` in dark mode.
- `title={...}` was the only hint (browsers hide native title on touch).
- No nudge about what to do.

After
- Ghost dashed `border border-dashed border-plum-300/700` + low-contrast `text-ink-500/70` + `cursor-not-allowed`.
- Decorative `repeating-linear-gradient(45deg, ...)` diagonal stripes overlay at 40% opacity.
- "Run" word gets strikethrough.
- Inline amber chip `Connect User → a service` (or `Drop nodes onto canvas first`, etc.) sits to the right of the pill — dismissable by click.
- Custom Tooltip popover (bg-ink-900) appears above the pill on hover/click with same reason text.
- Tap-to-toggle for touch devices (clicking the disabled button reveals tooltip).

## Packet visual tokens

```
radialGradient #packet-core
  0%  #FEF3C7  alpha 1   (cream pop)
  55% #F59E0B  alpha 1   (amber-500)
  100% #D97706 alpha 0.95 (amber-600 edge)

radialGradient #packet-glow
  0%  #FBB525 alpha 0.7
  60% #F59E0B alpha 0.18
  100% #F59E0B alpha 0

filter #packet-blur — feGaussianBlur stdDeviation=0.4
filter #pill-shadow — feDropShadow dy=1 stdDev=1.2 floodColor=#36114a floodOpacity=0.18

Packet render
  outer circle r=10 fill=url(#packet-glow) opacity=0.55
  core circle r=4.5 fill=url(#packet-core) filter=url(#packet-blur)
```

Edge throughput pill
- rounded `rx=9`, height 18, width = max(58, 18 + label.length*6)
- fill `#FEFCF6` (cream-50), stroke `#FCD34D` (amber-300), 1px
- text fill `#92400E` (amber-800), font-weight 700, size 10.5px, tracking -0.01em
- mini SVG bolt-path in amber-600 to the left of the text
- drop shadow filter for lift

Node util chip (HTML/JSX in base-node.tsx)
- absolute `-top-2 -right-2` rounded-full, ring-1, `bg-white dark:bg-plum-900` + 15%-tinted color overlay
- colored dot (●) + percent — green/amber/red by util tier (0.5 / 0.8 thresholds)
- Pulse animation when red (`>0.8`)
- Hidden when util=0 AND not running

## Canvas affordance CSS

```css
/* Bigger glowing handles */
.react-flow__handle {
  width: 12px !important;
  height: 12px !important;
  ...
}
.react-flow__node:hover .react-flow__handle,
.react-flow__node.selected .react-flow__handle {
  opacity: 1;
  box-shadow: 0 0 0 3px rgba(108,43,217,0.18);
}
.react-flow__handle:hover {
  background: #6C2BD9 !important;
  transform: scale(1.3);
  box-shadow: 0 0 0 5px rgba(108,43,217,0.28), 0 0 12px rgba(108,43,217,0.45);
}

/* Selected-node halo */
.archlet-selected-pulse {
  animation: archletPulse 2.2s ease-in-out infinite;
}
@keyframes archletPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(108, 43, 217, 0.18), 0 2px 12px -4px rgba(54,17,74,0.12); }
  50%      { box-shadow: 0 0 0 6px rgba(108, 43, 217, 0.0),  0 2px 12px -4px rgba(54,17,74,0.12); }
}

/* Active edge (sim running + has traffic) */
.react-flow__edge.archlet-edge-active .react-flow__edge-path {
  stroke-width: 2.5 !important;
  filter: drop-shadow(0 0 3px rgba(245, 158, 11, 0.45));
  animation: dashdraw 0.6s linear infinite;
}
```

prefers-reduced-motion disables all of the above + animate-ping + animate-pulse.

## Screenshots

Saved under `/tmp/`:

- `sim-polish-01-empty.png` — empty canvas with hero card + animated arrow + grouped palette
- `sim-polish-02-nodes-no-edges.png` — 3 nodes dropped, no edges; ghost-outline Run with strikethrough + diagonal stripes; inline amber chip "Connect User → a service"; floating "Drag from the dot to connect" near User; Pull button still enabled
- `sim-polish-03-run-disabled-tip.png` — hover state on disabled Run reveals ink-900 tooltip popover with the same reason
- `sim-polish-04-edges-connected.png` — edges drawn, hint chip auto-dismissed, Run enabled plum-900 pill
- `sim-polish-05-running.png` / `06-running.png` — pulsing green "Simulating" badge top-center; red "Stop" pill; glowing amber packet trains on edges; cream-amber pills "⚡ 93 req/s" / "⚡ 25 req/s" / "⚡ 63 req/s"; node util chips "● 23%" (API), "● 1%" (Database)

## Underlying bug fix (real cause of "bấm Run mà éo thấy chạy")

Two stacked bugs prevented packets from ever rendering:

1. **Over-eager rebuild.** `useSimulate` subscribed to ALL `useDiagramStore` state changes and rebuilt the Simulator on any new `nodes` / `edges` array reference. React Flow's selection, drag, and fitView all produce new arrays → simulator constantly reset → `setRunning(false)` flipped Run back immediately after the click.
   - Fix: topology key (id + type + variant for nodes; id + endpoints for edges) — only rebuild when topology actually changes.

2. **Stale Simulator ref.** `simRef` in `useSimulate` was set once via `if (!simRef.current)`, so after any rebuild FlowOverlay was reading packets from a long-dead Simulator. Combined with #1 this masked the rendering.
   - Fix: expose a `getSim()` accessor that returns the current module-level singleton at call time; FlowOverlay uses it inside the rAF draw. Bonus: keep the rAF loop alive across renders by stashing the latest `draw` in a ref and starting the loop only once (avoids cancel/restart thrash from edgeMetrics-driven re-renders).

These touch `use-simulate.ts` only — not the simulator engine (`simulator.ts`, `capacity.ts`, `sim-store.ts`).

## Verification

- `pnpm typecheck` — pass
- `pnpm build` — pass
- Headless Playwright (`/tmp/verify-sim-polish.cjs`) covered: empty canvas → drop 3 nodes → hover disabled Run → connect edges → click Run → packets fly. All visual states captured.

## Known gaps / follow-ups

- The "Drag from the dot" hint floats above the User node, anchored to its DOM rect. On viewport-pan it may briefly desync (1 frame) with rAF position tracking; cheap to live with.
- The throughput pill on User→API can overlap the inline edge label when the user gives the edge a custom label. Pill is offset +18px below midpoint to mitigate, but a smarter collision check would be cleaner (future work).
- `repeating-linear-gradient` stripes on the disabled Run only show in light mode at decent contrast — in dark mode they're very subtle. The dashed border + strikethrough still convey "disabled" loudly enough that this is acceptable.
- `cursor-not-allowed` requires `pointer-events:auto` so we keep the button clickable to toggle the tooltip on touch; this is by design.
- Empty hero card uses `inset-0 flex items-center justify-center` — on very tall viewports the card sits exactly center, which on landscape laptops is great; if a future tablet layout shrinks vertical room, may need to anchor higher.
- xyflow's MiniMap CSS was untouched but inherits the new handle styles in viewport scale — verified no regression.

## Unresolved questions

None blocking.
