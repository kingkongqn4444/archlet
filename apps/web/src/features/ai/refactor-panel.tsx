import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Wand2, Loader2, Play } from "lucide-react";
import { useApiKeys } from "./use-api-keys";
import { getClient } from "./providers";
import { applyToolCall } from "./apply-tool-call";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";

// AI Refactor Agent — given a goal + current diagram, AI emits patch tool
// calls (add/remove/update_node + add/remove_edge). User reviews + applies.
// Reuses existing tool infra (TOOL_DEFINITIONS, applyToolCall).

const PRESET_GOALS = [
  "Make this production-ready (add monitoring, caching, replicas)",
  "Optimize for 10M users scale",
  "Add high availability (multi-AZ, failover, replicas)",
  "Reduce single points of failure",
  "Add security layer (WAF, secrets, encrypted DB)",
  "Add observability (logs, metrics, tracing)",
];

function buildRefactorPrompt(goal: string): string {
  return `You are an expert system architect. The user has a partial diagram and wants you to IMPROVE it.

Goal: ${goal}

Use tool calls to:
- add_node for new components (use unique ids; choose appropriate type)
- add_edge to connect new components to existing ones (and to each other)
- update_node to clarify labels/descriptions of existing nodes
- remove_node / remove_edge ONLY if the component is genuinely redundant

CRITICAL:
- Output ONLY tool calls. NO prose.
- Reference existing node ids exactly when creating edges/updates.
- Every new node MUST have at least one edge connecting it to the existing graph.
- Position new nodes at x ∈ [0, 1200], y ∈ [0, 800]; avoid overlapping existing nodes.
- Make 3-10 changes; don't rewrite the whole diagram.`;
}

function diagramSnapshot(nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: { label: string; variant?: string } }>): string {
  return JSON.stringify(
    nodes.map((n) => ({
      id: n.id, type: n.type, label: n.data.label,
      variant: n.data.variant, x: Math.round(n.position.x), y: Math.round(n.position.y),
    })),
    null, 2
  );
}

export function RefactorPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [goal, setGoal] = useState("");
  const [running, setRunning] = useState(false);
  const [changes, setChanges] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { keys, getKeyForProvider } = useApiKeys();
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);

  const run = useCallback(async () => {
    if (!goal.trim()) { setError("Enter a goal first."); return; }
    const provider = keys.defaultProvider;
    const apiKey = getKeyForProvider(provider);
    if (!apiKey) { setError(`No API key for ${provider}. Add one in Settings.`); return; }
    if (nodes.length === 0) { setError("Add some nodes to the canvas first."); return; }

    setRunning(true);
    setError(null);
    setChanges([]);
    abortRef.current = new AbortController();

    try {
      const client = getClient(provider);
      const userPrompt = `Current diagram:\n${diagramSnapshot(nodes as never)}\n\nEdges:\n${JSON.stringify(edges.map((e) => ({ source: e.source, target: e.target })))}\n\nGoal: ${goal.trim()}`;

      for await (const tc of client.stream({
        apiKey,
        model: keys.defaultModel,
        systemPrompt: buildRefactorPrompt(goal.trim()),
        userPrompt,
        signal: abortRef.current.signal,
      })) {
        if (abortRef.current.signal.aborted) break;
        applyToolCall(tc);
        const desc =
          tc.name === "add_node" ? `+ Added ${tc.args.type} "${tc.args.label}"` :
          tc.name === "add_edge" ? `+ Connected ${tc.args.source} → ${tc.args.target}${tc.args.label ? ` (${tc.args.label})` : ""}` :
          tc.name === "update_node" ? `~ Updated ${tc.args.id}` :
          tc.name === "remove_node" ? `- Removed ${tc.args.id}` :
          tc.name === "remove_edge" ? `- Removed edge ${tc.args.id}` : "";
        setChanges((prev) => [...prev, desc]);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }, [goal, nodes, edges, keys.defaultProvider, keys.defaultModel, getKeyForProvider]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={running ? undefined : onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-plum-900 rounded-2xl shadow-float overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-cream-200 dark:border-plum-700/40 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20">
          <Wand2 size={16} className="text-violet-600 dark:text-violet-300" />
          <h2 className="text-[14px] font-bold text-ink-900 dark:text-cream-50 flex-1">AI Refactor</h2>
          <span className="text-[10px] text-ink-400 dark:text-cream-200/40">
            {nodes.length} nodes · {edges.length} edges
          </span>
          <button onClick={onClose} disabled={running} className="p-1 rounded-md text-ink-500 dark:text-cream-200/60 hover:bg-violet-100 dark:hover:bg-violet-800/30 disabled:opacity-30">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 dark:text-cream-200/55">
                Refactor goal
              </span>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Make this production-ready at 10M users"
                disabled={running}
                rows={3}
                className="px-3 py-2 rounded-lg border border-cream-200 dark:border-plum-700/40 bg-white dark:bg-plum-900/60 text-[13px] outline-none focus:ring-2 focus:ring-violet-400 text-ink-900 dark:text-cream-50 disabled:opacity-50"
              />
            </label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  disabled={running}
                  className="text-[10.5px] px-2.5 py-1 rounded-full bg-cream-100 dark:bg-plum-800/40 text-ink-600 dark:text-cream-200/70 hover:bg-violet-100 dark:hover:bg-violet-800/40 transition-colors disabled:opacity-50"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-[12px] p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/30">
              {error}
            </div>
          )}

          {(changes.length > 0 || running) && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500 dark:text-cream-200/55">
                {running && <Loader2 size={12} className="animate-spin" />}
                Changes applied ({changes.length})
              </div>
              <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto rounded-lg border border-cream-200 dark:border-plum-700/40 bg-cream-50 dark:bg-plum-950/30 p-2">
                {changes.map((c, i) => (
                  <div key={i} className={`text-[12px] font-mono px-2 py-1 rounded ${
                    c.startsWith("+") ? "text-emerald-700 dark:text-emerald-300" :
                    c.startsWith("-") ? "text-red-700 dark:text-red-300" :
                    "text-amber-700 dark:text-amber-300"
                  }`}>
                    {c}
                  </div>
                ))}
                {changes.length === 0 && running && (
                  <div className="text-[12px] text-ink-400 dark:text-cream-200/40 italic px-2 py-1">
                    AI analyzing diagram…
                  </div>
                )}
              </div>
              <div className="text-[10px] text-ink-400 dark:text-cream-200/40 px-1 italic">
                Changes are applied live to the canvas. Use Undo (Cmd+Z) to revert.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-cream-200 dark:border-plum-700/40 bg-cream-50 dark:bg-plum-950/30">
          {running ? (
            <button onClick={cancel} className="px-4 py-2 rounded-lg text-[12px] font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60">
              Cancel
            </button>
          ) : (
            <button
              onClick={run}
              disabled={!goal.trim() || nodes.length === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Play size={12} /> Run Refactor
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
