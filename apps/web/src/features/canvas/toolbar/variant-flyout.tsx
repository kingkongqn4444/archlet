import React, { useEffect, useRef } from "react";
import { VARIANTS_CATALOG } from "@archlet/shared";
import type { NodeType, Variant } from "@archlet/shared";

interface VariantFlyoutProps {
  nodeType: NodeType;
  typeLabel: string;
  anchorTop: number; // px from viewport top
  onClose: () => void;
}

function getIconUrl(iconSlug: string): string {
  // Cream/plum palette: plum-600 = #6C2BD9
  return `https://cdn.simpleicons.org/${iconSlug}/6C2BD9`;
}

function VariantCard({
  nodeType,
  variant,
  onDragStart,
}: {
  nodeType: NodeType;
  variant: Variant;
  onDragStart: (e: React.DragEvent, type: NodeType, variantId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, nodeType, variant.id)}
      className="flex items-center gap-2.5 p-2 rounded-xl cursor-grab active:cursor-grabbing hover:bg-cream-100 dark:hover:bg-plum-800/60 transition-colors duration-100 select-none"
    >
      <div className="shrink-0 w-6 h-6 flex items-center justify-center">
        {variant.iconSlug ? (
          <img
            src={getIconUrl(variant.iconSlug)}
            alt={variant.label}
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain dark:invert-[0.15]"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-4 h-4 rounded-md bg-plum-100 dark:bg-plum-800/80 border border-plum-200 dark:border-plum-700/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 dark:text-cream-50 leading-tight truncate">
          {variant.label}
        </div>
        {variant.description && (
          <div className="text-[11px] text-ink-500 dark:text-cream-200/55 leading-snug truncate">
            {variant.description}
          </div>
        )}
      </div>
    </div>
  );
}

export function VariantFlyout({ nodeType, typeLabel, anchorTop, onClose }: VariantFlyoutProps) {
  const flyoutRef = useRef<HTMLDivElement>(null);
  const variants = VARIANTS_CATALOG[nodeType] as Variant[];

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleDragStart(e: React.DragEvent, type: NodeType, variantId: string) {
    e.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type, variantId })
    );
    e.dataTransfer.effectAllowed = "move";
    // Close flyout after drag starts
    setTimeout(onClose, 100);
  }

  // Position: palette is at left:3 (12px), width ~44px, so flyout starts at ~60px
  // anchorTop places top of flyout near the hovered icon
  const style: React.CSSProperties = {
    position: "fixed",
    left: 64,
    top: Math.max(8, anchorTop - 8),
    width: 240,
    zIndex: 50,
  };

  return (
    <div
      ref={flyoutRef}
      style={style}
      className="bg-white/95 dark:bg-plum-900/95 backdrop-blur-md border border-cream-200 dark:border-plum-700/40 rounded-2xl shadow-float p-2 gap-1 flex flex-col"
      role="listbox"
      aria-label={`${typeLabel} variants`}
    >
      {/* Header */}
      <div className="px-2 pt-1 pb-1.5 text-[9px] font-bold uppercase tracking-widest text-ink-500 dark:text-cream-200/50 select-none">
        {typeLabel} — {variants.length} variant{variants.length !== 1 ? "s" : ""}
      </div>

      {/* Variant cards */}
      {variants.map((variant) => (
        <VariantCard
          key={variant.id}
          nodeType={nodeType}
          variant={variant}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
}
