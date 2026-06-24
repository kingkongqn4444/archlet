# Phase 1 — Canvas Editor

## Context Links
- Brainstorm § 4, 5
- React Flow (xyflow) docs: https://reactflow.dev/learn

## Overview
- Priority: P0 (core UX)
- Status: pending
- Depends: Phase 0
- Canvas editor đầy đủ: 10 custom node types, edges có label, mini-toolbar, zoom/pan, undo/redo, dark mode.

## Key Insights
- React Flow custom node = React component nhận `data` prop. Wrap shadcn Card cho mỗi node type, dùng icon từ lucide.
- Selection mini-toolbar: dùng `NodeToolbar` của xyflow, position top.
- Undo/redo: Zustand store + middleware `zundo` (small, KISS).
- 3 abstraction levels = 3 entries trong cùng state: `{ high: {nodes,edges}, mid: {...}, low: {...} }`. Switch level = swap activeLevel.
- Dotted grid background: `<Background variant="dots" gap={20} size={1} />`.

## Requirements
**Functional:**
- Drag from sidebar palette → drop vào canvas → tạo node
- Click node → select → mini-toolbar (Configure / Duplicate / Delete)
- Drag handle giữa nodes → tạo edge
- Click edge → edit label inline
- Zoom (scroll + buttons), pan, fit-view
- Undo/redo (Cmd+Z / Cmd+Shift+Z)
- Toggle level High / Mid / Low (button group)
- Dark mode toggle persist localStorage

**Non-functional:**
- 60fps khi pan 200 nodes
- First paint canvas < 1s

## Architecture
```
apps/web/src/features/canvas/
  ├─ CanvasEditor.tsx        (<ReactFlowProvider> wrapper)
  ├─ store/diagram-store.ts  (Zustand + zundo)
  ├─ store/diagram-types.ts  (Node/Edge/Level types + Zod)
  ├─ nodes/
  │   ├─ index.ts            (nodeTypes registry)
  │   ├─ user-node.tsx
  │   ├─ api-node.tsx
  │   ├─ database-node.tsx
  │   ├─ cache-node.tsx
  │   ├─ queue-node.tsx
  │   ├─ storage-node.tsx
  │   ├─ cdn-node.tsx
  │   ├─ load-balancer-node.tsx
  │   ├─ worker-node.tsx
  │   └─ external-node.tsx
  ├─ edges/
  │   └─ labeled-edge.tsx     (default edge with label input)
  ├─ toolbar/
  │   ├─ top-toolbar.tsx     (zoom, undo, share, delete)
  │   ├─ node-toolbar.tsx    (Configure/Dup/Delete trên node)
  │   ├─ level-switcher.tsx  (High/Mid/Low)
  │   └─ side-palette.tsx    (drag nodes vào canvas)
  └─ hooks/
      ├─ use-keyboard.ts     (Cmd+Z, Del, etc.)
      └─ use-dark-mode.ts
```

## Related Code Files
**Create:** files trong tree trên + `apps/web/src/routes/d.tsx` (canvas route)
**Update:** App router thêm route `/d`, `/d/:id` (placeholder load id Phase 2)

## Implementation Steps
1. Install `@xyflow/react`, `zustand`, `zundo`, `lucide-react`.
2. Define Zod schemas: `NodeSchema` (id, type, position, data: {label, description}), `EdgeSchema` (id, source, target, data: {label}), `DiagramLevel`, `Diagram` (id, name, levels: {high,mid,low}, activeLevel).
3. Zustand store với zundo middleware: `nodes`, `edges`, `activeLevel`, actions `addNode/updateNode/deleteNode/addEdge/.../setLevel/setNodes/setEdges`.
4. Implement 10 custom node components — mỗi cái shadcn Card + icon + 4 Handles (top/bottom/left/right), styling consistent (rounded-2xl, shadow, border).
5. Implement `labeled-edge` custom edge dùng `BaseEdge` + `EdgeLabelRenderer` cho label nhập inline.
6. Build `side-palette` drag source: each item có `onDragStart` set `dataTransfer`. Canvas `onDrop` parse và addNode.
7. `top-toolbar`: zoom %, fit-view, undo, redo, share placeholder, delete diagram.
8. `node-toolbar`: xyflow `NodeToolbar` component, hiển thị khi `selected: true`.
9. `level-switcher`: 3 button (High/Mid/Low), click → store.setLevel + load level data.
10. Keyboard shortcuts: Delete xoá selected, Cmd+Z undo, Cmd+Shift+Z redo.
11. Dark mode: Tailwind `dark:` classes, toggle button → `document.documentElement.classList.toggle('dark')` + localStorage.
12. Background dotted grid + zoom controls bottom-right (xyflow `<Controls />`).

## Todo List
- [ ] Install xyflow + zustand + zundo + lucide
- [ ] Zod schemas Diagram/Node/Edge/Level
- [ ] Zustand store với zundo (undo/redo)
- [ ] 10 custom node components
- [ ] labeled-edge custom edge
- [ ] Side palette với drag-drop
- [ ] Top toolbar (zoom/undo/redo/share/delete)
- [ ] Node toolbar (Configure/Dup/Delete)
- [ ] Level switcher (High/Mid/Low)
- [ ] Keyboard shortcuts
- [ ] Dark mode toggle
- [ ] `/d` route hiển thị canvas trống có thể edit

## Success Criteria
- Drag 10 node types lên canvas, connect bằng edge, edit label, undo/redo hoạt động
- Switch level: state riêng cho mỗi level
- Dark mode toggle, persist sau reload
- Lighthouse Perf > 90 trên canvas trống

## Risk Assessment
| Risk | Likelihood | Mitigation |
|---|---|---|
| xyflow re-render quá nhiều | Med | Memoize node components, `selectorEqualityFn` cho store |
| Zundo bloat memory với 100+ steps | Low | Limit 50 history entries |
| Custom edge label conflict với pan | Low | `pointer-events: all` chỉ trên label, parent `pointer-events: none` |

## Security Considerations
- Label/description user input → escape khi render text content (React mặc định đã escape)
- Không cho user inject HTML qua description (chỉ accept plain text)

## Next Steps
→ Phase 2: persist diagram vào D1
