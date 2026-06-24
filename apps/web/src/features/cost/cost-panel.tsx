import React, { useState } from "react";
import { X, RefreshCw, ChevronDown, ChevronRight, TrendingUp } from "lucide-react";
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
  if (monthly < 500) return "#34d399";   // emerald
  if (monthly < 2000) return "#fbbf24";  // amber
  return "#f87171";                       // red
}

const BAR_COLORS: Record<string, string> = {
  database: "#8b5cf6",
  cache:    "#f59e0b",
  queue:    "#3b82f6",
  api:      "#10b981",
  worker:   "#a78bfa",
  storage:  "#f97316",
  cdn:      "#06b6d4",
  load_balancer: "#f43f5e",
  external: "#6b7280",
  user:     "#374151",
};

function groupByCategory(breakdown: NodeCost[]): Record<string, NodeCost[]> {
  const groups: Record<string, NodeCost[]> = {};
  for (const node of breakdown) {
    const arr = (groups[node.type] = groups[node.type] ?? []);
    arr.push(node);
  }
  return groups;
}

function NodeRow({ node }: { node: NodeCost }) {
  const [expanded, setExpanded] = useState(false);
  const hasItems = node.lineItems.length > 1 || (node.lineItems.length === 1 && (node.lineItems[0]?.monthly ?? 0) > 0);
  const barColor = BAR_COLORS[node.type] ?? "#6b7280";

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <button
        onClick={() => hasItems && setExpanded((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-all duration-150",
          hasItems ? "hover:bg-white/[0.04]" : "cursor-default"
        )}
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Category color dot */}
          <span
            className="w-1.5 h-5 rounded-full shrink-0"
            style={{ background: barColor, opacity: 0.8 }}
          />
          <span className="text-[12px] font-medium text-white/80 truncate">{node.label}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-md shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
          >
            {node.variant || node.type}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-[12px] font-semibold text-white/80">
            {fmt(node.monthly)}
            <span className="text-[10px] font-normal text-white/25">/mo</span>
          </span>
          {hasItems && (
            expanded
              ? <ChevronDown size={11} className="text-white/25" />
              : <ChevronRight size={11} className="text-white/25" />
          )}
        </div>
      </button>

      {expanded && hasItems && (
        <div
          className="px-3.5 py-2.5 flex flex-col gap-1.5"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          {node.lineItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-white/35 truncate">{item.label}</span>
              <span className="text-[11px] font-medium text-white/55 shrink-0">{fmt(item.monthly)}</span>
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

  const chartData = CATEGORY_ORDER
    .map((cat) => {
      const nodes = groups[cat] ?? [];
      const catTotal = nodes.reduce((t, n) => t + n.monthly, 0);
      return { cat, total: catTotal };
    })
    .filter((d) => d.total > 0);
  const maxBar = Math.max(...chartData.map((d) => d.total), 1);

  const color = totalColor(total);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} noBackdrop>
      <SheetContent
        className="w-[400px] flex flex-col p-0"
        style={{
          background: "linear-gradient(180deg, #1a0f2e 0%, #140c24 100%)",
          borderLeft: "1px solid rgba(139, 92, 246, 0.15)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.1) 100%)",
                border: "1px solid rgba(251,191,36,0.25)",
                boxShadow: "0 0 12px rgba(251,191,36,0.15)",
              }}
            >
              <TrendingUp size={15} className="text-amber-300" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white tracking-tight leading-none">Cost Estimate</div>
              <div className="text-[10px] text-white/30 mt-0.5">AWS us-east-1 list pricing</div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={computeNow}
              title="Refresh"
              className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all duration-150"
            >
              <RefreshCw size={12} />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              title="Close"
              className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all duration-150"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

          {/* Total hero card */}
          <div
            className="rounded-2xl px-5 py-5 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="text-[42px] font-bold tracking-tight leading-none"
              style={{ color }}
            >
              {fmt(total)}
            </div>
            <div className="text-[13px] text-white/30 mt-1.5 font-medium">per month</div>
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[11px] font-medium"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.25)" }}>≈</span>
              {fmt(yearly)} / year
            </div>
          </div>

          {/* Bar chart — by category */}
          {chartData.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-0.5">
                By category
              </span>
              <div className="flex flex-col gap-1.5">
                {chartData.map(({ cat, total: catTotal }) => {
                  const barPct = (catTotal / maxBar) * 100;
                  const barCol = BAR_COLORS[cat] ?? "#6b7280";
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-[11px] text-white/40 w-[72px] shrink-0 capitalize truncate">
                        {cat.replace("_", " ")}
                      </span>
                      <div
                        className="flex-1 h-[6px] rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${barPct}%`,
                            background: barCol,
                            boxShadow: `0 0 8px ${barCol}60`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-white/55 w-12 text-right shrink-0">
                        {fmt(catTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Per-node breakdown */}
          {breakdown.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25 px-0.5">
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
            <div className="flex flex-col items-center gap-3 py-8">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <TrendingUp size={18} className="text-white/20" />
              </div>
              <p className="text-[12px] text-white/25 text-center">
                Add nodes to see cost estimates
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="shrink-0 px-5 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[10px] text-white/20 leading-relaxed">
            Estimates based on AWS us-east-1 list pricing. Actual cost varies by usage, reserved instances, and region.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
