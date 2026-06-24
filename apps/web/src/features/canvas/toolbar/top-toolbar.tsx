import React, { useState } from "react";
import { Undo2, Redo2, Maximize, Moon, Sun, Share2, Sparkles, Download } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useTemporalDiagram, useDiagramStore } from "../store/diagram-store";
import { useDarkMode } from "../hooks/use-dark-mode";
import { AiPanel } from "@/features/ai/ai-panel";
import { ShareDialog } from "@/features/share/share-dialog";
import { ExportDialog } from "@/features/export/export-dialog";

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
  const publicEmbed = false; // loaded from query cache; dialog fetches live

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 h-12">
        <div className="flex items-center min-w-0">
          {editingName ? (
            <input
              autoFocus
              className="text-sm font-semibold bg-transparent border-b border-slate-400 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            />
          ) : (
            <span
              className="text-sm font-semibold cursor-text truncate hover:text-slate-600 dark:text-slate-100"
              onDoubleClick={() => setEditingName(true)}
            >
              {name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => undo()} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Undo">
            <Undo2 size={15} />
          </button>
          <button onClick={() => redo()} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Redo">
            <Redo2 size={15} />
          </button>
          <span className="text-xs text-slate-500 w-10 text-center">{zoom}%</span>
          <button onClick={() => fitView({ duration: 200 })} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Fit view">
            <Maximize size={15} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-violet-600 hover:bg-violet-700 text-white"
            title="AI Generate"
          >
            <Sparkles size={12} /> AI
          </button>
          <button onClick={toggle} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Toggle dark mode">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Export diagram"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90"
          >
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>

      <AiPanel open={aiOpen} onOpenChange={setAiOpen} />
      {diagramId && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          diagram={{ id: diagramId, name, publicEmbed }}
        />
      )}
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        diagramName={name}
      />
    </>
  );
});
