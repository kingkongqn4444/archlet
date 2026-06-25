import React, { useState, useCallback } from "react";
import { Handle, Position, NodeToolbar } from "@xyflow/react";
import { Copy, Trash2, Settings } from "lucide-react";
import { useDiagramStore, type RFNode } from "../store/diagram-store";
import { useSimStore } from "@/features/simulate/sim-store";
import { useReviewStore } from "@/features/review/review-store";
import type { DiagramNode, NodeType, CloudProvider } from "@archlet/shared";
import { getVariant, getDefaultVariant, CLOUD_ICON_SLUGS, getCloudService } from "@archlet/shared";
import { usePropertiesPanel } from "../properties/use-properties-panel";
import { useNodeHealth } from "../health/use-health";

export type BaseNodeProps = {
  id: string;
  data: RFNode["data"];
  selected?: boolean;
  icon: React.ReactNode;
  /** pastel circle bg + icon text color, e.g. "bg-plum-100 text-plum-600" */
  accentClass: string;
};

function VariantBadge({ type, variantId, cloudProvider }: { type: NodeType; variantId?: string; cloudProvider?: CloudProvider }) {
  // Fallback chain: cloud-services catalog (e.g. "aws-sagemaker") → typed variant → default
  const cloudService = variantId ? getCloudService(variantId) : undefined;
  const resolvedId = variantId ?? getDefaultVariant(type).id;
  const variant = getVariant(type, resolvedId) ?? getDefaultVariant(type);

  // If this is a cloud-services catalog entry, use its metadata; else typed variant.
  const displayLabel = cloudService?.name ?? variant.label;
  const cloud = cloudProvider ?? "self-hosted";
  const iconSlug = cloudService?.iconSlug
    ?? (cloud !== "self-hosted"
        ? (variant.cloudIconSlug?.[cloud] ?? CLOUD_ICON_SLUGS[cloud])
        : variant.iconSlug);

  return (
    <span className="text-[11px] font-medium tracking-tight text-ink-500 dark:text-cream-200/60 inline-flex items-center gap-1 mt-0.5">
      {iconSlug && (
        <img
          src={`https://cdn.simpleicons.org/${iconSlug}/6b7280`}
          alt=""
          width={11}
          height={11}
          className="dark:hidden shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      {iconSlug && (
        <img
          src={`https://cdn.simpleicons.org/${iconSlug}/a1a1aa`}
          alt=""
          width={11}
          height={11}
          className="hidden dark:inline shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      {displayLabel}
    </span>
  );
}

function utilTone(util: number): { ring: string; bg: string; dot: string; text: string; pulse: boolean } {
  if (util > 0.8) return {
    ring: "ring-red-500/30", bg: "bg-red-500/15", dot: "bg-red-500", text: "text-red-700 dark:text-red-300", pulse: true,
  };
  if (util > 0.5) return {
    ring: "ring-amber-500/30", bg: "bg-amber-500/15", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-300", pulse: false,
  };
  return {
    ring: "ring-emerald-500/30", bg: "bg-emerald-500/15", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", pulse: false,
  };
}

function UtilChip({ nodeId }: { nodeId: string }) {
  const metric = useSimStore((s) => s.nodeMetrics[nodeId]);
  const isRunning = useSimStore((s) => s.isRunning);
  if (!metric && !isRunning) return null;
  const util = metric?.util ?? 0;
  if (util === 0 && !isRunning) return null;
  const tone = utilTone(util);
  const pct = `${Math.round(util * 100)}%`;
  return (
    <div
      className={[
        "absolute -top-2 -right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full",
        "text-[10px] font-bold tracking-tight ring-1",
        "bg-white dark:bg-plum-900 shadow-soft",
        tone.bg, tone.ring, tone.text,
      ].join(" ")}
      aria-label={`utilization ${pct}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot} ${tone.pulse ? "animate-pulse" : ""}`} />
      {pct}
    </div>
  );
}

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
  const { open } = usePropertiesPanel();

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
        variant: src.data.variant as string | undefined,
        config: src.data.config as Record<string, unknown> | undefined,
      },
    };
    addNode(node);
  }, [id, nodes, addNode]);

  const highlightedNodeIds = useReviewStore((s) => s.highlightedNodeIds);
  const isReviewHighlighted = highlightedNodeIds.has(id);
  const health = useNodeHealth(id);

  const ringClass = isReviewHighlighted
    ? "ring-2 ring-red-500/70 ring-offset-2 ring-offset-cream-50 dark:ring-offset-plum-950"
    : selected
    ? "ring-2 ring-plum-500/80 ring-offset-2 ring-offset-cream-50 dark:ring-offset-plum-950 archlet-selected-pulse animate-glow-once"
    : "hover:-translate-y-0.5 hover:shadow-float";

  const healthBorderClass =
    health === "critical"
      ? "border-red-500 archlet-node-pulse-critical"
      : health === "warning"
      ? "border-amber-500"
      : health === "healthy"
      ? "border-emerald-500"
      : "border-cream-200 dark:border-plum-700/40";

  const nodeType = nodes.find((n) => n.id === id)?.type as NodeType | undefined;
  const isUser = nodeType === "user";

  return (
    <>
      <NodeToolbar isVisible={selected ?? false} position={Position.Top}>
        <div className="flex gap-0.5 bg-white dark:bg-plum-900 border border-cream-200 dark:border-plum-700/40 rounded-full p-1 shadow-card">
          <button
            onClick={() => open(id)}
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
          "relative min-w-[180px] min-h-[56px] rounded-2xl bg-white dark:bg-plum-900/85 backdrop-blur",
          "border shadow-card",
          "transition-all duration-300",
          healthBorderClass,
          ringClass,
        ].join(" ")}
      >
        {!isUser && <UtilChip nodeId={id} />}
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
                className="text-[14px] font-semibold tracking-tight bg-transparent border-b border-plum-300 outline-none w-full text-ink-900 dark:text-cream-50"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={commitLabel}
                onKeyDown={(e) => e.key === "Enter" && commitLabel()}
              />
            ) : (
              <span
                className="text-[14px] font-semibold tracking-tight truncate cursor-text text-ink-900 dark:text-cream-50"
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
            {nodeType && (() => {
              const vid = data.variant as string | undefined;
              const cfg = data.config as { cloudProvider?: CloudProvider } | undefined;
              const cloud = cfg?.cloudProvider;
              const badgeProps: { type: NodeType; variantId?: string; cloudProvider?: CloudProvider } = { type: nodeType };
              if (vid !== undefined) badgeProps.variantId = vid;
              if (cloud !== undefined) badgeProps.cloudProvider = cloud;
              return <VariantBadge {...badgeProps} />;
            })()}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </>
  );
});
