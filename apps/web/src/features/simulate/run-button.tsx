import React, { useMemo, useState } from "react";
import { Play, Pause, RotateCcw, Skull } from "lucide-react";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { useSimulate } from "./use-simulate";
import { useFailureMode } from "./failure-mode";

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
  const { failureModeActive, toggleFailureMode } = useFailureMode();

  const enabled = useMemo(() => canSimulate(nodes, edges), [nodes, edges]);
  const reason = useMemo(() => disabledReason(nodes, edges), [nodes, edges]);
  const [tipOpen, setTipOpen] = useState(false);

  const handleToggle = () => {
    if (!enabled) {
      setTipOpen((v) => !v);
      return;
    }
    isRunning ? stop() : start();
  };

  return (
    <div className="flex items-center gap-1.5">
      {!isRunning && (
        <button
          onClick={reset}
          title="Reset simulation"
          className="w-8 h-8 inline-flex items-center justify-center rounded-full text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
        >
          <RotateCcw size={13} />
        </button>
      )}

      {/* Failure Mode toggle */}
      <div className="relative group/fail">
        <button
          onClick={toggleFailureMode}
          title="Failure Mode — click nodes to kill them"
          className={[
            "w-8 h-8 inline-flex items-center justify-center rounded-full transition-all duration-150",
            failureModeActive
              ? "bg-red-500 text-white shadow-soft animate-pulse"
              : "text-ink-500 dark:text-cream-200/60 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400",
          ].join(" ")}
        >
          <Skull size={13} />
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap bg-ink-900 text-cream-50 shadow-float opacity-0 group-hover/fail:opacity-100 transition-opacity duration-150 z-50"
        >
          {failureModeActive ? "Exit Failure Mode" : "Failure Mode"}
        </span>
      </div>

      <div className="relative">
        <button
          onClick={handleToggle}
          aria-disabled={!enabled}
          onMouseEnter={() => !enabled && setTipOpen(true)}
          onMouseLeave={() => setTipOpen(false)}
          className={[
            "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-semibold tracking-tight",
            "transition-all duration-150",
            isRunning
              ? "bg-red-500 text-white hover:bg-red-600 shadow-soft"
              : enabled
              ? "bg-plum-900 text-cream-50 hover:bg-plum-700 hover:scale-[1.03] shadow-soft"
              : "bg-plum-900/40 text-cream-50/60 dark:bg-plum-700/30 dark:text-cream-200/40 cursor-not-allowed grayscale-[0.4]",
          ].join(" ")}
        >
          {isRunning ? (
            <>
              <Pause size={13} className="animate-pulse" />
              Stop
            </>
          ) : (
            <>
              <Play size={13} />
              Run
            </>
          )}
        </button>

        {!enabled && tipOpen && reason && (
          <div
            role="tooltip"
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap bg-ink-900 text-cream-50 shadow-float pointer-events-none animate-slide-in-right"
          >
            {reason}
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-ink-900"
            />
          </div>
        )}
      </div>
    </div>
  );
});
