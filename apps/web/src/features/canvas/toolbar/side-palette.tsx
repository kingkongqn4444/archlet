import React from "react";
import {
  User, Zap, Database, Cpu, ListOrdered,
  HardDrive, Globe, SplitSquareHorizontal, Cog, ExternalLink,
} from "lucide-react";
import type { NodeType } from "@archlet/shared";

type PaletteItem = {
  type: NodeType;
  icon: React.ReactNode;
  label: string;
  accent: string; // bg + icon color for hover
};

type Group = { title: string; items: PaletteItem[] };

const GROUPS: Group[] = [
  {
    title: "Actors",
    items: [
      { type: "user", icon: <User size={16} />, label: "User", accent: "group-hover:bg-rose-100 group-hover:text-rose-600" },
      { type: "external", icon: <ExternalLink size={16} />, label: "External", accent: "group-hover:bg-slate-100 group-hover:text-slate-600" },
    ],
  },
  {
    title: "Compute",
    items: [
      { type: "api", icon: <Zap size={16} />, label: "API", accent: "group-hover:bg-plum-100 group-hover:text-plum-600" },
      { type: "worker", icon: <Cog size={16} />, label: "Worker", accent: "group-hover:bg-indigo-100 group-hover:text-indigo-600" },
    ],
  },
  {
    title: "Storage",
    items: [
      { type: "database", icon: <Database size={16} />, label: "Database", accent: "group-hover:bg-cyan-100 group-hover:text-cyan-600" },
      { type: "cache", icon: <Cpu size={16} />, label: "Cache", accent: "group-hover:bg-amber-100 group-hover:text-amber-600" },
      { type: "storage", icon: <HardDrive size={16} />, label: "Storage", accent: "group-hover:bg-emerald-100 group-hover:text-emerald-600" },
    ],
  },
  {
    title: "Network",
    items: [
      { type: "cdn", icon: <Globe size={16} />, label: "CDN", accent: "group-hover:bg-sky-100 group-hover:text-sky-600" },
      { type: "load_balancer", icon: <SplitSquareHorizontal size={16} />, label: "Load balancer", accent: "group-hover:bg-violet-100 group-hover:text-violet-600" },
      { type: "queue", icon: <ListOrdered size={16} />, label: "Queue", accent: "group-hover:bg-orange-100 group-hover:text-orange-600" },
    ],
  },
];

function PaletteTile({ item }: { item: PaletteItem }) {
  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/reactflow", item.type);
    e.dataTransfer.effectAllowed = "move";
  }
  return (
    <div
      draggable
      onDragStart={onDragStart}
      title={item.label}
      className="group relative w-10 h-10 flex items-center justify-center rounded-xl cursor-grab active:cursor-grabbing text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition-colors select-none"
    >
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${item.accent} dark:group-hover:bg-white/10`}>
        {item.icon}
      </span>
      {/* Tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full ml-2 px-2 py-1 rounded-md text-[11px] font-medium bg-ink-900 text-cream-50 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 shadow-soft"
      >
        {item.label}
      </span>
    </div>
  );
}

export const SidePalette = React.memo(function SidePalette() {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 p-1.5 bg-white/95 dark:bg-plum-900/90 backdrop-blur-md border border-cream-200 dark:border-plum-700/40 rounded-2xl shadow-float">
      {GROUPS.map((group, gi) => (
        <React.Fragment key={group.title}>
          {gi > 0 && (
            <div className="h-px mx-2 my-0.5 bg-cream-200 dark:bg-plum-700/40" aria-hidden="true" />
          )}
          {group.items.map((item) => (
            <PaletteTile key={item.type} item={item} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
});
