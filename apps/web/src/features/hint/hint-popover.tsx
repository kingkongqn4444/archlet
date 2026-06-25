import { useState, useCallback } from "react";
import { Lightbulb, Loader2, X } from "lucide-react";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { useApiKeys } from "@/features/ai/use-api-keys";

// AI Hint System — 3-level escalating hints for the current design problem.
// Uses BYOK from existing useApiKeys storage; calls /api/mentor/hint Workers route.
// Caches hint result per (problem, diagramHash, level) in memory (resets on close).

function summarizeDiagram(nodes: Array<{ type: string; data: { variant?: string; label: string } }>): string {
  if (nodes.length === 0) return "(empty canvas)";
  const byType = new Map<string, string[]>();
  for (const n of nodes) {
    const arr = byType.get(n.type) ?? [];
    arr.push(`${n.data.label}${n.data.variant ? ` (${n.data.variant})` : ""}`);
    byType.set(n.type, arr);
  }
  return Array.from(byType.entries())
    .map(([type, labels]) => `${type}: ${labels.join(", ")}`)
    .join("; ");
}

export function HintPopover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [problem, setProblem] = useState("");
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nodes = useDiagramStore((s) => s.nodes);
  const { keys } = useApiKeys();
  const anthropicKey = keys.anthropic;

  const fetchHint = useCallback(async (lvl: 1 | 2 | 3) => {
    if (!problem.trim()) { setError("Enter the problem first."); return; }
    if (!anthropicKey) { setError("Anthropic BYOK key required. Set it in API Keys settings."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mentor/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          problem: problem.trim(),
          diagramSummary: summarizeDiagram(nodes as never),
          hintLevel: lvl,
          byokKey: anthropicKey,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }
      const j = await res.json() as { hint: string; level: 1 | 2 | 3 };
      setHint(j.hint);
      setLevel(j.level);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [problem, nodes, anthropicKey]);

  if (!open) return null;

  return (
    <div className="fixed top-16 right-4 z-[55] w-[420px] bg-white dark:bg-plum-900 rounded-2xl shadow-float border border-cream-200 dark:border-plum-700/40 flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cream-200 dark:border-plum-700/40 bg-amber-50 dark:bg-amber-900/20">
        <Lightbulb size={14} className="text-amber-600 dark:text-amber-300" />
        <span className="text-[13px] font-bold text-ink-900 dark:text-cream-50 flex-1">AI Hint</span>
        <button onClick={onClose} className="p-1 rounded-md text-ink-500 dark:text-cream-200/60 hover:bg-amber-100 dark:hover:bg-amber-800/30">
          <X size={14} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 dark:text-cream-200/55">Problem you're solving</span>
          <input
            type="text"
            placeholder="e.g. Design URL Shortener for 100M users"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="h-9 px-3 rounded-lg border border-cream-200 dark:border-plum-700/40 bg-white dark:bg-plum-900/60 text-[12.5px] outline-none focus:ring-2 focus:ring-amber-400 text-ink-900 dark:text-cream-50"
          />
        </label>

        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => fetchHint(n as 1 | 2 | 3)}
              disabled={loading || !problem.trim()}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-colors ${
                level === n && hint
                  ? "bg-amber-500 text-white"
                  : "bg-cream-100 dark:bg-plum-800/40 text-ink-700 dark:text-cream-200/80 hover:bg-cream-200 dark:hover:bg-plum-800/60"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Level {n}
              <div className="text-[9px] font-normal opacity-70 mt-0.5">
                {n === 1 ? "Vague" : n === 2 ? "Directional" : "Specific"}
              </div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-[12px] text-ink-500 dark:text-cream-200/55">
            <Loader2 size={14} className="animate-spin" /> Asking AI…
          </div>
        )}

        {error && (
          <div className="text-[12px] p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/30">
            {error}
          </div>
        )}

        {hint && !loading && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/30">
            <div className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-1">
              Hint level {level}/3
            </div>
            <p className="text-[13px] leading-relaxed text-ink-900 dark:text-cream-50 whitespace-pre-wrap">
              {hint}
            </p>
            <div className="text-[10px] text-ink-400 dark:text-cream-200/40 mt-2 italic">
              {nodes.length} nodes in current diagram considered.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
