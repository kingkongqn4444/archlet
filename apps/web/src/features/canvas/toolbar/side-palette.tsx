import React from "react";
import {
  User, Zap, Database, Cpu, ListOrdered,
  HardDrive, Globe, SplitSquareHorizontal, Cog, ExternalLink,
} from "lucide-react";
import type { NodeType } from "@archlet/shared";

type PaletteItem = { type: NodeType; icon: React.ReactNode; label: string };

const ITEMS: PaletteItem[] = [
  { type: "user", icon: <User size={16} />, label: "User" },
  { type: "api", icon: <Zap size={16} />, label: "API" },
  { type: "database", icon: <Database size={16} />, label: "DB" },
  { type: "cache", icon: <Cpu size={16} />, label: "Cache" },
  { type: "queue", icon: <ListOrdered size={16} />, label: "Queue" },
  { type: "storage", icon: <HardDrive size={16} />, label: "Storage" },
  { type: "cdn", icon: <Globe size={16} />, label: "CDN" },
  { type: "load_balancer", icon: <SplitSquareHorizontal size={16} />, label: "LB" },
  { type: "worker", icon: <Cog size={16} />, label: "Worker" },
  { type: "external", icon: <ExternalLink size={16} />, label: "Ext" },
];

export const SidePalette = React.memo(function SidePalette() {
  function onDragStart(e: React.DragEvent, type: NodeType) {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-1.5">
      {ITEMS.map(({ type, icon, label }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          title={label}
          className="w-10 h-10 flex flex-col items-center justify-center rounded-lg cursor-grab hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 gap-0.5 select-none"
        >
          {icon}
          <span className="text-[9px] leading-none">{label}</span>
        </div>
      ))}
    </div>
  );
});
