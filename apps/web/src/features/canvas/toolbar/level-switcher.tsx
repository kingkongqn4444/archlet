import React from "react";
import { useDiagramStore } from "../store/diagram-store";
import type { Level } from "@archlet/shared";

const LEVELS: { key: Level; label: string }[] = [
  { key: "high", label: "High" },
  { key: "mid", label: "Mid" },
  { key: "low", label: "Low" },
];

export const LevelSwitcher = React.memo(function LevelSwitcher() {
  const activeLevel = useDiagramStore((s) => s.activeLevel);
  const setLevel = useDiagramStore((s) => s.setLevel);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md overflow-hidden">
      {LEVELS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setLevel(key)}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            activeLevel === key
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
});
