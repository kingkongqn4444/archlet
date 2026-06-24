import React, { useState, useRef, useEffect } from "react";
import { Undo2, Redo2, Sparkles, ChevronDown, X } from "lucide-react";
import { useDiagramStore, useTemporalDiagram } from "../store/diagram-store";
import { AiPanel } from "@/features/ai/ai-panel";
import { RunButton } from "@/features/simulate/run-button";
import { AnalyzeButton } from "@/features/review/analyze-button";
import type { Level } from "@archlet/shared";

const LEVELS: { key: Level; label: string }[] = [
  { key: "high", label: "High level" },
  { key: "mid", label: "Mid level" },
  { key: "low", label: "Low level" },
];

export const LevelSwitcher = React.memo(function LevelSwitcher() {
  const activeLevel = useDiagramStore((s) => s.activeLevel);
  const setLevel = useDiagramStore((s) => s.setLevel);
  const { undo, redo } = useTemporalDiagram();
  const [aiOpen, setAiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const activeLabel = LEVELS.find((l) => l.key === activeLevel)?.label ?? "High level";

  if (collapsed) {
    return (
      <button
        onMouseEnter={() => setCollapsed(false)}
        onClick={() => setCollapsed(false)}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-plum-900/90 backdrop-blur-md border border-cream-200 dark:border-plum-700/40 shadow-float flex items-center justify-center text-ink-700 dark:text-cream-100 hover:scale-105 transition"
        title="Expand toolbar"
      >
        <Sparkles size={14} className="text-plum-500" />
      </button>
    );
  }

  return (
    <>
      <div
        ref={wrapRef}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1.5
                   bg-white/95 dark:bg-plum-900/90 backdrop-blur-md
                   border border-cream-200 dark:border-plum-700/40 rounded-full
                   shadow-float shadow-inset-pill dark:shadow-inset-pill-dark"
      >
        <button
          onClick={() => undo()}
          title="Undo"
          className="w-8 h-8 inline-flex items-center justify-center rounded-full text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={() => redo()}
          title="Redo"
          className="w-8 h-8 inline-flex items-center justify-center rounded-full text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
        >
          <Redo2 size={14} />
        </button>

        <span className="w-px h-5 bg-cream-200 dark:bg-plum-700/50 mx-1" aria-hidden="true" />

        <RunButton />

        <span className="w-px h-5 bg-cream-200 dark:bg-plum-700/50 mx-1" aria-hidden="true" />

        <AnalyzeButton />

        <span className="w-px h-5 bg-cream-200 dark:bg-plum-700/50 mx-1" aria-hidden="true" />

        <button
          onClick={() => setAiOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-plum-900 text-cream-50 text-[12px] font-semibold tracking-tight hover:bg-plum-700 transition-all duration-150 hover:scale-[1.03] shadow-soft"
        >
          <Sparkles size={12} className="text-amber-300" />
          Pull
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-full text-[12px] font-medium text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
          >
            {activeLabel}
            <ChevronDown size={12} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-2 min-w-[140px] py-1 bg-white dark:bg-plum-900 border border-cream-200 dark:border-plum-700/40 rounded-xl shadow-float">
              {LEVELS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => {
                    setLevel(l.key);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] transition ${
                    activeLevel === l.key
                      ? "bg-plum-50 dark:bg-plum-800/50 text-plum-700 dark:text-plum-200 font-semibold"
                      : "text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/40"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="w-px h-5 bg-cream-200 dark:bg-plum-700/50 mx-1" aria-hidden="true" />

        <button
          onClick={() => setCollapsed(true)}
          title="Hide toolbar"
          className="w-8 h-8 inline-flex items-center justify-center rounded-full text-ink-500 dark:text-cream-200/50 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
        >
          <X size={13} />
        </button>
      </div>

      <AiPanel open={aiOpen} onOpenChange={setAiOpen} />
    </>
  );
});
