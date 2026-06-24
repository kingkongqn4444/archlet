import React, { useEffect, useState } from "react";
import { Zap, Activity, Sparkles, PlayCircle } from "lucide-react";
import { useDiagramStore } from "../store/diagram-store";
import { useSimStore } from "@/features/simulate/sim-store";

/** Mini animated architecture glyph for empty hero — a tiny diagram. */
function HeroGlyph() {
  return (
    <svg
      width="140"
      height="64"
      viewBox="0 0 140 64"
      aria-hidden="true"
      className="text-plum-500 dark:text-plum-300 animate-bob-slow"
    >
      <defs>
        <linearGradient id="hero-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {/* Edges */}
      <path d="M22 32 H62" stroke="url(#hero-edge)" strokeWidth="1.4" strokeDasharray="4 3" />
      <path d="M78 32 H118" stroke="url(#hero-edge)" strokeWidth="1.4" strokeDasharray="4 3" />
      {/* Left node — user */}
      <rect x="2" y="22" width="20" height="20" rx="6" fill="currentColor" opacity="0.12" />
      <circle cx="12" cy="29" r="3" fill="currentColor" opacity="0.85" />
      <path d="M6 38 q6 -5 12 0" stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.85" />
      {/* Middle node — api */}
      <rect x="62" y="22" width="16" height="20" rx="5" fill="currentColor" opacity="0.18" />
      <path d="M71 26 L68 33 H72 L69 39" stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.95" strokeLinejoin="round" strokeLinecap="round" />
      {/* Right node — db */}
      <rect x="118" y="22" width="20" height="20" rx="6" fill="currentColor" opacity="0.12" />
      <ellipse cx="128" cy="27" rx="6" ry="2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
      <path d="M122 27 V37 q6 2 12 0 V27" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
    </svg>
  );
}

/** Empty-canvas hero — centered card with mini diagram + ghost CTAs. */
function EmptyHero({ onPullAi }: { onPullAi: () => void }) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      aria-hidden="false"
    >
      <div
        className="pointer-events-auto relative max-w-[420px] w-[88%]
                   flex flex-col items-center gap-4 px-7 pt-7 pb-6 rounded-3xl
                   bg-white/85 dark:bg-plum-900/65 backdrop-blur-md
                   border border-cream-200 dark:border-plum-700/40
                   shadow-float animate-slide-in-right"
      >
        {/* Plum accent line at top */}
        <span
          aria-hidden="true"
          className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-plum-500 to-transparent opacity-70"
        />
        <HeroGlyph />
        <div className="text-center">
          <h2 className="text-[18px] font-semibold tracking-tight text-ink-900 dark:text-cream-50">
            Sketch your architecture
          </h2>
          <p className="text-[12.5px] leading-relaxed text-ink-500 dark:text-cream-200/70 mt-1.5 max-w-[320px] mx-auto">
            Drag a service from the left palette — or describe your system and let AI draft it for you.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium text-ink-700 dark:text-cream-100 border border-cream-200 dark:border-plum-700/40 bg-white/70 dark:bg-plum-900/60 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
          >
            <PlayCircle size={13} />
            Tutorial (60s)
          </a>
          <button
            onClick={onPullAi}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12px] font-semibold text-cream-50 bg-plum-700 hover:bg-plum-600 hover:scale-[1.02] transition shadow-soft"
          >
            <Sparkles size={13} className="text-amber-300" />
            Ask AI to generate
          </button>
        </div>
      </div>
    </div>
  );
}

/** Floating, on-brand hint anchored above a disconnected User node. */
function DisconnectedUserHint() {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

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
        // Anchor above the node, slightly to the right (over the source handle).
        setPos({
          left: r.left - c.left + r.width / 2 - 92,
          top: r.top - c.top - 44,
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
      <div
        className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                   bg-cream-50/95 dark:bg-plum-900/85 backdrop-blur
                   border border-cream-200 dark:border-plum-700/40
                   text-ink-700 dark:text-cream-100
                   text-[11px] font-medium tracking-tight shadow-soft"
      >
        <Zap size={11} className="text-amber-500 dark:text-amber-400" strokeWidth={2.4} />
        Drag from the dot to connect
        {/* Hairline connector pointing down to the node */}
        <svg
          aria-hidden="true"
          className="absolute left-1/2 top-full -translate-x-1/2 -mt-px text-cream-200 dark:text-plum-700"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
        >
          <path
            d="M11 0 Q 11 12 11 22"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <circle cx="11" cy="20" r="1.6" fill="currentColor" />
        </svg>
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

interface CanvasHintsProps {
  /** Called when empty hero "Ask AI" CTA clicked. */
  onPullAi?: () => void;
}

export const CanvasHints = React.memo(function CanvasHints({ onPullAi }: CanvasHintsProps) {
  const nodes = useDiagramStore((s) => s.nodes);
  const empty = nodes.length === 0;
  const noop = React.useCallback(() => {
    // Fallback — focus the side palette so user sees where to drag from.
    document.querySelector<HTMLElement>("[data-archlet-palette]")?.focus();
  }, []);
  return (
    <>
      {empty && <EmptyHero onPullAi={onPullAi ?? noop} />}
      {!empty && <DisconnectedUserHint />}
      <SimulatingBadge />
    </>
  );
});
