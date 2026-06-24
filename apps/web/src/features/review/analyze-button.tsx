import React from "react";
import { Stethoscope } from "lucide-react";
import { useReview } from "./use-review";
import { useReviewStore } from "./review-store";
import type { Severity } from "./types";
import { cn } from "@/lib/utils";

const DOT_COLOR: Record<Severity, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  suggestion: "bg-blue-500",
  good: "bg-emerald-500",
};

function worstSeverity(findings: { severity: Severity }[]): Severity | null {
  if (findings.some((f) => f.severity === "critical")) return "critical";
  if (findings.some((f) => f.severity === "warning")) return "warning";
  if (findings.some((f) => f.severity === "suggestion")) return "suggestion";
  if (findings.length > 0) return "good";
  return null;
}

export const AnalyzeButton = React.memo(function AnalyzeButton() {
  const { runReview } = useReview();
  const findings = useReviewStore((s) => s.findings);
  const isOpen = useReviewStore((s) => s.isOpen);

  const worst = worstSeverity(findings);
  const showBadge = findings.length > 0 && !isOpen && worst !== null;

  return (
    <div className="relative">
      <button
        onClick={runReview}
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-4 rounded-full",
          "text-[12px] font-semibold tracking-tight",
          "transition-all duration-150 hover:scale-[1.03] shadow-soft",
          "bg-plum-900 text-cream-50 hover:bg-plum-700"
        )}
        title="Analyze design"
      >
        <Stethoscope size={12} />
        Analyze
      </button>

      {showBadge && (
        <span
          className={cn(
            "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-plum-900",
            DOT_COLOR[worst!]
          )}
          aria-label={`${findings.length} findings`}
        />
      )}
    </div>
  );
});
