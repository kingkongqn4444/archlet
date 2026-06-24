import React, { useState } from "react";
import {
  X,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Activity,
  Network,
  Zap,
  BookOpen,
  Database,
  ExternalLink,
} from "lucide-react";
import { useReviewStore } from "./review-store";
import { useReview } from "./use-review";
import type { Finding, FindingCategory, Severity } from "./types";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { cn } from "@/lib/utils";

// ── helpers ────────────────────────────────────────────────────────────────

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

function CategoryIcon({ cat }: { cat: FindingCategory }) {
  const cls = "shrink-0 text-ink-400 dark:text-cream-200/40";
  switch (cat) {
    case "reliability": return <Activity size={12} className={cls} />;
    case "topology":    return <Network size={12} className={cls} />;
    case "performance": return <Zap size={12} className={cls} />;
    case "best-practice": return <BookOpen size={12} className={cls} />;
    case "capacity":    return <Database size={12} className={cls} />;
  }
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

// ── FindingCard ────────────────────────────────────────────────────────────

function FindingCard({ finding }: { finding: Finding }) {
  const nodes = useDiagramStore((s) => s.nodes);
  const { highlightFinding, highlightedNodeIds } = useReviewStore();
  const isActive = finding.nodeIds.some((id) => highlightedNodeIds.has(id));

  const nodeNames = finding.nodeIds
    .map((id) => {
      const n = nodes.find((x) => x.id === id);
      return n ? String(n.data.label ?? n.type) : null;
    })
    .filter(Boolean) as string[];

  return (
    <button
      type="button"
      className={cn(
        "w-full text-left rounded-xl border p-3 transition-all duration-150",
        "bg-white dark:bg-plum-900/60",
        isActive
          ? "border-plum-400 dark:border-plum-500 ring-1 ring-plum-400/30"
          : "border-cream-200 dark:border-plum-700/40 hover:border-plum-300 dark:hover:border-plum-600"
      )}
      onClick={() => highlightFinding(isActive ? null : finding)}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{SEVERITY_ICON[finding.severity]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryIcon cat={finding.category} />
            <span className="text-[12px] font-semibold text-ink-900 dark:text-cream-50 leading-snug">
              {finding.title}
            </span>
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

          {finding.docsUrl && (
            <a
              href={finding.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-[11px] text-plum-600 dark:text-plum-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Learn more
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </button>
  );
}

// ── SeverityBucket ─────────────────────────────────────────────────────────

const SEVERITIES: Severity[] = ["critical", "warning", "suggestion", "good"];

function SeverityBucket({
  severity,
  findings,
}: {
  severity: Severity;
  findings: Finding[];
}) {
  const [open, setOpen] = useState(severity === "critical" || severity === "warning");
  if (findings.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        className="w-full flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-cream-50 dark:hover:bg-plum-800/30 transition"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <ChevronDown size={12} className="text-ink-400 shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-ink-400 shrink-0" />
        )}
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
          {findings.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ReviewPanel ────────────────────────────────────────────────────────────

export function ReviewPanel() {
  const { isOpen, close, findings, score, grade } = useReviewStore();
  const { runReview } = useReview();

  const byBucket = SEVERITIES.reduce<Record<Severity, Finding[]>>(
    (acc, s) => {
      acc[s] = findings.filter((f) => f.severity === s);
      return acc;
    },
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
        isOpen
          ? "translate-x-0 animate-slide-in-right"
          : "translate-x-[calc(100%+16px)]"
      )}
      aria-hidden={!isOpen}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-cream-200 dark:border-plum-700/40 shrink-0">
        <span className="flex-1 text-[13px] font-semibold tracking-tight text-ink-900 dark:text-cream-50">
          Design Review
        </span>
        <button
          onClick={runReview}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium text-ink-600 dark:text-cream-200/70 hover:bg-cream-100 dark:hover:bg-plum-800 transition"
          title="Re-run analysis"
        >
          <RefreshCw size={11} />
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
