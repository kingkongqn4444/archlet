import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Zap, Shield, Database, MessageSquare, Layers, TrendingUp,
} from "lucide-react";
import { PATTERNS_CATALOG, type Pattern, type PatternCategory } from "@archlet/shared";

// ── Category config ────────────────────────────────────────────────────────

type CatConfig = {
  icon: React.ReactNode;
  label: string;
  accent: string;
  iconColor: string;
};

const CATEGORY_CONFIG: Record<PatternCategory, CatConfig> = {
  caching:      { icon: <Zap size={15} strokeWidth={1.75} />,            label: "Caching",       accent: "group-hover:bg-amber-100 dark:group-hover:bg-white/10",  iconColor: "group-hover:text-amber-600 dark:group-hover:text-amber-300" },
  resilience:   { icon: <Shield size={15} strokeWidth={1.75} />,         label: "Resilience",    accent: "group-hover:bg-red-100 dark:group-hover:bg-white/10",     iconColor: "group-hover:text-red-600 dark:group-hover:text-red-300" },
  data:         { icon: <Database size={15} strokeWidth={1.75} />,       label: "Data",          accent: "group-hover:bg-cyan-100 dark:group-hover:bg-white/10",    iconColor: "group-hover:text-cyan-600 dark:group-hover:text-cyan-300" },
  messaging:    { icon: <MessageSquare size={15} strokeWidth={1.75} />,  label: "Messaging",     accent: "group-hover:bg-blue-100 dark:group-hover:bg-white/10",    iconColor: "group-hover:text-blue-600 dark:group-hover:text-blue-300" },
  microservices:{ icon: <Layers size={15} strokeWidth={1.75} />,         label: "Microservices", accent: "group-hover:bg-violet-100 dark:group-hover:bg-white/10",  iconColor: "group-hover:text-violet-600 dark:group-hover:text-violet-300" },
  scaling:      { icon: <TrendingUp size={15} strokeWidth={1.75} />,     label: "Scaling",       accent: "group-hover:bg-emerald-100 dark:group-hover:bg-white/10", iconColor: "group-hover:text-emerald-600 dark:group-hover:text-emerald-300" },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  intro:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  common:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

// ── PatternFlyout ──────────────────────────────────────────────────────────

function PatternFlyout({
  category,
  patterns,
  anchorTop,
  anchorLeft,
  onDropPattern,
}: {
  category: PatternCategory;
  patterns: Pattern[];
  anchorTop: number;
  anchorLeft: number;
  onDropPattern?: (id: string) => void;
}) {
  const cfg = CATEGORY_CONFIG[category];

  const style: React.CSSProperties = {
    position: "fixed",
    left: anchorLeft,
    top: Math.max(8, anchorTop - 8),
    width: 272,
    zIndex: 50,
  };

  return (
    <div
      style={style}
      className="bg-white/97 dark:bg-plum-900/97 backdrop-blur-md border border-cream-200 dark:border-plum-700/40 rounded-2xl shadow-float p-3 flex flex-col gap-2.5"
    >
      {/* Category header */}
      <div className="flex items-center gap-2 pb-1 border-b border-cream-100 dark:border-plum-700/40">
        <span className="text-ink-400 dark:text-cream-200/50">{cfg.icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-ink-400 dark:text-cream-200/40">
          {cfg.label}
        </span>
        <span className="ml-auto text-[10px] text-ink-300 dark:text-cream-200/30">
          {patterns.length} patterns
        </span>
      </div>

      {/* Pattern list */}
      {patterns.map((p) => (
        <div
          key={p.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/archlet-pattern", p.id);
            e.dataTransfer.effectAllowed = "copy";
          }}
          onClick={() => onDropPattern?.(p.id)}
          className="flex flex-col gap-1 px-2.5 py-2 rounded-xl cursor-grab hover:bg-cream-50 dark:hover:bg-plum-800/50 transition-colors group/item select-none"
          style={{ border: "1px solid transparent" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.06)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12.5px] font-semibold text-ink-800 dark:text-cream-50 leading-tight">
              {p.name}
            </span>
            <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${DIFFICULTY_COLOR[p.difficulty]}`}>
              {p.difficulty}
            </span>
          </div>
          <p className="text-[11px] text-ink-500 dark:text-cream-200/55 leading-snug line-clamp-2">
            {p.description}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-ink-300 dark:text-cream-200/30">
              {p.diagram.nodes.length}N · {p.diagram.edges.length}E
            </span>
            <span className="text-[10px] text-plum-400 dark:text-plum-300 opacity-0 group-hover/item:opacity-100 transition-opacity">
              drag to canvas →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CategoryTile ────────────────────────────────────────────────────────────

function CategoryTile({
  category,
  isActive,
  onHoverStart,
  onHoverEnd,
}: {
  category: PatternCategory;
  isActive: boolean;
  onHoverStart: (cat: PatternCategory, top: number, left: number) => void;
  onHoverEnd: () => void;
}) {
  const cfg = CATEGORY_CONFIG[category];
  const tileRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      const rect = tileRef.current?.getBoundingClientRect();
      const paletteRect = tileRef.current?.closest("[data-archlet-palette]")?.getBoundingClientRect();
      if (rect && paletteRect) onHoverStart(category, rect.top, paletteRect.right + 8);
    }, 150);
  }

  function handleMouseLeave() {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    onHoverEnd();
  }

  useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);

  return (
    <div
      ref={tileRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={cfg.label}
      className={`group relative w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer hover:bg-cream-100 dark:hover:bg-plum-800/60 hover:scale-105 transition-all duration-150 select-none text-ink-500 dark:text-cream-200/60 ${
        isActive ? "bg-cream-100 dark:bg-plum-800/60 scale-105" : ""
      }`}
    >
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${cfg.accent} ${cfg.iconColor}`}>
        {cfg.icon}
      </span>
      {/* Tooltip */}
      {!isActive && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full ml-2 px-2.5 py-1 rounded-md text-[11px] font-medium bg-ink-900 text-cream-50 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 shadow-soft"
        >
          {cfg.label} patterns
        </span>
      )}
    </div>
  );
}

// ── PatternsGroup ──────────────────────────────────────────────────────────

type FlyoutState = { category: PatternCategory; anchorTop: number; anchorLeft: number } | null;

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

  const handleHoverStart = useCallback((cat: PatternCategory, top: number, left: number) => {
    cancelFlyoutClose();
    setFlyout({ category: cat, anchorTop: top, anchorLeft: left });
  }, [cancelFlyoutClose]);

  const handleHoverEnd = useCallback(() => { scheduleFlyoutClose(); }, [scheduleFlyoutClose]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const categories = Object.keys(CATEGORY_CONFIG) as PatternCategory[];
  const flyoutPatterns = flyout ? PATTERNS_CATALOG.filter((p) => p.category === flyout.category) : [];

  return (
    <>
      <div className="mx-2 mt-1 mb-0.5 h-px bg-cream-200/80 dark:bg-plum-700/40" aria-hidden="true" />
      <div className="px-1 pt-0.5 pb-0.5 text-[9px] archlet-smallcaps font-semibold text-ink-300 dark:text-cream-200/40 text-center select-none">
        Patterns
      </div>
      {categories.map((cat) => (
        <CategoryTile
          key={cat}
          category={cat}
          isActive={flyout?.category === cat}
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
        />
      ))}
      {flyout && (
        <div
          onMouseEnter={() => { flyoutHoveredRef.current = true; cancelFlyoutClose(); }}
          onMouseLeave={() => { flyoutHoveredRef.current = false; scheduleFlyoutClose(); }}
        >
          <PatternFlyout
            category={flyout.category}
            patterns={flyoutPatterns}
            anchorTop={flyout.anchorTop}
            anchorLeft={flyout.anchorLeft}
          />
        </div>
      )}
    </>
  );
}
