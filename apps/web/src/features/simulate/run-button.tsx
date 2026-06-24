import React, { useMemo, useState, useEffect } from "react";
import { Play, Pause, RotateCcw, ArrowLeft, Link as LinkIcon } from "lucide-react";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { useSimulate } from "./use-simulate";

function canSimulate(nodes: ReturnType<typeof useDiagramStore.getState>["nodes"], edges: ReturnType<typeof useDiagramStore.getState>["edges"]): boolean {
  const userNodes = nodes.filter((n) => n.type === "user");
  if (userNodes.length === 0) return false;
  return userNodes.some((u) => edges.some((e) => e.source === u.id));
}

function disabledReason(nodes: ReturnType<typeof useDiagramStore.getState>["nodes"], edges: ReturnType<typeof useDiagramStore.getState>["edges"]): string {
  if (nodes.length === 0) return "Drop nodes onto canvas first";
  const userNodes = nodes.filter((n) => n.type === "user");
  if (userNodes.length === 0) return "Add a User node to start";
  const connected = userNodes.some((u) => edges.some((e) => e.source === u.id));
  if (!connected) return "Connect User → a service";
  return "";
}

export const RunButton = React.memo(function RunButton() {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const { isRunning, start, stop, reset } = useSimulate();

  const enabled = useMemo(() => canSimulate(nodes, edges), [nodes, edges]);
  const reason = useMemo(() => disabledReason(nodes, edges), [nodes, edges]);
  const [tipOpen, setTipOpen] = useState(false);
  const [chipDismissed, setChipDismissed] = useState(false);

  // Re-show chip whenever the reason changes (e.g. user adds nodes)
  useEffect(() => {
    setChipDismissed(false);
  }, [reason]);

  const handleToggle = () => {
    if (!enabled) {
      setTipOpen((v) => !v);
      return;
    }
    isRunning ? stop() : start();
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Reset — visible when stopped */}
      {!isRunning && (
        <button
          onClick={reset}
          title="Reset simulation"
          className="w-8 h-8 inline-flex items-center justify-center rounded-full text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
        >
          <RotateCcw size={13} />
        </button>
      )}

      {/* Run / Stop pill */}
      <div className="relative">
        <button
          onClick={handleToggle}
          aria-disabled={!enabled}
          onMouseEnter={() => !enabled && setTipOpen(true)}
          onMouseLeave={() => setTipOpen(false)}
          className={[
            "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold tracking-tight transition-all duration-150 relative overflow-hidden",
            isRunning
              ? "bg-red-500 text-white hover:bg-red-600 shadow-soft"
              : enabled
              ? "bg-plum-900 text-cream-50 hover:bg-plum-700 hover:scale-[1.03] shadow-soft"
              : "border border-dashed border-plum-300 dark:border-plum-700/60 text-ink-500/70 dark:text-cream-200/40 bg-cream-100/60 dark:bg-plum-900/30 cursor-not-allowed",
          ].join(" ")}
        >
          {/* Diagonal stripes for disabled state */}
          {!enabled && !isRunning && (
            <span
              aria-hidden="true"
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(45deg, transparent 0 6px, rgba(108,43,217,0.08) 6px 7px)",
              }}
            />
          )}
          {isRunning ? (
            <>
              <Pause size={13} className="animate-pulse" />
              Stop
            </>
          ) : (
            <>
              <Play size={13} className={enabled ? "" : "opacity-60"} />
              <span className={enabled ? "" : "line-through decoration-1 decoration-ink-500/50"}>Run</span>
            </>
          )}
        </button>

        {/* Custom tooltip — popover above */}
        {!enabled && tipOpen && reason && (
          <div
            role="tooltip"
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap bg-ink-900 text-cream-50 shadow-float pointer-events-none"
          >
            {reason}
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-ink-900"
            />
          </div>
        )}
      </div>

      {/* Inline amber chip hint — visible when disabled and not dismissed */}
      {!enabled && !chipDismissed && reason && (
        <button
          onClick={() => setChipDismissed(true)}
          title="Dismiss hint"
          className="hidden md:inline-flex items-center gap-1 h-7 pl-2 pr-2.5 rounded-full bg-amber-300/90 text-amber-700 text-[11px] font-semibold tracking-tight border border-amber-400 shadow-soft hover:bg-amber-400 transition group"
        >
          <ArrowLeft size={11} className="text-amber-700 group-hover:-translate-x-0.5 transition" />
          <LinkIcon size={10} />
          {reason}
        </button>
      )}
    </div>
  );
});
