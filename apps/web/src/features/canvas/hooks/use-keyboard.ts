import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useDiagramStore, useTemporalDiagram } from "../store/diagram-store";
import { autoLayout } from "../layout/auto-layout";

export function useKeyboard() {
  const { getNodes, getEdges, fitView } = useReactFlow();
  const deleteNode = useDiagramStore((s) => s.deleteNode);
  const deleteEdge = useDiagramStore((s) => s.deleteEdge);
  const applyLayout = useDiagramStore((s) => s.applyLayout);
  const { undo, redo } = useTemporalDiagram();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Cmd+Shift+L — auto-arrange
      if (mod && e.shiftKey && (e.key === "l" || e.key === "L")) {
        e.preventDefault();
        const nodes = getNodes();
        const edges = getEdges();
        if (nodes.length > 0) {
          const positions = autoLayout(nodes, edges, "LR");
          applyLayout(positions);
          setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 50);
        }
        return;
      }

      if (mod && e.shiftKey && e.key === "z") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        getNodes().filter((n) => n.selected).forEach((n) => deleteNode(n.id));
        getEdges().filter((ed) => ed.selected).forEach((ed) => deleteEdge(ed.id));
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [getNodes, getEdges, deleteNode, deleteEdge, applyLayout, fitView, undo, redo]);
}
