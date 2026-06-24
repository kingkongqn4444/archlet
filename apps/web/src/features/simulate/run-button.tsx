import React, { useMemo } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { useSimulate } from "./use-simulate";

function canSimulate(nodes: ReturnType<typeof useDiagramStore.getState>["nodes"], edges: ReturnType<typeof useDiagramStore.getState>["edges"]): boolean {
  const userNodes = nodes.filter((n) => n.type === "user");
  if (userNodes.length === 0) return false;
  return userNodes.some((u) => edges.some((e) => e.source === u.id));
}

export const RunButton = React.memo(function RunButton() {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const { isRunning, start, stop, reset } = useSimulate();

  const enabled = useMemo(() => canSimulate(nodes, edges), [nodes, edges]);

  const tooltip = enabled
    ? undefined
    : "Add a User node and connect it to start simulating";

  const handleToggle = () => {
    if (!enabled) return;
    isRunning ? stop() : start();
  };

  return (
    <div className="flex items-center gap-1">
      {/* Reset button — visible when stopped */}
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
      <button
        onClick={handleToggle}
        disabled={!enabled}
        title={tooltip}
        className={[
          "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold tracking-tight transition-all duration-150",
          isRunning
            ? "bg-red-500 text-white hover:bg-red-600 shadow-soft"
            : enabled
            ? "bg-plum-900 text-cream-50 hover:bg-plum-700 hover:scale-[1.03] shadow-soft"
            : "bg-plum-900/40 text-cream-50/40 cursor-not-allowed",
        ].join(" ")}
      >
        {isRunning ? (
          <>
            <Pause size={13} className={isRunning ? "animate-pulse" : ""} />
            Stop
          </>
        ) : (
          <>
            <Play size={13} />
            Run
          </>
        )}
      </button>
    </div>
  );
});
