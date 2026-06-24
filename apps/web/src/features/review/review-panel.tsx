import React, { useState, useCallback } from "react";
import {
  X, RefreshCw, ChevronDown, ChevronRight,
  AlertCircle, AlertTriangle, Lightbulb, CheckCircle2,
  Activity, Network, Zap, BookOpen, Database, Sparkles,
  ArrowRight,
} from "lucide-react";
import { useReviewStore } from "./review-store";
import { useReview } from "./use-review";
import type { Finding, FindingCategory, Severity } from "./types";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { usePropertiesPanel } from "@/features/canvas/properties/use-properties-panel";
import { cn } from "@/lib/utils";

// ── constants ──────────────────────────────────────────────────────────────

const GRADE_STYLE: Record<string, string> = {
  A: "text-plum-700 dark:text-plum-300",
  B: "text-emerald-600 dark:text-emerald-400",
  C: "text-amber-600 dark:text-amber-400",
  D: "text-orange-600 dark:text-orange-400",
  F: "text-red-600 dark:text-red-400",
};

const SEVERITY_ICON: Record<Severity, React.ReactNode> = {
  critical: <AlertCircle size={14} className="text-red-500 shrink-0" />,
  warning: <AlertTriangle size={14} className="text-amber-500 shrink-0" />,
  suggestion: <Lightbulb size={14} className="text-blue-500 shrink-0" />,
  good: <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />,
};

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  suggestion: "Suggestion",
  good: "Good",
};

const SEVERITY_BUCKET_STYLE: Record<Severity, string> = {
  critical: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  suggestion: "text-blue-600 dark:text-blue-400",
  good: "text-emerald-600 dark:text-emerald-400",
};

// Left stripe color per severity
const SEVERITY_STRIPE: Record<Severity, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  suggestion: "bg-blue-400",
  good: "bg-emerald-500",
};

const SEVERITIES: Severity[] = ["critical", "warning", "suggestion", "good"];

// ── helpers ────────────────────────────────────────────────────────────────

function CategoryIcon({ cat }: { cat: FindingCategory }) {
  const cls = "shrink-0 text-ink-400 dark:text-cream-200/40";
  switch (cat) {
    case "reliability":   return <Activity size={12} className={cls} />;
    case "topology":      return <Network size={12} className={cls} />;
    case "performance":   return <Zap size={12} className={cls} />;
    case "best-practice": return <BookOpen size={12} className={cls} />;
    case "capacity":      return <Database size={12} className={cls} />;
    case "patterns":      return <Sparkles size={12} className={cls} />;
  }
}

// ── ImpactChip ─────────────────────────────────────────────────────────────

function ImpactChip({ impact, severity }: { impact: number; severity: Severity }) {
  const isGood = severity === "good";
  const label = isGood ? `+${impact} pts` : `${impact} pts`;
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums shrink-0",
        isGood
          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40"
          : impact <= -20
          ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/40"
          : impact <= -8
          ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/40"
          : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/40"
      )}
    >
      {label}
    </span>
  );
}

// ── ScoreCard ──────────────────────────────────────────────────────────────

function ScoreCard({ score, grade }: { score: number; grade: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-cream-50 dark:bg-plum-950/60 border-b border-cream-200 dark:border-plum-700/40">
      <div className={cn("text-5xl font-black tabular-nums leading-none", GRADE_STYLE[grade] ?? "text-ink-900 dark:text-cream-50")}>
        {grade}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-2xl font-bold tabular-nums text-ink-900 dark:text-cream-50 leading-none">
          {score}
        </span>
        <span className="text-[11px] text-ink-400 dark:text-cream-200/50 mt-0.5">
          Overall design score
        </span>
      </div>
    </div>
  );
}

// ── CategoryBarChart ───────────────────────────────────────────────────────

type CategoryCount = { cat: FindingCategory; label: string; count: number; worstSeverity: Severity | null };

const CAT_ORDER: FindingCategory[] = ["reliability", "topology", "performance", "best-practice", "capacity", "patterns"];
const CAT_LABEL: Record<FindingCategory, string> = {
  reliability: "Reliability",
  topology: "Topology",
  performance: "Performance",
  "best-practice": "Best Practice",
  capacity: "Capacity",
  patterns: "Patterns",
};

const BAR_COLOR: Record<Severity | "none", string> = {
  critical: "bg-red-500",
  warning: "bg-amber-400",
  suggestion: "bg-blue-400",
  good: "bg-emerald-400",
  none: "bg-cream-200 dark:bg-plum-700/40",
};

function worstSeverity(findings: Finding[]): Severity | null {
  if (findings.some((f) => f.severity === "critical")) return "critical";
  if (findings.some((f) => f.severity === "warning")) return "warning";
  if (findings.some((f) => f.severity === "suggestion")) return "suggestion";
  if (findings.some((f) => f.severity === "good")) return "good";
  return null;
}

function CategoryBarChart({ findings }: { findings: Finding[] }) {
  const counts: CategoryCount[] = CAT_ORDER.map((cat) => {
    const catFindings = findings.filter((f) => f.category === cat);
    return {
      cat,
      label: CAT_LABEL[cat],
      count: catFindings.length,
      worstSeverity: worstSeverity(catFindings),
    };
  }).filter((c) => c.count > 0);

  if (counts.length === 0) return null;

  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="px-4 py-3 border-b border-cream-200 dark:border-plum-700/40">
      <div className="text-[9px] font-bold uppercase tracking-widest text-ink-400 dark:text-cream-200/40 mb-2">
        Category breakdown
      </div>
      <div className="flex flex-col gap-1.5">
        {counts.map(({ cat, label, count, worstSeverity: ws }) => (
          <div key={cat} className="flex items-center gap-2">
            <div className="w-[80px] shrink-0 text-[10px] text-ink-500 dark:text-cream-200/50 truncate">
              {label}
            </div>
            <div className="flex-1 h-3 rounded-full bg-cream-100 dark:bg-plum-800/40 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  BAR_COLOR[ws ?? "none"]
                )}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <div className="w-4 text-right text-[10px] font-bold tabular-nums text-ink-500 dark:text-cream-200/50 shrink-0">
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FindingCard ────────────────────────────────────────────────────────────

function FindingCard({ finding }: { finding: Finding }) {
  const nodes = useDiagramStore((s) => s.nodes);
  const { highlightFinding, highlightedNodeIds } = useReviewStore();
  const openProperties = usePropertiesPanel((s) => s.open);
  const isActive = finding.nodeIds.some((id) => highlightedNodeIds.has(id));
  const isNegative = finding.severity !== "good";

  const nodeNames = finding.nodeIds
    .map((id) => {
      const n = nodes.find((x) => x.id === id);
      return n ? String(n.data.label ?? n.type) : null;
    })
    .filter(Boolean) as string[];

  function handleFixThis(e: React.MouseEvent) {
    e.stopPropagation();
    // Highlight finding nodes and open properties for first affected node
    highlightFinding(finding);
    const firstNodeId = finding.nodeIds[0];
    if (firstNodeId) openProperties(firstNodeId);
  }

  return (
    <div
      className={cn(
        "relative w-full text-left rounded-xl border overflow-hidden transition-all duration-150",
        "bg-white dark:bg-plum-900/60",
        isActive
          ? "border-plum-400 dark:border-plum-500 ring-1 ring-plum-400/30"
          : "border-cream-200 dark:border-plum-700/40 hover:border-plum-300 dark:hover:border-plum-600"
      )}
    >
      {/* Left severity stripe */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", SEVERITY_STRIPE[finding.severity])} />

      <button
        type="button"
        className="w-full text-left p-3 pl-4"
        onClick={() => highlightFinding(isActive ? null : finding)}
      >
        {/* Top row: icon + title + impact chip */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5">{SEVERITY_ICON[finding.severity]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5 flex-wrap justify-between">
              <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                <CategoryIcon cat={finding.category} />
                <span className="text-[12px] font-semibold text-ink-900 dark:text-cream-50 leading-snug">
                  {finding.title}
                </span>
              </div>
              {finding.impact !== undefined && (
                <ImpactChip impact={finding.impact} severity={finding.severity} />
              )}
            </div>

            <p className="text-[11px] text-ink-500 dark:text-cream-200/60 mt-1 leading-relaxed">
              {finding.description}
            </p>

            {nodeNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-[10px] text-ink-400 dark:text-cream-200/40 self-center">
                  Affects:
                </span>
                {nodeNames.map((name) => (
                  <span
                    key={name}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-plum-50 dark:bg-plum-800/50 text-plum-700 dark:text-plum-300 border border-plum-100 dark:border-plum-700/40"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {finding.suggestion && (
              <div className="mt-2 px-2.5 py-2 rounded-lg bg-cream-50 dark:bg-plum-950/60 border border-cream-200 dark:border-plum-700/30">
                <p className="text-[11px] text-ink-700 dark:text-cream-100 leading-relaxed">
                  <span className="font-semibold text-plum-700 dark:text-plum-300">
                    Suggestion:{" "}
                  </span>
                  {finding.suggestion}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fix this CTA — only for negative findings with affected nodes */}
        {isNegative && finding.nodeIds.length > 0 && (
          <div className="mt-2.5 flex justify-end">
            <button
              type="button"
              onClick={handleFixThis}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-plum-600 dark:text-plum-400 hover:text-plum-800 dark:hover:text-plum-200 transition-colors"
            >
              Fix this
              <ArrowRight size={11} />
            </button>
          </div>
        )}
      </button>
    </div>
  );
}

// ── SeverityBucket ─────────────────────────────────────────────────────────

function SeverityBucket({ severity, findings }: { severity: Severity; findings: Finding[] }) {
  const [open, setOpen] = useState(severity === "critical" || severity === "warning");
  if (findings.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        className="w-full flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-cream-50 dark:hover:bg-plum-800/30 transition"
        onClick={() => setOpen((v) => !v)}
      >
        {open
          ? <ChevronDown size={12} className="text-ink-400 shrink-0" />
          : <ChevronRight size={12} className="text-ink-400 shrink-0" />}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {SEVERITY_ICON[severity]}
          <span className={cn("text-[12px] font-semibold", SEVERITY_BUCKET_STYLE[severity])}>
            {SEVERITY_LABEL[severity]}
          </span>
          <span className="ml-auto text-[11px] font-bold tabular-nums text-ink-500 dark:text-cream-200/50">
            {findings.length}
          </span>
        </div>
      </button>
      {open && (
        <div className="flex flex-col gap-2 mt-1 ml-1">
          {findings.map((f) => <FindingCard key={f.id} finding={f} />)}
        </div>
      )}
    </div>
  );
}

// ── ReviewPanel ────────────────────────────────────────────────────────────

export function ReviewPanel() {
  const { isOpen, close, findings, score, grade } = useReviewStore();
  const { runReview } = useReview();
  const [spinning, setSpinning] = useState(false);

  const handleRerun = useCallback(() => {
    setSpinning(true);
    setTimeout(() => {
      runReview();
      setSpinning(false);
    }, 200);
  }, [runReview]);

  const byBucket = SEVERITIES.reduce<Record<Severity, Finding[]>>(
    (acc, s) => { acc[s] = findings.filter((f) => f.severity === s); return acc; },
    { critical: [], warning: [], suggestion: [], good: [] }
  );

  return (
    <div
      className={cn(
        "absolute top-16 right-3 bottom-24 z-30 w-[380px]",
        "bg-white dark:bg-plum-900/95 backdrop-blur-md",
        "rounded-2xl border border-cream-200 dark:border-plum-700/40 shadow-float",
        "flex flex-col overflow-hidden",
        "transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0 animate-slide-in-right" : "translate-x-[calc(100%+16px)]"
      )}
      aria-hidden={!isOpen}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-cream-200 dark:border-plum-700/40 shrink-0">
        <span className="flex-1 text-[13px] font-semibold tracking-tight text-ink-900 dark:text-cream-50">
          Design Review
        </span>
        <button
          onClick={handleRerun}
          disabled={spinning}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium text-ink-600 dark:text-cream-200/70 hover:bg-cream-100 dark:hover:bg-plum-800 transition disabled:opacity-60"
          title="Re-run analysis"
        >
          <RefreshCw size={11} className={spinning ? "animate-spin" : ""} />
          Re-run
        </button>
        <button
          onClick={close}
          className="p-1 rounded-full text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800 transition"
          aria-label="Close panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Score card */}
      <ScoreCard score={score} grade={grade} />

      {/* Category bar chart */}
      <CategoryBarChart findings={findings} />

      {/* Findings */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {findings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <p className="text-[13px] font-semibold text-ink-700 dark:text-cream-100">
              No issues found
            </p>
            <p className="text-[11px] text-ink-400 dark:text-cream-200/50">
              Your design looks solid. Great work!
            </p>
          </div>
        ) : (
          SEVERITIES.map((s) => (
            <SeverityBucket key={s} severity={s} findings={byBucket[s]} />
          ))
        )}
      </div>
    </div>
  );
}
