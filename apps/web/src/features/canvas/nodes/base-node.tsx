import React, { useState, useCallback } from "react";
import { Handle, Position, NodeToolbar } from "@xyflow/react";
import { Copy, Trash2, Settings } from "lucide-react";
import { useDiagramStore, type RFNode } from "../store/diagram-store";
import type { DiagramNode } from "@archlet/shared";

export type BaseNodeProps = {
  id: string;
  data: RFNode["data"];
  selected?: boolean;
  icon: React.ReactNode;
  /** pastel circle bg + icon text color, e.g. "bg-plum-100 text-plum-600" */
  accentClass: string;
};

export const BaseNode = React.memo(function BaseNode({
  id,
  data,
  selected,
  icon,
  accentClass,
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

  const ringClass = selected
    ? "ring-2 ring-plum-500 ring-offset-2 ring-offset-cream-50 dark:ring-offset-plum-950"
    : "hover:-translate-y-0.5 hover:shadow-float";

  return (
    <>
      <NodeToolbar isVisible={selected ?? false} position={Position.Top}>
        <div className="flex gap-0.5 bg-white dark:bg-plum-900 border border-cream-200 dark:border-plum-700/40 rounded-full p-1 shadow-card">
          <button
            className="p-1.5 rounded-full text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800 transition"
            title="Configure"
          >
            <Settings size={13} />
          </button>
          <button
            onClick={duplicate}
            className="p-1.5 rounded-full text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800 transition"
            title="Duplicate"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => deleteNode(id)}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </NodeToolbar>

      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />

      <div
        className={[
          "min-w-[180px] min-h-[56px] rounded-2xl bg-white dark:bg-plum-900/85 backdrop-blur",
          "border border-cream-200 dark:border-plum-700/40 shadow-card",
          "transition-all duration-150",
          ringClass,
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <span
            className={[
              "inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0",
              accentClass,
            ].join(" ")}
          >
            {icon}
          </span>
          <div className="flex flex-col min-w-0 flex-1">
            {editing ? (
              <input
                autoFocus
                className="text-[13px] font-semibold bg-transparent border-b border-plum-300 outline-none w-full text-ink-900 dark:text-cream-50"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={commitLabel}
                onKeyDown={(e) => e.key === "Enter" && commitLabel()}
              />
            ) : (
              <span
                className="text-[13px] font-semibold tracking-tight truncate cursor-text text-ink-900 dark:text-cream-50"
                onDoubleClick={() => setEditing(true)}
              >
                {String(data.label ?? "")}
              </span>
            )}
            {data.description != null && String(data.description).length > 0 && (
              <span className="text-[11px] leading-snug text-ink-500 dark:text-cream-200/60 truncate">
                {String(data.description)}
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </>
  );
});
