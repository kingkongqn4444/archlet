import { useCallback, useEffect, useRef } from "react";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { useSimStore } from "@/features/simulate/sim-store";
import { runRules, calculateScore } from "./engine";
import { useReviewStore } from "./review-store";

export function useReview() {
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);
  const edgeMetrics = useSimStore((s) => s.edgeMetrics);
  const isRunning = useSimStore((s) => s.isRunning);
  const { setFindings, open } = useReviewStore();

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runReview = useCallback(() => {
    const hasMetrics =
      Object.keys(nodeMetrics).length > 0 ||
      Object.keys(edgeMetrics).length > 0;

    const simMetrics = hasMetrics ? { nodeMetrics, edgeMetrics } : null;

    const findings = runRules({ nodes, edges }, simMetrics);
    const { score, grade } = calculateScore(findings);
    setFindings(findings, score, grade);
    open();
  }, [nodes, edges, nodeMetrics, edgeMetrics, setFindings, open]);

  // Auto-trigger 3s after sim starts running
  useEffect(() => {
    if (isRunning) {
      autoTimerRef.current = setTimeout(() => {
        const findings = runRules(
          { nodes, edges },
          { nodeMetrics, edgeMetrics }
        );
        const { score, grade } = calculateScore(findings);
        setFindings(findings, score, grade);
        // Don't force-open panel on auto-run — just update badge
      }, 3000);
    } else {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    }
    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  return { runReview };
}
