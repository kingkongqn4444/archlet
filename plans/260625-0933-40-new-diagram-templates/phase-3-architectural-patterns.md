# Phase 3 — 10 Architectural Patterns

**Status:** pending | **Priority:** P0 | **Effort:** 1.5 ngày

## Context Links
- [Brainstorm](../reports/brainstormer-260625-0933-40-new-diagram-templates.md)
- [Plan overview](./plan.md)
- Depends on: Phase 1 (module structure + new `architectural` category)

## Overview

Author 10 templates demo các architectural pattern phổ biến. Khác Phase 2 (concrete apps), đây là **abstract pattern skeleton** — user xem để hiểu shape, không phải copy 1 app cụ thể.

## Template List

| # | id | name | difficulty | tags |
|---|---|---|---|---|
| 1 | microservices-skeleton | Microservices Skeleton | medium | service-mesh, api-gateway |
| 2 | event-sourcing-cqrs | Event Sourcing + CQRS | hard | event-store, projection |
| 3 | saga-orchestration | Saga Orchestration | hard | distributed-tx, compensation |
| 4 | strangler-fig | Strangler Fig Migration | medium | refactor, legacy |
| 5 | backend-for-frontend | Backend-for-Frontend (BFF) | easy | mobile, web, gateway |
| 6 | sidecar-pattern | Sidecar Pattern | medium | service-mesh, observability |
| 7 | circuit-breaker-bulkhead | Circuit Breaker + Bulkhead | medium | resilience, fault-tolerance |
| 8 | pubsub-materialized-view | Pub-Sub + Materialized Views | medium | event-driven, read-models |
| 9 | api-gateway-mesh | API Gateway + Service Mesh | medium | routing, observability |
| 10 | hexagonal-architecture | Hexagonal Architecture | easy | ports-adapters, clean-arch |

All `category: "architectural"`.

## Example Skeleton (Saga)

```ts
const sagaOrchestration: Template = {
  id: "saga-orchestration",
  name: "Saga Orchestration",
  description: "Distributed transaction via orchestrator + compensating actions for failed steps.",
  category: "architectural",
  difficulty: "hard",
  tags: ["distributed-tx", "compensation", "event-driven"],
  diagram: {
    nodes: [
      { id: "n1", type: "user", position: { x: 0, y: 200 }, data: { label: "Client", variant: "web-browser", config: {} } },
      { id: "n2", type: "api", position: { x: 240, y: 200 }, data: { label: "Saga Orchestrator", variant: "rest", config: { instances: 3 } } },
      { id: "n3", type: "worker", position: { x: 480, y: 50 }, data: { label: "Order Service", variant: "nodejs", config: {} } },
      { id: "n4", type: "worker", position: { x: 480, y: 150 }, data: { label: "Payment Service", variant: "nodejs", config: {} } },
      { id: "n5", type: "worker", position: { x: 480, y: 250 }, data: { label: "Inventory Service", variant: "nodejs", config: {} } },
      { id: "n6", type: "worker", position: { x: 480, y: 350 }, data: { label: "Shipping Service", variant: "nodejs", config: {} } },
      { id: "n7", type: "queue", position: { x: 720, y: 200 }, data: { label: "Saga Events", variant: "kafka", config: { partitions: 12 } } },
      { id: "n8", type: "database", position: { x: 960, y: 200 }, data: { label: "Saga State", variant: "postgres", config: { replicas: 2 } } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", label: "begin" },
      { id: "e2", source: "n2", target: "n3", label: "create-order" },
      { id: "e3", source: "n2", target: "n4", label: "charge" },
      { id: "e4", source: "n2", target: "n5", label: "reserve" },
      { id: "e5", source: "n2", target: "n6", label: "ship" },
      { id: "e6", source: "n3", target: "n7", label: "event" },
      { id: "e7", source: "n4", target: "n7", label: "event" },
      { id: "e8", source: "n5", target: "n7", label: "event" },
      { id: "e9", source: "n6", target: "n7", label: "event" },
      { id: "e10", source: "n7", target: "n2", label: "compensate?" },
      { id: "e11", source: "n2", target: "n8", label: "persist" },
    ],
  },
};
```

## Implementation Steps

1. Cho mỗi pattern: research canonical diagram (Martin Fowler patterns site, Microservices.io)
2. Skeleton 5-10 nodes (patterns thường gọn hơn real-world apps)
3. Heavy use of edge labels — patterns thiên về flow hơn là count
4. Append vào `templates/architectural-patterns.ts`
5. Update `ARCHITECTURAL_PATTERNS` export

## Todo List

- [ ] microservices-skeleton
- [ ] event-sourcing-cqrs
- [ ] saga-orchestration
- [ ] strangler-fig
- [ ] backend-for-frontend
- [ ] sidecar-pattern
- [ ] circuit-breaker-bulkhead
- [ ] pubsub-materialized-view
- [ ] api-gateway-mesh
- [ ] hexagonal-architecture
- [ ] `pnpm typecheck` pass
- [ ] Manual QA 3 random patterns

## Success Criteria

- 10 templates in `ARCHITECTURAL_PATTERNS`
- Each shows clear pattern (edge labels matter)
- typecheck pass
- UI filter by "architectural" category works

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Patterns abstract → users không biết khi nào dùng | Description ngắn nêu use case: "Use when you need distributed transaction with rollback" |
| Pattern overlap (BFF vs API Gateway) | OK to overlap — different angles |
| Variants chưa support concept (vd: service-mesh) | Use `worker` + `api` + label "service-mesh"; defer adding service-mesh variant |

## Next Steps

→ Phase 4: 15 industry-specific templates.
