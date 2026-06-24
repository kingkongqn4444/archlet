import dagre from "@dagrejs/dagre";

type NodePosition = { x: number; y: number };

interface LayoutNode {
  id: string;
  width?: number;
  height?: number;
}

interface LayoutEdge {
  source: string;
  target: string;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const RANK_SEP = 100;
const NODE_SEP = 50;

/**
 * Pure layout function. Returns a map of node id → new center position.
 * Caller is responsible for applying positions to the store.
 */
export function autoLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  direction: "LR" | "TB" = "LR"
): Map<string, NodePosition> {
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: direction,
    ranksep: RANK_SEP,
    nodesep: NODE_SEP,
    marginx: 40,
    marginy: 40,
  });

  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, {
      width: node.width ?? NODE_WIDTH,
      height: node.height ?? NODE_HEIGHT,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const positions = new Map<string, NodePosition>();
  for (const node of nodes) {
    const n = g.node(node.id);
    if (n) {
      // dagre returns center coords; React Flow uses top-left corner
      positions.set(node.id, {
        x: n.x - (node.width ?? NODE_WIDTH) / 2,
        y: n.y - (node.height ?? NODE_HEIGHT) / 2,
      });
    }
  }

  return positions;
}
