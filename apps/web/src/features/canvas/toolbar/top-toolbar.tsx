import React, { useState } from "react";
import { Undo2, Redo2, Maximize, Moon, Sun, Share2, Sparkles, Download, Pencil } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useTemporalDiagram, useDiagramStore } from "../store/diagram-store";
import { useDarkMode } from "../hooks/use-dark-mode";
import { AiPanel } from "@/features/ai/ai-panel";
import { ShareDialog } from "@/features/share/share-dialog";
import { ExportDialog } from "@/features/export/export-dialog";

function Divider() {
  return <span className="w-px h-5 bg-cream-200 dark:bg-plum-700/50 mx-1" aria-hidden="true" />;
}

function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 inline-flex items-center justify-center rounded-full text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition-all duration-150 hover:scale-105"
    >
      {children}
    </button>
  );
}

export const TopToolbar = React.memo(function TopToolbar() {
  const [editingName, setEditingName] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const { fitView, getViewport } = useReactFlow();
  const { undo, redo } = useTemporalDiagram();
  const { isDark, toggle } = useDarkMode();
  const zoom = Math.round((getViewport().zoom ?? 1) * 100);

  const diagramId = useDiagramStore((s) => s.id);
  const name = useDiagramStore((s) => s.name);
  const setName = useDiagramStore((s) => s.setName);
  const publicEmbed = false;

  return (
    <>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1.5 bg-white/95 dark:bg-plum-900/90 backdrop-blur-md border border-cream-200 dark:border-plum-700/40 rounded-full shadow-float shadow-inset-pill dark:shadow-inset-pill-dark">
        {/* Diagram name */}
        <div className="flex items-center min-w-0 pl-2 pr-1 group">
          {editingName ? (
            <input
              autoFocus
              className="text-[14px] font-semibold tracking-tight bg-transparent border-b border-plum-400 outline-none w-40 text-ink-900 dark:text-cream-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            />
          ) : (
            <button
              type="button"
              onDoubleClick={() => setEditingName(true)}
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 text-[14px] font-semibold tracking-tight text-ink-900 dark:text-cream-50 max-w-[160px] truncate"
            >
              <span className="truncate">{name}</span>
              <Pencil
                size={11}
                className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0"
              />
            </button>
          )}
        </div>

        <Divider />

        {/* Zoom + history + fit */}
        <IconBtn onClick={() => undo()} title="Undo (⌘Z)">
          <Undo2 size={14} />
        </IconBtn>
        <IconBtn onClick={() => redo()} title="Redo (⌘⇧Z)">
          <Redo2 size={14} />
        </IconBtn>
        <span className="text-[11px] font-medium text-ink-500 dark:text-cream-200/60 w-9 text-center tabular-nums">
          {zoom}%
        </span>
        <IconBtn onClick={() => fitView({ duration: 250, padding: 0.2 })} title="Fit view">
          <Maximize size={14} />
        </IconBtn>

        <Divider />

        {/* Export */}
        <IconBtn onClick={() => setExportOpen(true)} title="Export">
          <Download size={14} />
        </IconBtn>

        {/* Share — text pill */}
        <button
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold text-plum-700 dark:text-plum-200 hover:bg-plum-50 dark:hover:bg-plum-800/50 transition-all duration-150"
        >
          <Share2 size={13} />
          Share
        </button>

        <Divider />

        {/* Dark mode */}
        <IconBtn onClick={toggle} title="Toggle dark mode">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </IconBtn>

        {/* AI sparkles — filled plum circle */}
        <button
          onClick={() => setAiOpen(true)}
          title="AI generate"
          className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-plum-500 to-plum-700 text-white shadow-soft hover:shadow-float hover:scale-110 transition-all duration-150"
        >
          <Sparkles size={14} />
        </button>
      </div>

      <AiPanel open={aiOpen} onOpenChange={setAiOpen} />
      {diagramId && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          diagram={{ id: diagramId, name, publicEmbed }}
        />
      )}
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} diagramName={name} />
    </>
  );
});
