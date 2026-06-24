# Phase 14a Implementation Report

### Executed Phase
- Phase: 14a — AI Mentor Chat + Cost Estimator
- Plan: /Volumes/ssd/MyApp/System_design/plans/260624-1113-clapet-clone
- Status: completed

### Files Modified/Created

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/features/mentor/mentor-store.ts` | created | Zustand store, localStorage persist per diagram id |
| `apps/web/src/features/mentor/build-context.ts` | created | Reads diagram/sim/review stores, builds system prompt |
| `apps/web/src/features/mentor/use-mentor.ts` | created | Streaming hook, supports openai/anthropic/deepseek, toast on error |
| `apps/web/src/features/mentor/mentor-panel.tsx` | created | Premium dark glassmorphism UI, suggested prompts, streaming dots |
| `apps/web/src/features/cost/cost-store.ts` | created | Zustand, subscribes to diagram store, recomputes on node change |
| `apps/web/src/features/cost/cost-panel.tsx` | created | Premium dark panel, hero total card, glow bars, per-node accordion |
| `packages/shared/src/pricing.ts` | created | estimateCost() covers all 10 node types, 49 variants |
| `packages/shared/src/index.ts` | modified | Export pricing |
| `apps/web/src/features/canvas/toolbar/top-toolbar.tsx` | modified | Added Brain+DollarSign buttons, CostBadge with glow dot, Cmd+M shortcut, MentorPanel+CostPanel mounted |
| `apps/web/src/features/canvas/canvas-editor.tsx` | modified | initMentorStore on diagramId change, computeNow trigger, onOpenMentor wired to CommandPalette |
| `apps/web/src/features/command/actions.ts` | modified | Added openMentor? to BuildContext + "Open Mentor" palette action |
| `apps/web/src/features/command/command-palette.tsx` | modified | Added onOpenMentor? prop, fixed exactOptionalPropertyTypes for toggleFailureMode/dropPattern/openMentor |
| `apps/web/src/components/ui/sheet.tsx` | modified | Added style?: CSSProperties to SheetContent |

### Tasks Completed
- [x] A1 Mentor panel — premium dark glassmorphism, streaming dots animation, suggested prompts
- [x] A2 Context builder — nodes/edges/sim metrics/review findings in system prompt
- [x] A3 Mentor store — Zustand with localStorage per diagramId
- [x] A4 useMentor hook — streams from OpenAI/Anthropic/DeepSeek (plain text, no tool calls)
- [x] A5 Mentor button in toolbar + Cmd+M shortcut + "Open Mentor" in Cmd+K
- [x] B1 Pricing table — estimateCost() for all types/variants
- [x] B2 Cost badge in toolbar — glowing dot, green/amber/red color, pill style
- [x] B3 Cost breakdown panel — hero total, category bar chart with glow, per-node accordion
- [x] B4 Cost store — subscribes to diagram store, recomputes reactively
- [x] UI polish — both panels match dark canvas aesthetic (deep plum gradient, white/5 surfaces, violet glow accents)

### Tests Status
- Type check: pass (0 errors)
- Build: pass (vite 4.02s, all chunks clean)
- Visual: Playwright screenshots confirm panels render correctly at localhost:5173

### Screenshots
- `/tmp/p14a-mentor.png` — Mentor panel open, empty state with suggested prompts
- `/tmp/p14-cost-panel.png` — Cost panel open, $0 hero + empty state
- `/tmp/p14a-cost.png` — Canvas with cost badge ($0/mo) in toolbar

### Key Decisions
- Mentor streams plain text (no tool calls) — separate from AI Generate panel per KISS
- Anthropic needs separate streaming path (SSE event format differs from OpenAI)
- exactOptionalPropertyTypes fix: use spread `...(x ? { key: val } : {})` pattern instead of passing `undefined`
- Premium UI: inline `style={}` for gradients/glows (Tailwind can't do these without arbitrary values)
- SheetContent `style` prop added to support custom panel backgrounds

### Docs impact: minor
- pricing.ts is new shared utility; no doc update required

### Unresolved Questions
- None
