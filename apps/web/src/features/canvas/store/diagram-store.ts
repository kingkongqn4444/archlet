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

export type RFNode = Node<DiagramNode["data"] & Record<string, unknown>, DiagramNode["type"]>;
export type RFEdge = Edge<{ label?: string } & Record<string, unknown>>;

type LevelData = { nodes: RFNode[]; edges: RFEdge[] };

type DiagramState = {
  nodes: RFNode[];
  edges: RFEdge[];
  activeLevel: Level;
  levels: { high: LevelData; mid: LevelData; low: LevelData };
};

type DiagramActions = {
  addNode: (node: DiagramNode) => void;
  updateNode: (id: string, data: Partial<DiagramNode["data"]>) => void;
  deleteNode: (id: string) => void;
  updateEdge: (id: string, data: { label?: string }) => void;
  deleteEdge: (id: string) => void;
  setLevel: (level: Level) => void;
  loadDiagram: (diagram: Diagram) => void;
  getDiagram: () => Diagram;
  onNodesChange: (changes: NodeChange<RFNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<RFEdge>[]) => void;
  onConnect: (connection: Connection) => void;
};

type DiagramStore = DiagramState & DiagramActions;

const emptyLevel = (): LevelData => ({ nodes: [], edges: [] });

function toRFNode(n: DiagramNode): RFNode {
  return { ...n, data: { ...n.data } } as RFNode;
}

function fromRFNode(n: RFNode): DiagramNode {
  return {
    id: n.id,
    type: n.type as DiagramNode["type"],
    position: n.position,
    data: { label: n.data.label as string, description: n.data.description as string | undefined },
  };
}

export const useDiagramStore = create<DiagramStore>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      activeLevel: "high" as Level,
      levels: { high: emptyLevel(), mid: emptyLevel(), low: emptyLevel() },

      addNode: (node) =>
        set((s) => ({ nodes: [...s.nodes, toRFNode(node)] })),

      updateNode: (id, data) =>
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n
          ),
        })),

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
          id: "local",
          name: "Untitled diagram",
          activeLevel: s.activeLevel,
          levels: {
            high: toLevel(levels.high),
            mid: toLevel(levels.mid),
            low: toLevel(levels.low),
          },
        };
      },

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
