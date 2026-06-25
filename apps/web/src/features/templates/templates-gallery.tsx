import { useState } from "react";
import { X, LibraryBig, AlertTriangle } from "lucide-react";
import { TEMPLATES, type Template } from "@archlet/shared";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import type { Diagram } from "@archlet/shared";

const DIFFICULTY_COLORS: Record<Template["difficulty"], string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const CATEGORY_EMOJI: Record<Template["category"], string> = {
  social: "👥",
  messaging: "💬",
  streaming: "📺",
  marketplace: "🛒",
  infra: "⚙️",
  fintech: "💳",
  architectural: "🏛️",
  healthcare: "🏥",
  gaming: "🎮",
  iot: "📡",
  edtech: "🎓",
  logistics: "🚚",
  ai: "🤖",
};

function VariantIconRow({ template }: { template: Template }) {
  const nodeTypes = [...new Set(template.diagram.nodes.map((n) => n.type))];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {nodeTypes.map((t) => (
        <span
          key={t}
          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-plum-50 dark:bg-plum-800/40 text-plum-600 dark:text-plum-300 border border-plum-100 dark:border-plum-700/30"
        >
          {t.replace("_", " ")}
        </span>
      ))}
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: Template;
  onSelect: (t: Template) => void;
}) {
  return (
    <button
      onClick={() => onSelect(template)}
      className="group flex flex-col gap-3 p-4 rounded-2xl border border-cream-200 dark:border-plum-700/30 bg-white dark:bg-plum-900/40 text-left hover:border-plum-300 dark:hover:border-plum-500/50 hover:shadow-card hover:-translate-y-0.5 transition-all duration-150 w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none" aria-hidden>
            {CATEGORY_EMOJI[template.category]}
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink-900 dark:text-cream-50 leading-snug">
            {template.name}
          </span>
        </div>
        <span
          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[template.difficulty]}`}
        >
          {template.difficulty}
        </span>
      </div>

      <p className="text-[12px] text-ink-500 dark:text-cream-200/60 leading-relaxed line-clamp-2">
        {template.description}
      </p>

      <VariantIconRow template={template} />

      <div className="flex flex-wrap gap-1">
        {template.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 rounded bg-cream-100 dark:bg-plum-800/30 text-ink-500 dark:text-cream-200/50"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="text-[11px] text-ink-400 dark:text-cream-200/40">
        {template.diagram.nodes.length} nodes · {template.diagram.edges.length} edges
      </div>
    </button>
  );
}

function ConfirmDialog({
  template,
  hasNodes,
  onConfirm,
  onCancel,
}: {
  template: Template;
  hasNodes: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-plum-900 border border-cream-200 dark:border-plum-700/40 shadow-float p-6 flex flex-col gap-4">
        {hasNodes && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-700 dark:text-amber-300">
              This will replace your current canvas. Unsaved changes will be lost.
            </p>
          </div>
        )}
        <div>
          <h3 className="text-base font-bold text-ink-900 dark:text-cream-50">
            Load "{template.name}"?
          </h3>
          <p className="text-[13px] text-ink-500 dark:text-cream-200/60 mt-1">
            {template.diagram.nodes.length} nodes will be added to your canvas.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-full border border-cream-200 dark:border-plum-700/40 text-ink-700 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-plum-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-full bg-plum-600 hover:bg-plum-700 text-white font-semibold transition-colors shadow-soft"
          >
            Use template
          </button>
        </div>
      </div>
    </div>
  );
}

interface TemplatesGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatesGallery({ open, onOpenChange }: TemplatesGalleryProps) {
  const [selected, setSelected] = useState<Template | null>(null);
  const [search, setSearch] = useState("");
  const loadDiagram = useDiagramStore((s) => s.loadDiagram);
  const currentNodes = useDiagramStore((s) => s.nodes);

  if (!open) return null;

  const filtered = TEMPLATES.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.includes(q) ||
      t.tags.some((tag) => tag.includes(q))
    );
  });

  function handleConfirm() {
    if (!selected) return;
    const diagram: Diagram = {
      id: `template-${selected.id}-${Date.now()}`,
      name: selected.name,
      activeLevel: "high",
      levels: {
        high: selected.diagram,
        mid: { nodes: [], edges: [] },
        low: { nodes: [], edges: [] },
      },
    };
    loadDiagram(diagram);
    setSelected(null);
    onOpenChange(false);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-cream-50 dark:bg-plum-950 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 dark:border-plum-700/40 bg-white/80 dark:bg-plum-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-plum-100 dark:bg-plum-800/60 flex items-center justify-center">
              <LibraryBig size={16} className="text-plum-600 dark:text-plum-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-ink-900 dark:text-cream-50">
                Templates
              </h2>
              <p className="text-[11px] text-ink-500 dark:text-cream-200/50">
                {TEMPLATES.length} system design templates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              autoFocus
              type="search"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-64 h-8 px-3 rounded-full text-[13px] bg-cream-100 dark:bg-plum-800/60 border border-cream-200 dark:border-plum-700/40 text-ink-900 dark:text-cream-50 placeholder:text-ink-400 dark:placeholder:text-cream-200/40 outline-none focus:ring-2 focus:ring-plum-400/40"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800/50 transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-ink-500 dark:text-cream-200/50">No templates match "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {filtered.map((t) => (
                <TemplateCard key={t.id} template={t} onSelect={setSelected} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <ConfirmDialog
          template={selected}
          hasNodes={currentNodes.length > 0}
          onConfirm={handleConfirm}
          onCancel={() => setSelected(null)}
        />
      )}
    </>
  );
}
