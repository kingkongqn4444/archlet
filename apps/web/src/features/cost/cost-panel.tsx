import React, { useState } from "react";
import { X, RefreshCw, ChevronDown, ChevronRight, DollarSign } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useCostStore, type NodeCost } from "./cost-store";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER = ["api", "database", "cache", "queue", "storage", "cdn", "load_balancer", "worker", "external", "user"];

function fmt(n: number): string {
  if (n === 0) return "$0";
  if (n < 1) return `$${n.toFixed(2)}`;
  return `$${Math.round(n).toLocaleString()}`;
}

function totalColor(monthly: number): string {
  if (monthly < 500) return "text-emerald-600 dark:text-emerald-400";
  if (monthly < 2000) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function barColor(type: string): string {
  const map: Record<string, string> = {
    database: "bg-plum-500",
    cache: "bg-amber-500",
    queue: "bg-blue-500",
    api: "bg-emerald-500",
    worker: "bg-violet-500",
    storage: "bg-orange-400",
    cdn: "bg-cyan-500",
    load_balancer: "bg-rose-400",
    external: "bg-gray-400",
    user: "bg-gray-300",
  };
  return map[type] ?? "bg-ink-300";
}

function groupByCategory(breakdown: NodeCost[]): Record<string, NodeCost[]> {
  const groups: Record<string, NodeCost[]> = {};
  for (const node of breakdown) {
    const cat = node.type;
    groups[cat] = groups[cat] ?? [];
    groups[cat].push(node);
  }
  return groups;
}

function NodeRow({ node }: { node: NodeCost }) {
  const [expanded, setExpanded] = useState(false);
  const hasItems = node.lineItems.length > 1 || (node.lineItems.length === 1 && (node.lineItems[0]?.monthly ?? 0) > 0);

  return (
    <div className="rounded-lg border border-cream-200 dark:border-plum-700/40 overflow-hidden">
      <button
        onClick={() => hasItems && setExpanded((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-left transition",
          hasItems ? "hover:bg-cream-100 dark:hover:bg-plum-800/40" : "cursor-default"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {hasItems ? (
            expanded ? <ChevronDown size={12} className="shrink-0 text-ink-400" /> : <ChevronRight size={12} className="shrink-0 text-ink-400" />
          ) : (
            <span className="w-3" />
          )}
          <span className="text-[12px] font-medium text-ink-800 dark:text-cream-100 truncate">{node.label}</span>
          <span className="text-[10px] text-ink-400 dark:text-cream-200/40 shrink-0">{node.variant || node.type}</span>
        </div>
        <span className="text-[12px] font-semibold text-ink-700 dark:text-cream-100 shrink-0 ml-2">
          {fmt(node.monthly)}<span className="text-[10px] font-normal text-ink-400 dark:text-cream-200/40">/mo</span>
        </span>
      </button>

      {expanded && hasItems && (
        <div className="border-t border-cream-200 dark:border-plum-700/40 px-3 py-2 flex flex-col gap-1 bg-cream-50 dark:bg-plum-950/60">
          {node.lineItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-ink-500 dark:text-cream-200/60 truncate">{item.label}</span>
              <span className="text-[11px] font-medium text-ink-600 dark:text-cream-200/80 shrink-0">{fmt(item.monthly)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CostPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CostPanel({ open, onOpenChange }: CostPanelProps) {
  const total = useCostStore((s) => s.total);
  const breakdown = useCostStore((s) => s.breakdown);
  const computeNow = useCostStore((s) => s.computeNow);

  const yearly = total * 12;
  const groups = groupByCategory(breakdown);

  // Bar chart data — categories sorted, with totals
  const chartData = CATEGORY_ORDER
    .map((cat) => {
      const nodes = groups[cat] ?? [];
      const catTotal = nodes.reduce((t, n) => t + n.monthly, 0);
      return { cat, total: catTotal };
    })
    .filter((d) => d.total > 0);
  const maxBar = Math.max(...chartData.map((d) => d.total), 1);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] flex flex-col p-0 bg-cream-50 dark:bg-plum-950">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200 dark:border-plum-700/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40">
              <DollarSign size={14} className="text-amber-600 dark:text-amber-400" />
            </span>
            <span className="text-[14px] font-semibold text-ink-900 dark:text-cream-50 tracking-tight">
              Cost Estimate
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={computeNow}
              title="Refresh"
              className="w-7 h-7 inline-flex items-center justify-center rounded-full text-ink-500 dark:text-cream-200/50 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
            >
              <RefreshCw size={13} />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              title="Close"
              className="w-7 h-7 inline-flex items-center justify-center rounded-full text-ink-500 dark:text-cream-200/50 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
          {/* Total */}
          <div className="text-center">
            <div className={cn("text-4xl font-bold tracking-tight", totalColor(total))}>
              {fmt(total)}
              <span className="text-lg font-normal text-ink-400 dark:text-cream-200/40">/mo</span>
            </div>
            <div className="text-[12px] text-ink-400 dark:text-cream-200/40 mt-0.5">
              ≈ {fmt(yearly)}/yr
            </div>
          </div>

          {/* Bar chart */}
          {chartData.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 dark:text-cream-200/50">
                By category
              </span>
              {chartData.map(({ cat, total: catTotal }) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-[11px] text-ink-500 dark:text-cream-200/60 w-20 shrink-0 capitalize">
                    {cat.replace("_", " ")}
                  </span>
                  <div className="flex-1 h-4 bg-cream-200 dark:bg-plum-800/60 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", barColor(cat))}
                      style={{ width: `${(catTotal / maxBar) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-ink-600 dark:text-cream-200/70 w-14 text-right shrink-0">
                    {fmt(catTotal)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Node breakdown */}
          {breakdown.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 dark:text-cream-200/50">
                Per node
              </span>
              {breakdown
                .slice()
                .sort((a, b) => b.monthly - a.monthly)
                .map((node) => (
                  <NodeRow key={node.nodeId} node={node} />
                ))}
            </div>
          ) : (
            <p className="text-center text-[12px] text-ink-400 dark:text-cream-200/40 mt-4">
              Add nodes to see cost estimates
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 border-t border-cream-200 dark:border-plum-700/40">
          <p className="text-[10px] text-ink-400 dark:text-cream-200/40 leading-relaxed">
            Estimates based on AWS us-east-1 list pricing — actual cost varies by usage, reserved instances, and region.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
