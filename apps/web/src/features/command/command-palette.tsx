import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { autoLayout } from "@/features/canvas/layout/auto-layout";
import { buildPaletteItems, filterAndSort, type PaletteItem, type ActionGroup } from "./actions";
import type { NodeType, Diagram } from "@archlet/shared";

const GROUP_ORDER: ActionGroup[] = ["Actions", "Templates", "Nodes", "Variants"];
const MAX_VISIBLE = 12;

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
  onOpenShare: () => void;
  onOpenAi: () => void;
  onOpenReview: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenTemplates,
  onOpenExport,
  onOpenShare,
  onOpenAi,
  onOpenReview,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const applyLayout = useDiagramStore((s) => s.applyLayout);
  const addNode = useDiagramStore((s) => s.addNode);
  const loadDiagram = useDiagramStore((s) => s.loadDiagram);

  const addVariantNode = useCallback(
    (type: NodeType, variantId: string, label: string) => {
      addNode({
        id: `${type}-${Date.now()}`,
        type,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: { label, variant: variantId },
      });
    },
    [addNode]
  );

  const onSelectNode = useCallback(
    (id: string) => {
      // pan to node — just close palette; React Flow fitView handles it
      void id;
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const allItems = buildPaletteItems({
    nodes,
    edges,
    applyLayout,
    openTemplates: () => { onOpenChange(false); onOpenTemplates(); },
    openExport: () => { onOpenChange(false); onOpenExport(); },
    openShare: () => { onOpenChange(false); onOpenShare(); },
    openAi: () => { onOpenChange(false); onOpenAi(); },
    openReview: () => { onOpenChange(false); onOpenReview(); },
    runSimulation: null,
    stopSimulation: null,
    navigate: (path) => { onOpenChange(false); navigate(path); },
    onSelectNode: (id) => { onOpenChange(false); onSelectNode(id); },
    addVariantNode: (type, variantId, label) => {
      addVariantNode(type, variantId, label);
      onOpenChange(false);
    },
    loadTemplate: (diagram: Diagram) => {
      loadDiagram(diagram);
      onOpenChange(false);
    },
  });

  const filtered = filterAndSort(allItems, query).slice(0, MAX_VISIBLE);

  // Group into sections
  const grouped = GROUP_ORDER.reduce<Record<ActionGroup, PaletteItem[]>>(
    (acc, g) => {
      acc[g] = filtered.filter((i) => i.group === g);
      return acc;
    },
    { Actions: [], Templates: [], Nodes: [], Variants: [] }
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (item: PaletteItem) => {
      item.onSelect();
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item) handleSelect(item);
      }
    },
    [filtered, activeIndex, handleSelect, onOpenChange]
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  let globalIdx = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-xl rounded-2xl bg-cream-50 dark:bg-plum-900 border border-cream-200 dark:border-plum-700/40 shadow-float overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-cream-200 dark:border-plum-700/30">
          <Search size={16} className="text-ink-400 dark:text-cream-200/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search nodes, actions, variants…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-ink-900 dark:text-cream-50 placeholder:text-ink-400 dark:placeholder:text-cream-200/40 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-ink-400 dark:text-cream-200/40 bg-cream-100 dark:bg-plum-800/50 border border-cream-200 dark:border-plum-700/30">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-400 dark:text-cream-200/40">
              No results for "{query}"
            </p>
          )}

          {GROUP_ORDER.map((group) => {
            const groupItems = grouped[group];
            if (groupItems.length === 0) return null;

            return (
              <div key={group}>
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400 dark:text-cream-200/40">
                  {group}
                </div>
                {groupItems.map((item) => {
                  const idx = globalIdx++;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      data-idx={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isActive
                          ? "bg-plum-50 dark:bg-plum-800/60"
                          : "hover:bg-cream-100 dark:hover:bg-plum-800/30"
                      }`}
                    >
                      <span className="w-6 text-center text-base leading-none" aria-hidden>
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-ink-900 dark:text-cream-50 truncate">
                          {item.label}
                        </span>
                        <span className="block text-[11px] text-ink-400 dark:text-cream-200/40 truncate">
                          {item.description}
                        </span>
                      </div>
                      <span className="shrink-0 text-[10px] text-ink-300 dark:text-cream-200/30">
                        {item.group}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-cream-200 dark:border-plum-700/30 text-[10px] text-ink-400 dark:text-cream-200/40">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
