import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useDiagramStore, useTemporalDiagram } from "../store/diagram-store";

export function useKeyboard() {
  const { getNodes, getEdges } = useReactFlow();
  const deleteNode = useDiagramStore((s) => s.deleteNode);
  const deleteEdge = useDiagramStore((s) => s.deleteEdge);
  const { undo, redo } = useTemporalDiagram();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

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
  }, [getNodes, getEdges, deleteNode, deleteEdge, undo, redo]);
}
