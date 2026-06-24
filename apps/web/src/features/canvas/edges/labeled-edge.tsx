import React, { useState, useCallback } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
  type EdgeTypes,
} from "@xyflow/react";
import { useDiagramStore, type RFEdge } from "../store/diagram-store";

export const LabeledEdge = React.memo(function LabeledEdge(
  props: EdgeProps<RFEdge>
) {
  const { id, sourceX, sourceY, targetX, targetY, data } = props;
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(String(data?.label ?? ""));
  const updateEdge = useDiagramStore((s) => s.updateEdge);

  const commit = useCallback(() => {
    setEditing(false);
    updateEdge(id, { label });
  }, [id, label, updateEdge]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ strokeDasharray: "5 4", stroke: "#94a3b8", strokeWidth: 1.5 }}
        markerEnd="url(#arrow)"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onDoubleClick={() => setEditing(true)}
        >
          {editing ? (
            <input
              autoFocus
              className="text-xs border border-slate-300 rounded px-1 py-0.5 bg-white dark:bg-slate-800 outline-none w-24"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
            />
          ) : (
            label && (
              <span className="text-xs bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer">
                {label}
              </span>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

export const edgeTypes: EdgeTypes = { default: LabeledEdge as EdgeTypes["default"] };
