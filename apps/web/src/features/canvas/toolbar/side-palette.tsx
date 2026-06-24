import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  User, Zap, Database, Cpu, ListOrdered,
  HardDrive, Globe, SplitSquareHorizontal, Cog, ExternalLink,
} from "lucide-react";
import type { NodeType } from "@archlet/shared";
import { VariantFlyout } from "./variant-flyout";

type PaletteItem = {
  type: NodeType;
  icon: React.ReactNode;
  label: string;
  accent: string;
};

type Group = { title: string; items: PaletteItem[] };

const GROUPS: Group[] = [
  {
    title: "Actors",
    items: [
      { type: "user", icon: <User size={16} strokeWidth={1.75} />, label: "User", accent: "group-hover:bg-rose-100 group-hover:text-rose-600" },
      { type: "external", icon: <ExternalLink size={16} strokeWidth={1.75} />, label: "External", accent: "group-hover:bg-slate-100 group-hover:text-slate-600" },
    ],
  },
  {
    title: "Compute",
    items: [
      { type: "api", icon: <Zap size={16} strokeWidth={1.75} />, label: "API", accent: "group-hover:bg-plum-100 group-hover:text-plum-600" },
      { type: "worker", icon: <Cog size={16} strokeWidth={1.75} />, label: "Worker", accent: "group-hover:bg-indigo-100 group-hover:text-indigo-600" },
    ],
  },
  {
    title: "Storage",
    items: [
      { type: "database", icon: <Database size={16} strokeWidth={1.75} />, label: "Database", accent: "group-hover:bg-cyan-100 group-hover:text-cyan-600" },
      { type: "cache", icon: <Cpu size={16} strokeWidth={1.75} />, label: "Cache", accent: "group-hover:bg-amber-100 group-hover:text-amber-600" },
      { type: "storage", icon: <HardDrive size={16} strokeWidth={1.75} />, label: "Storage", accent: "group-hover:bg-emerald-100 group-hover:text-emerald-600" },
    ],
  },
  {
    title: "Network",
    items: [
      { type: "cdn", icon: <Globe size={16} strokeWidth={1.75} />, label: "CDN", accent: "group-hover:bg-sky-100 group-hover:text-sky-600" },
      { type: "load_balancer", icon: <SplitSquareHorizontal size={16} strokeWidth={1.75} />, label: "Load balancer", accent: "group-hover:bg-violet-100 group-hover:text-violet-600" },
      { type: "queue", icon: <ListOrdered size={16} strokeWidth={1.75} />, label: "Queue", accent: "group-hover:bg-orange-100 group-hover:text-orange-600" },
    ],
  },
];

// ── FlyoutState ────────────────────────────────────────────────────────────

type FlyoutState = {
  nodeType: NodeType;
  label: string;
  anchorTop: number;
  anchorLeft: number;
} | null;

// ── PaletteTile ────────────────────────────────────────────────────────────

interface PaletteTileProps {
  item: PaletteItem;
  isActive: boolean;
  onHoverStart: (type: NodeType, label: string, anchorTop: number, anchorLeft: number) => void;
  onHoverEnd: () => void;
}

function PaletteTile({ item, isActive, onHoverStart, onHoverEnd }: PaletteTileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onDragStart(e: React.DragEvent) {
    // Plain type drag — no variantId, canvas onDrop will use default
    e.dataTransfer.setData("application/reactflow", item.type);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleMouseEnter() {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      const rect = tileRef.current?.getBoundingClientRect();
      const paletteRect = tileRef.current?.closest("[data-archlet-palette]")?.getBoundingClientRect();
      if (rect && paletteRect) {
        onHoverStart(item.type, item.label, rect.top, paletteRect.right + 8);
      }
    }, 150);
  }

  function handleMouseLeave() {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    onHoverEnd();
  }

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  return (
    <div
      ref={tileRef}
      draggable
      onDragStart={onDragStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={item.label}
      className={`group relative w-9 h-9 flex items-center justify-center rounded-xl cursor-grab active:cursor-grabbing text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/60 hover:scale-105 transition-all duration-150 select-none ${
        isActive ? "bg-cream-100 dark:bg-plum-800/60 scale-105" : ""
      }`}
    >
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${item.accent} dark:group-hover:bg-white/10`}>
        {item.icon}
      </span>
      {/* Tooltip — hidden when flyout is active */}
      {!isActive && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full ml-2 px-2.5 py-1 rounded-md text-[11px] font-medium bg-ink-900 text-cream-50 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 shadow-soft"
        >
          {item.label}
        </span>
      )}
    </div>
  );
}

// ── SidePalette ────────────────────────────────────────────────────────────

export const SidePalette = React.memo(function SidePalette() {
  const [flyout, setFlyout] = useState<FlyoutState>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flyoutHoveredRef = useRef(false);

  const scheduleFlyoutClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      if (!flyoutHoveredRef.current) {
        setFlyout(null);
      }
    }, 300);
  }, []);

  const cancelFlyoutClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleTileHoverStart = useCallback(
    (type: NodeType, label: string, anchorTop: number, anchorLeft: number) => {
      cancelFlyoutClose();
      setFlyout({ nodeType: type, label, anchorTop, anchorLeft });
    },
    [cancelFlyoutClose]
  );

  const handleTileHoverEnd = useCallback(() => {
    scheduleFlyoutClose();
  }, [scheduleFlyoutClose]);

  const closeFlyout = useCallback(() => {
    setFlyout(null);
    flyoutHoveredRef.current = false;
  }, []);

  // Close if palette loses focus entirely (click outside)
  const handlePaletteMouseLeave = useCallback(() => {
    scheduleFlyoutClose();
  }, [scheduleFlyoutClose]);

  const handlePaletteMouseEnter = useCallback(() => {
    cancelFlyoutClose();
  }, [cancelFlyoutClose]);

  // Cleanup timers on unmount
  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  return (
    <>
      <div
        ref={paletteRef}
        data-archlet-palette
        tabIndex={-1}
        onMouseLeave={handlePaletteMouseLeave}
        onMouseEnter={handlePaletteMouseEnter}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-0 p-1 bg-white/95 dark:bg-plum-900/90 backdrop-blur-md border border-cream-200 dark:border-plum-700/40 rounded-2xl shadow-float shadow-inset-pill dark:shadow-inset-pill-dark"
      >
        {GROUPS.map((group, gi) => (
          <React.Fragment key={group.title}>
            {gi > 0 && (
              <div className="mx-2 mt-1 mb-0.5 h-px bg-cream-200/80 dark:bg-plum-700/40" aria-hidden="true" />
            )}
            <div className="px-1 pt-0.5 pb-0.5 text-[9px] archlet-smallcaps font-semibold text-ink-300 dark:text-cream-200/40 text-center select-none">
              {group.title}
            </div>
            {group.items.map((item) => (
              <PaletteTile
                key={item.type}
                item={item}
                isActive={flyout?.nodeType === item.type}
                onHoverStart={handleTileHoverStart}
                onHoverEnd={handleTileHoverEnd}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {flyout && (
        <div
          onMouseEnter={() => {
            flyoutHoveredRef.current = true;
            cancelFlyoutClose();
          }}
          onMouseLeave={() => {
            flyoutHoveredRef.current = false;
            scheduleFlyoutClose();
          }}
        >
          <VariantFlyout
            nodeType={flyout.nodeType}
            typeLabel={flyout.label}
            anchorTop={flyout.anchorTop}
            anchorLeft={flyout.anchorLeft}
            onClose={closeFlyout}
          />
        </div>
      )}
    </>
  );
});
