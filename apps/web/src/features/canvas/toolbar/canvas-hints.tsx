import React, { useEffect, useState } from "react";
import { ArrowLeft, MousePointer2, Activity } from "lucide-react";
import { useDiagramStore } from "../store/diagram-store";
import { useSimStore } from "@/features/simulate/sim-store";

/** Empty-canvas hero — animated arrow pointing at the left side-palette. */
function EmptyHero() {
  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-3 text-center px-6 py-6 rounded-2xl bg-white/70 dark:bg-plum-900/50 border border-dashed border-cream-200 dark:border-plum-700/40 backdrop-blur-sm shadow-soft max-w-[360px]">
        <div className="w-12 h-12 rounded-2xl bg-plum-50 dark:bg-plum-800/60 inline-flex items-center justify-center text-plum-500 dark:text-plum-200">
          <MousePointer2 size={22} strokeWidth={1.75} />
        </div>
        <div>
          <div className="text-[14px] font-semibold tracking-tight text-ink-900 dark:text-cream-50">
            Drag your first service from the palette
          </div>
          <div className="text-[12px] text-ink-500 dark:text-cream-200/70 mt-1 leading-snug">
            Start with a <span className="font-semibold text-rose-600 dark:text-rose-300">User</span>, then connect it to an <span className="font-semibold text-plum-600 dark:text-plum-200">API</span> to simulate traffic.
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 animate-pulse">
          <ArrowLeft size={14} />
          From the left palette
        </div>
      </div>
    </div>
  );
}

/** Floating hint near a disconnected User node. */
function DisconnectedUserHint() {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  // Find first disconnected user node
  const target = nodes.find(
    (n) => n.type === "user" && !edges.some((e) => e.source === n.id)
  );

  useEffect(() => {
    if (!target) {
      setPos(null);
      return;
    }
    let raf = 0;
    const update = () => {
      const el = document.querySelector<HTMLElement>(
        `.react-flow__node[data-id="${target.id}"]`
      );
      const container = document.querySelector<HTMLElement>(".react-flow");
      if (el && container) {
        const r = el.getBoundingClientRect();
        const c = container.getBoundingClientRect();
        setPos({
          left: r.right - c.left + 12,
          top: r.top - c.top + r.height / 2 - 22,
        });
      } else {
        setPos(null);
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  if (!target || !pos) return null;

  return (
    <div
      className="absolute z-10 pointer-events-none animate-floatY"
      style={{ left: pos.left, top: pos.top }}
      aria-hidden="true"
    >
      <div className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-300 text-amber-900 text-[11px] font-semibold tracking-tight shadow-float border border-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-pulse" />
        Drag from the dot to connect
        {/* Arrow pointing left at the user node handle */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 right-full -translate-y-1/2 -mr-px w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-amber-300"
        />
      </div>
    </div>
  );
}

/** Top-center "Simulating" badge while sim is running. */
function SimulatingBadge() {
  const isRunning = useSimStore((s) => s.isRunning);
  if (!isRunning) return null;
  return (
    <div
      className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      aria-live="polite"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold tracking-tight shadow-float">
        <span className="relative inline-flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-emerald-200 animate-ping" />
          <span className="relative rounded-full w-2 h-2 bg-white" />
        </span>
        <Activity size={11} />
        Simulating
      </div>
    </div>
  );
}

export const CanvasHints = React.memo(function CanvasHints() {
  const nodes = useDiagramStore((s) => s.nodes);
  const empty = nodes.length === 0;
  return (
    <>
      {empty && <EmptyHero />}
      {!empty && <DisconnectedUserHint />}
      <SimulatingBadge />
    </>
  );
});
