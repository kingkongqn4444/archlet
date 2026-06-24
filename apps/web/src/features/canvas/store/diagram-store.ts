import { create } from "zustand";
import { temporal } from "zundo";
import { useStore } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { DiagramNode, DiagramEdge, Level, Diagram } from "@archlet/shared";
import { getDefaultVariant, parseVariantConfig } from "@archlet/shared";

export type RFNode = Node<DiagramNode["data"] & Record<string, unknown>, DiagramNode["type"]>;
export type RFEdge = Edge<{ label?: string } & Record<string, unknown>>;

type LevelData = { nodes: RFNode[]; edges: RFEdge[] };

type DiagramState = {
  id: string;
  name: string;
  nodes: RFNode[];
  edges: RFEdge[];
  activeLevel: Level;
  levels: { high: LevelData; mid: LevelData; low: LevelData };
};

type DiagramActions = {
  setName: (name: string) => void;
  addNode: (node: DiagramNode) => void;
  updateNode: (id: string, data: Partial<DiagramNode["data"]>) => void;
  updateNodeConfig: (id: string, config: Record<string, unknown>) => void;
  updateNodeVariant: (id: string, variantId: string) => void;
  deleteNode: (id: string) => void;
  updateEdge: (id: string, data: { label?: string }) => void;
  deleteEdge: (id: string) => void;
  setLevel: (level: Level) => void;
  loadDiagram: (diagram: Diagram) => void;
  getDiagram: () => Diagram;
  applyLayout: (positions: Map<string, { x: number; y: number }>) => void;
  onNodesChange: (changes: NodeChange<RFNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<RFEdge>[]) => void;
  onConnect: (connection: Connection) => void;
};

type DiagramStore = DiagramState & DiagramActions;

const emptyLevel = (): LevelData => ({ nodes: [], edges: [] });

function toRFNode(n: DiagramNode): RFNode {
  const type = n.type as DiagramNode["type"];
  const variantId = n.data.variant ?? getDefaultVariant(type).id;
  const config = n.data.config ?? parseVariantConfig(type, variantId, {});
  return { ...n, data: { ...n.data, variant: variantId, config } } as RFNode;
}

function fromRFNode(n: RFNode): DiagramNode {
  return {
    id: n.id,
    type: n.type as DiagramNode["type"],
    position: n.position,
    data: {
      label: n.data.label as string,
      description: n.data.description != null ? String(n.data.description) : undefined,
      variant: n.data.variant as string | undefined,
      config: n.data.config as Record<string, unknown> | undefined,
    },
  };
}

export const useDiagramStore = create<DiagramStore>()(
  temporal(
    (set, get) => ({
      id: "",
      name: "Untitled diagram",
      nodes: [],
      edges: [],
      activeLevel: "high" as Level,
      levels: { high: emptyLevel(), mid: emptyLevel(), low: emptyLevel() },

      setName: (name) => set({ name }),

      addNode: (node) => {
        const variantId = node.data.variant ?? getDefaultVariant(node.type).id;
        const config = node.data.config ?? parseVariantConfig(node.type, variantId, {});
        const withDefaults: DiagramNode = { ...node, data: { ...node.data, variant: variantId, config } };
        set((s) => ({ nodes: [...s.nodes, toRFNode(withDefaults)] }));
      },

      updateNode: (id, data) =>
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n
          ),
        })),

      updateNodeConfig: (id, config) =>
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, config } } : n
          ),
        })),

      updateNodeVariant: (id, variantId) =>
        set((s) => {
          const node = s.nodes.find((n) => n.id === id);
          if (!node) return {};
          const type = node.type as DiagramNode["type"];
          const config = parseVariantConfig(type, variantId, {});
          return {
            nodes: s.nodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, variant: variantId, config } } : n
            ),
          };
        }),

      deleteNode: (id) =>
        set((s) => ({
          nodes: s.nodes.filter((n) => n.id !== id),
          edges: s.edges.filter((e) => e.source !== id && e.target !== id),
        })),

      updateEdge: (id, data) =>
        set((s) => ({
          edges: s.edges.map((e) =>
            e.id === id ? { ...e, data: { ...e.data, ...data } } : e
          ),
        })),

      deleteEdge: (id) =>
        set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),

      setLevel: (level) =>
        set((s) => {
          const saved: LevelData = { nodes: s.nodes, edges: s.edges };
          const next = s.levels[level];
          return {
            activeLevel: level,
            levels: { ...s.levels, [s.activeLevel]: saved },
            nodes: next.nodes,
            edges: next.edges,
          };
        }),

      loadDiagram: (diagram) => {
        const toLevel = (d: { nodes: DiagramNode[]; edges: DiagramEdge[] }): LevelData => ({
          nodes: d.nodes.map(toRFNode),
          edges: d.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            data: { label: e.data?.label ?? "" },
          })),
        });
        const levels = {
          high: toLevel(diagram.levels.high),
          mid: toLevel(diagram.levels.mid),
          low: toLevel(diagram.levels.low),
        };
        set({
          id: diagram.id,
          name: diagram.name,
          activeLevel: diagram.activeLevel,
          levels,
          nodes: levels[diagram.activeLevel].nodes,
          edges: levels[diagram.activeLevel].edges,
        });
      },

      getDiagram: (): Diagram => {
        const s = get();
        const snapshot = { nodes: s.nodes, edges: s.edges };
        const levels = { ...s.levels, [s.activeLevel]: snapshot };
        const toLevel = (d: LevelData) => ({
          nodes: d.nodes.map(fromRFNode),
          edges: d.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            data: { label: e.data?.label as string | undefined },
          })),
        });
        return {
          id: s.id,
          name: s.name,
          activeLevel: s.activeLevel,
          levels: {
            high: toLevel(levels.high),
            mid: toLevel(levels.mid),
            low: toLevel(levels.low),
          },
        };
      },

      applyLayout: (positions) =>
        set((s) => ({
          nodes: s.nodes.map((n) => {
            const pos = positions.get(n.id);
            return pos ? { ...n, position: pos } : n;
          }),
        })),

      onNodesChange: (changes) =>
        set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

      onEdgesChange: (changes) =>
        set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

      onConnect: (connection) =>
        set((s) => ({
          edges: addEdge(
            {
              ...connection,
              id: `e-${connection.source}-${connection.target}-${Date.now()}`,
              data: { label: "" },
            },
            s.edges
          ),
        })),
    }),
    { limit: 50 }
  )
);

export function useTemporalDiagram() {
  return useStore(useDiagramStore.temporal);
}

