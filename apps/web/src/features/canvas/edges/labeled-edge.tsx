import React, { useState, useCallback } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
  type EdgeTypes,
} from "@xyflow/react";
import { useDiagramStore, type RFEdge } from "../store/diagram-store";

export const LabeledEdge = React.memo(function LabeledEdge(
  props: EdgeProps<RFEdge>
) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.35,
  });
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(String(data?.label ?? ""));
  const updateEdge = useDiagramStore((s) => s.updateEdge);

  const commit = useCallback(() => {
    setEditing(false);
    updateEdge(id, { label });
  }, [id, label, updateEdge]);

  // Amber by default, plum when selected
  const stroke = selected ? "#6C2BD9" : "#F59E0B";

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ stroke, strokeWidth: 2 }}
        className="archlet-edge-flow"
        markerEnd={selected ? "url(#archlet-arrow-plum)" : "url(#archlet-arrow-amber)"}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan group"
          onDoubleClick={() => setEditing(true)}
        >
          {editing ? (
            <input
              autoFocus
              className="text-[11px] border border-plum-300 rounded-full px-2 py-0.5 bg-white dark:bg-plum-900 outline-none w-24 focus:ring-2 focus:ring-plum-500 text-ink-900 dark:text-cream-50"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
            />
          ) : label ? (
            <span className="text-[11px] font-medium bg-white dark:bg-plum-900/95 px-2 py-0.5 rounded-full border border-cream-200 dark:border-plum-700/50 text-ink-700 dark:text-cream-100 shadow-soft cursor-pointer">
              {label}
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-white/90 dark:bg-plum-900/90 px-2 py-0.5 rounded-full border border-dashed border-plum-300 text-ink-500 cursor-pointer">
              + label
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

export const edgeTypes: EdgeTypes = { default: LabeledEdge as EdgeTypes["default"] };
