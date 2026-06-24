import type { ToolCall } from "./providers/ai-client";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import type { DiagramNode } from "@archlet/shared";

export function applyToolCall(call: ToolCall): void {
  const store = useDiagramStore.getState();

  switch (call.name) {
    case "add_node": {
      const { id, type, label, description, x, y } = call.args;
      const node: DiagramNode = {
        id,
        type,
        position: { x, y },
        data: description ? { label, description } : { label },
      };
      store.addNode(node);
      break;
    }
    case "add_edge": {
      const { id, source, target, label } = call.args;
      const alreadyExists = store.edges.some((e) => e.id === id);
      if (!alreadyExists) {
        useDiagramStore.setState((s) => ({
          edges: [
            ...s.edges,
            { id, source, target, data: { label: label ?? "" } },
          ],
        }));
      }
      break;
    }
    case "update_node": {
      const { id, label, description } = call.args;
      const patch: { label?: string; description?: string } = {};
      if (label !== undefined) patch.label = label;
      if (description !== undefined) patch.description = description;
      store.updateNode(id, patch);
      break;
    }
    case "remove_node": {
      store.deleteNode(call.args.id);
      break;
    }
    case "remove_edge": {
      store.deleteEdge(call.args.id);
      break;
    }
  }
}
