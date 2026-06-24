import React, { useState, useRef, useCallback, useEffect } from "react";
import { PATTERNS_CATALOG, type Pattern, type PatternCategory } from "@archlet/shared";

// Category icon map
const CATEGORY_ICONS: Record<PatternCategory, string> = {
  caching: "⚡",
  resilience: "🛡",
  data: "🗄",
  messaging: "📨",
  microservices: "🔧",
  scaling: "📈",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  intro: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  common: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

// ── PatternFlyout ──────────────────────────────────────────────────────────

function PatternFlyout({
  pattern,
  anchorTop,
  anchorLeft,
}: {
  pattern: Pattern;
  anchorTop: number;
  anchorLeft: number;
}) {
  const style: React.CSSProperties = {
    position: "fixed",
    left: anchorLeft,
    top: Math.max(8, anchorTop - 8),
    width: 260,
    zIndex: 50,
  };

  return (
    <div
      style={style}
      className="bg-white/97 dark:bg-plum-900/97 backdrop-blur-md border border-cream-200 dark:border-plum-700/40 rounded-2xl shadow-float p-3 flex flex-col gap-2"
      role="tooltip"
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none mt-0.5" aria-hidden>
          {CATEGORY_ICONS[pattern.category]}
        </span>
        <div>
          <div className="text-[13px] font-bold text-ink-900 dark:text-cream-50 leading-tight">
            {pattern.name}
          </div>
          <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wide ${DIFFICULTY_COLOR[pattern.difficulty]}`}>
            {pattern.difficulty}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11.5px] text-ink-600 dark:text-cream-200/70 leading-snug">
        {pattern.description}
      </p>

      {/* When to use */}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-ink-400 dark:text-cream-200/40 mb-0.5">When to use</div>
        <p className="text-[11px] text-ink-700 dark:text-cream-100/80 leading-snug">{pattern.whenToUse}</p>
      </div>

      {/* Tradeoffs */}
      <div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-ink-400 dark:text-cream-200/40 mb-0.5">Trade-offs</div>
        <p className="text-[11px] text-ink-700 dark:text-cream-100/80 leading-snug">{pattern.tradeoffs}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {pattern.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-plum-50 dark:bg-plum-800/50 text-plum-600 dark:text-plum-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Mini node count */}
      <div className="text-[10px] text-ink-400 dark:text-cream-200/40 italic">
        {pattern.diagram.nodes.length} nodes · {pattern.diagram.edges.length} edges — drag to canvas
      </div>
    </div>
  );
}

// ── PatternTile ────────────────────────────────────────────────────────────

function PatternTile({
  pattern,
  onHoverStart,
  onHoverEnd,
}: {
  pattern: Pattern;
  onHoverStart: (p: Pattern, top: number, left: number) => void;
  onHoverEnd: () => void;
}) {
  const tileRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/archlet-pattern", pattern.id);
    e.dataTransfer.effectAllowed = "copy";
  }

  function handleMouseEnter() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      const rect = tileRef.current?.getBoundingClientRect();
      const paletteRect = tileRef.current?.closest("[data-archlet-palette]")?.getBoundingClientRect();
      if (rect && paletteRect) {
        onHoverStart(pattern, rect.top, paletteRect.right + 8);
      }
    }, 180);
  }

  function handleMouseLeave() {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    onHoverEnd();
  }

  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);

  return (
    <div
      ref={tileRef}
      draggable
      onDragStart={onDragStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={pattern.name}
      className="group relative w-9 h-9 flex items-center justify-center rounded-xl cursor-grab active:cursor-grabbing hover:bg-cream-100 dark:hover:bg-plum-800/60 hover:scale-105 transition-all duration-150 select-none text-ink-700 dark:text-cream-100"
    >
      <span className="text-base leading-none" aria-hidden>
        {CATEGORY_ICONS[pattern.category]}
      </span>
    </div>
  );
}

// ── PatternsGroup ──────────────────────────────────────────────────────────
// Groups patterns by category and renders as compact tiles.

type FlyoutState = { pattern: Pattern; anchorTop: number; anchorLeft: number } | null;

export function PatternsGroup() {
  const [flyout, setFlyout] = useState<FlyoutState>(null);
  const flyoutHoveredRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleFlyoutClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      if (!flyoutHoveredRef.current) setFlyout(null);
    }, 300);
  }, []);

  const cancelFlyoutClose = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);

  const handleHoverStart = useCallback((p: Pattern, top: number, left: number) => {
    cancelFlyoutClose();
    setFlyout({ pattern: p, anchorTop: top, anchorLeft: left });
  }, [cancelFlyoutClose]);

  const handleHoverEnd = useCallback(() => { scheduleFlyoutClose(); }, [scheduleFlyoutClose]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  // Group by category for display
  const categories = Array.from(new Set(PATTERNS_CATALOG.map((p) => p.category)));

  return (
    <>
      <div
        className="mx-2 mt-1 mb-0.5 h-px bg-cream-200/80 dark:bg-plum-700/40"
        aria-hidden="true"
      />
      <div className="px-1 pt-0.5 pb-0.5 text-[9px] archlet-smallcaps font-semibold text-ink-300 dark:text-cream-200/40 text-center select-none">
        Patterns
      </div>
      {categories.map((cat) => {
        const items = PATTERNS_CATALOG.filter((p) => p.category === cat);
        return (
          <div key={cat} className="flex flex-col gap-0">
            {items.map((pattern) => (
              <PatternTile
                key={pattern.id}
                pattern={pattern}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              />
            ))}
          </div>
        );
      })}
      {flyout && (
        <div
          onMouseEnter={() => { flyoutHoveredRef.current = true; cancelFlyoutClose(); }}
          onMouseLeave={() => { flyoutHoveredRef.current = false; scheduleFlyoutClose(); }}
        >
          <PatternFlyout
            pattern={flyout.pattern}
            anchorTop={flyout.anchorTop}
            anchorLeft={flyout.anchorLeft}
          />
        </div>
      )}
    </>
  );
}
