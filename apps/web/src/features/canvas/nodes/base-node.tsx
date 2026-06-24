import React, { useState, useCallback } from "react";
import { Handle, Position, NodeToolbar } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Copy, Trash2, Settings } from "lucide-react";
import { useDiagramStore, type RFNode } from "../store/diagram-store";
import type { DiagramNode } from "@archlet/shared";

export type BaseNodeProps = {
  id: string;
  data: RFNode["data"];
  selected?: boolean;
  icon: React.ReactNode;
  colorClass: string;
};

export const BaseNode = React.memo(function BaseNode({
  id,
  data,
  selected,
  icon,
  colorClass,
}: BaseNodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(String(data.label ?? ""));
  const updateNode = useDiagramStore((s) => s.updateNode);
  const deleteNode = useDiagramStore((s) => s.deleteNode);
  const addNode = useDiagramStore((s) => s.addNode);
  const nodes = useDiagramStore((s) => s.nodes);

  const commitLabel = useCallback(() => {
    setEditing(false);
    updateNode(id, { label });
  }, [id, label, updateNode]);

  const duplicate = useCallback(() => {
    const src = nodes.find((n) => n.id === id);
    if (!src) return;
    const node: DiagramNode = {
      id: `${src.type}-${Date.now()}`,
      type: src.type as DiagramNode["type"],
      position: { x: src.position.x + 40, y: src.position.y + 40 },
      data: {
        label: String(src.data.label ?? ""),
        description: src.data.description != null ? String(src.data.description) : undefined,
      },
    };
    addNode(node);
  }, [id, nodes, addNode]);

  return (
    <>
      <NodeToolbar isVisible={selected ?? false} position={Position.Top}>
        <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-md">
          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Configure">
            <Settings size={13} />
          </button>
          <button onClick={duplicate} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Duplicate">
            <Copy size={13} />
          </button>
          <button onClick={() => deleteNode(id)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </NodeToolbar>

      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />

      <Card className={`w-40 rounded-2xl shadow border ${colorClass} bg-white dark:bg-slate-800`}>
        <CardHeader className="p-2 pb-1 flex flex-row items-center gap-2">
          <span className="text-slate-600 dark:text-slate-300">{icon}</span>
          {editing ? (
            <input
              autoFocus
              className="text-sm font-semibold bg-transparent border-b border-slate-400 outline-none w-full"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => e.key === "Enter" && commitLabel()}
            />
          ) : (
            <span
              className="text-sm font-semibold truncate cursor-text"
              onDoubleClick={() => setEditing(true)}
            >
              {String(data.label ?? "")}
            </span>
          )}
        </CardHeader>
        {data.description != null && (
          <CardContent className="px-2 pb-2 pt-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">{String(data.description)}</p>
          </CardContent>
        )}
      </Card>

      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </>
  );
});
