import React from "react";
import { useSimStore } from "./sim-store";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";

/**
 * Computes cascading impact from dead nodes based on current sim metrics.
 * Returns stranded / starved node IDs and SPOF flag.
 */
function useFailureImpact() {
  const deadNodes = useSimStore((s) => s.deadNodes);
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);

  if (deadNodes.size === 0) {
    return { stranded: new Set<string>(), killed: 0, impactPct: 0, isSPOF: false };
  }

  // Build inbound edges per node
  const inbound = new Map<string, string[]>();
  for (const node of nodes) inbound.set(node.id, []);
  for (const edge of edges) {
    const arr = inbound.get(edge.target) ?? [];
    arr.push(edge.source);
    inbound.set(edge.target, arr);
  }

  const stranded = new Set<string>();
  for (const node of nodes) {
    if (deadNodes.has(node.id)) continue;
    const sources = inbound.get(node.id) ?? [];
    if (sources.length === 0) continue;
    // Stranded if ALL inbound sources are dead (no live traffic path)
    const allDead = sources.every((src) => deadNodes.has(src));
    if (allDead) {
      const metric = nodeMetrics[node.id];
      const rate = metric?.arrivalRate ?? 0;
      if (rate === 0) stranded.add(node.id);
    }
  }

  const totalNodes = nodes.length;
  const impacted = stranded.size + deadNodes.size;
  const impactPct = totalNodes > 0 ? Math.round((impacted / totalNodes) * 100) : 0;
  const isSPOF = deadNodes.size === 1 && stranded.size >= Math.ceil(totalNodes * 0.5);

  return { stranded, killed: deadNodes.size, impactPct, isSPOF };
}

export const FailureReport = React.memo(function FailureReport() {
  const failureModeActive = useSimStore((s) => s.failureModeActive);
  const deadNodes = useSimStore((s) => s.deadNodes);
  const isRunning = useSimStore((s) => s.isRunning);
  const nodes = useDiagramStore((s) => s.nodes);
  const { stranded, killed, impactPct, isSPOF } = useFailureImpact();

  if (!failureModeActive && killed === 0) return null;

  const deadLabels = [...deadNodes].map((id) => {
    const n = nodes.find((x) => x.id === id);
    return (n?.data.label as string) ?? id;
  });

  const strandedLabels = [...stranded].map((id) => {
    const n = nodes.find((x) => x.id === id);
    return (n?.data.label as string) ?? id;
  });

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute top-20 right-4 z-30 w-64 rounded-2xl shadow-float border border-red-200 dark:border-red-900/50 bg-white/95 dark:bg-plum-900/95 backdrop-blur-md p-3 flex flex-col gap-2 text-[12px]"
    >
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none" aria-hidden="true">💥</span>
        <span className="font-bold text-red-600 dark:text-red-400 tracking-tight">
          Failure Simulation
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold text-[11px]">
          {killed} killed
        </span>
        {isRunning && stranded.size > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
            {stranded.size} stranded
          </span>
        )}
        {isRunning && impactPct > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-100 dark:bg-plum-800/60 text-ink-600 dark:text-cream-200/70 font-semibold text-[11px]">
            {impactPct}% impacted
          </span>
        )}
      </div>

      {/* SPOF warning */}
      {isSPOF && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50">
          <span aria-hidden="true">⚠️</span>
          <span className="text-red-700 dark:text-red-300 font-semibold text-[11px]">
            SPOF detected — one node brings down ≥50%
          </span>
        </div>
      )}

      {/* Killed nodes */}
      {deadLabels.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400 dark:text-cream-200/40 mb-1">
            Killed
          </div>
          <ul className="flex flex-col gap-0.5">
            {deadLabels.map((label) => (
              <li key={label} className="flex items-center gap-1.5 text-ink-700 dark:text-cream-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stranded nodes */}
      {isRunning && strandedLabels.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400 dark:text-cream-200/40 mb-1">
            Stranded
          </div>
          <ul className="flex flex-col gap-0.5">
            {strandedLabels.map((label) => (
              <li key={label} className="flex items-center gap-1.5 text-ink-700 dark:text-cream-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hint */}
      {!isRunning && (
        <p className="text-[10.5px] text-ink-400 dark:text-cream-200/40 italic leading-snug">
          Run simulation to see cascading impact.
        </p>
      )}
    </div>
  );
});
