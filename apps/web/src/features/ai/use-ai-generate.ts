import { useState, useRef, useCallback } from "react";
import type { Level } from "@archlet/shared";
import type { ProviderName } from "./use-api-keys";
import { useApiKeys } from "./use-api-keys";
import { getClient } from "./providers";
import { buildSystemPrompt } from "./prompts/system-prompt";
import { applyToolCall } from "./apply-tool-call";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import type { ToolCall } from "./providers/ai-client";

interface GenerateOpts {
  provider: ProviderName;
  model: string;
  prompt: string;
  level: Level;
}

interface UseAiGenerateResult {
  generate: (opts: GenerateOpts) => Promise<void>;
  cancel: () => void;
  isStreaming: boolean;
  currentAction: string;
  nodeCount: number;
  error: string | null;
}

function getLabelFromToolCall(tc: ToolCall): string | undefined {
  if (tc.name === "add_node") return tc.args.label;
  if (tc.name === "add_edge") return tc.args.label;
  if (tc.name === "update_node") return tc.args.label;
  return undefined;
}

function friendlyActionLabel(toolName: string, label?: string): string {
  switch (toolName) {
    case "add_node": return `Adding ${label ?? "node"}…`;
    case "add_edge": return `Connecting ${label ?? "nodes"}…`;
    case "update_node": return `Updating ${label ?? "node"}…`;
    case "remove_node": return `Removing node…`;
    case "remove_edge": return `Removing edge…`;
    default: return "Processing…";
  }
}

export function useAiGenerate(): UseAiGenerateResult {
  const { getKeyForProvider } = useApiKeys();
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [nodeCount, setNodeCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const generate = useCallback(async (opts: GenerateOpts) => {
    const apiKey = getKeyForProvider(opts.provider);
    if (!apiKey) {
      setError(`No API key set for ${opts.provider}`);
      return;
    }

    setError(null);
    setIsStreaming(true);
    setCurrentAction("Starting…");
    setNodeCount(0);

    const abort = new AbortController();
    abortRef.current = abort;

    // Pause temporal so entire generation = one undo entry
    const temporal = useDiagramStore.temporal.getState();
    temporal.pause();

    let addedNodes = 0;

    try {
      const client = getClient(opts.provider);
      const systemPrompt = buildSystemPrompt(opts.level);

      for await (const toolCall of client.stream({
        apiKey,
        model: opts.model,
        systemPrompt,
        userPrompt: opts.prompt,
        signal: abort.signal,
      })) {
        if (abort.signal.aborted) break;

        const label = getLabelFromToolCall(toolCall);
        setCurrentAction(friendlyActionLabel(toolCall.name, label));

        applyToolCall(toolCall);

        if (toolCall.name === "add_node") {
          addedNodes++;
          setNodeCount(addedNodes);
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setCurrentAction("Cancelled");
      } else {
        const msg = (err as Error).message ?? "Generation failed";
        setError(
          msg.includes("Invalid API key") ? "Invalid API key — check your settings" :
          msg.includes("Rate limited") ? "Rate limited — wait and retry" :
          msg.includes("Failed to fetch") ? "Connection failed — check network" :
          msg
        );
        setCurrentAction("");
      }
    } finally {
      temporal.resume();
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [getKeyForProvider]);

  return { generate, cancel, isStreaming, currentAction, nodeCount, error };
}
