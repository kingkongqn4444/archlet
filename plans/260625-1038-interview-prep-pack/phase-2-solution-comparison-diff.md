# Phase 2 — Solution Comparison Diff

**Status:** pending | **Priority:** P0 | **Effort:** 2d

## Context
- [Brainstorm](../reports/brainstormer-260625-1038-interview-prep-pack.md)
- Depends on: Phase 1 (uses problemId → templateId mapping); independent of Mentor UI

## Goal

User vẽ xong → click "Compare with canonical" → modal hiển thị diff (matched / missing / different) vs canonical template + AI-generated trade-off explanation.

## Architecture

### Diff algorithm (client-side)
```ts
type DiffResult = {
  matched: Array<{ userNode: DiagramNode; templateNode: DiagramNode }>;
  missing: DiagramNode[];      // template has, user doesn't
  extra: DiagramNode[];        // user has, template doesn't
  differentVariant: Array<{
    userNode: DiagramNode;
    templateNode: DiagramNode;
    explanation?: string; // filled in by AI batch call
  }>;
  edgeDiff: { missing: number; extra: number };
  scorePct: number; // 0-100
};

function diffDiagrams(user: Diagram, canonical: Template): DiffResult {
  // 1. Group user nodes by type, template nodes by type
  // 2. For each type, greedy match: same variant first, else best label cosine
  // 3. Unmatched template → missing; unmatched user → extra; variant diff → differentVariant
}
```

### AI explanation (batched)
- 1 AI call per session: pass all variant diffs → return JSON array of explanations
- Cached per (userVariant, templateVariant) tuple to avoid repeat calls

### API (minimal)
- `POST /api/mentor/diff/explain { diffs: [{userVariant, templateVariant, nodeType}] }` → JSON array of explanations
- Diff computation runs purely in browser

### Web UI
- `apps/web/src/features/diff/solution-diff-modal.tsx`
- Triggered from toolbar button (only visible when active problemId set, vd: after Mock Interview "finish")
- 3-pane visual:
  - Left: your diagram (mini-render)
  - Right: canonical diagram (mini-render)
  - Bottom: diff breakdown with score

## TODO

- [ ] diff-diagrams.ts util (pure function)
- [ ] /api/mentor/diff/explain endpoint
- [ ] solution-diff-modal.tsx
- [ ] Toolbar button "Compare with canonical"
- [ ] Connect problemId state (from Mock Interview or manual select)
- [ ] Mini-diagram renderer (read-only react-flow)
- [ ] Trade-off explanation cache (localStorage key by variant pair)
- [ ] typecheck + smoke test on 3 diagrams (URL Shortener, Twitter, Payment)

## Risks

| Risk | Mitigation |
|---|---|
| Diff false positives (semantically equivalent nodes differ by label) | Match by node.type + variant first; let AI rationalize labels |
| Multiple valid solutions (rate limiter has 3 algorithms) | Only 1 canonical per problem in v1; tag "alternative" in template metadata later |
| AI explanation cost runaway | Cache explanations forever; batch all diffs in 1 call |
