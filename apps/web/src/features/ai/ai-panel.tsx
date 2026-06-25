import { useState } from "react";
import { Loader2, X, Sparkles } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useApiKeys, type ProviderName } from "./use-api-keys";
import { useAiGenerate } from "./use-ai-generate";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import type { Level } from "@archlet/shared";
import { cn } from "@/lib/utils";

const PROVIDER_MODELS: Record<ProviderName, string[]> = {
  // Latest as of 2026-06. First entry = recommended default per provider.
  openai: [
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "o3",
    "o3-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
  ],
  anthropic: [
    "claude-opus-4-7",
    "claude-sonnet-4-6",
    "claude-haiku-4-5-20251001",
    "claude-3-7-sonnet-20250219",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
  ],
  deepseek: [
    "deepseek-chat",
    "deepseek-reasoner",
    "deepseek-v3",
    "deepseek-r1",
  ],
};

const LEVEL_LABELS: Record<Level, string> = {
  high: "High (3–7 nodes)",
  mid: "Mid (8–15 nodes)",
  low: "Low (16+ nodes)",
};

interface AiPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiPanel({ open, onOpenChange }: AiPanelProps) {
  const { keys, getKeyForProvider } = useApiKeys();
  const activeLevel = useDiagramStore((s) => s.activeLevel);

  const [provider, setProvider] = useState<ProviderName>(keys.defaultProvider);
  const [model, setModel] = useState<string>(
    PROVIDER_MODELS[keys.defaultProvider][0] ?? "gpt-4o"
  );
  const [level, setLevel] = useState<Level>(activeLevel);
  const [prompt, setPrompt] = useState("");

  const { generate, cancel, isStreaming, currentAction, nodeCount, error } =
    useAiGenerate();

  const hasKey = !!getKeyForProvider(provider);

  function handleProviderChange(p: ProviderName) {
    setProvider(p);
    setModel(PROVIDER_MODELS[p][0] ?? "gpt-4o");
  }

  function handleGenerate() {
    if (!prompt.trim() || !hasKey || isStreaming) return;
    void generate({ provider, model, prompt: prompt.trim(), level });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 bg-cream-50 dark:bg-plum-950 border-l border-cream-200 dark:border-plum-700/40 p-0">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-plum-500 via-plum-600 to-plum-800 text-white px-5 py-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15 backdrop-blur">
                <Sparkles size={15} className="text-amber-300" />
              </span>
              <div>
                <h2 className="text-base font-bold tracking-tight">AI Generate</h2>
                <p className="text-[11px] text-plum-100/80">Describe your system</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-full hover:bg-white/15 transition"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Provider + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-cream-200/60">
                Provider
              </label>
              <Select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as ProviderName)}
                disabled={isStreaming}
                className="bg-white dark:bg-plum-900/60 border-cream-200 dark:border-plum-700/40 focus:ring-plum-500"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="deepseek">DeepSeek</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-cream-200/60">
                Model
              </label>
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isStreaming}
                className="bg-white dark:bg-plum-900/60 border-cream-200 dark:border-plum-700/40 focus:ring-plum-500"
              >
                {PROVIDER_MODELS[provider].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Level segmented pill */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-cream-200/60">
              Detail level
            </label>
            <div className="flex gap-1 p-1 rounded-full bg-cream-100 dark:bg-plum-900/60 border border-cream-200 dark:border-plum-700/40">
              {(["high", "mid", "low"] as Level[]).map((l) => (
                <button
                  key={l}
                  disabled={isStreaming}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "flex-1 py-1.5 text-[12px] rounded-full font-medium transition-all duration-150",
                    level === l
                      ? "bg-white dark:bg-plum-700/70 text-plum-700 dark:text-cream-50 shadow-soft"
                      : "text-ink-500 dark:text-cream-200/70 hover:text-ink-900 dark:hover:text-cream-50"
                  )}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-ink-500 dark:text-cream-200/50">{LEVEL_LABELS[level]}</p>
          </div>

          {/* Prompt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-cream-200/60">
              Describe your system
            </label>
            <Textarea
              rows={6}
              placeholder="e.g. Design a Twitter-like social media platform with real-time feeds, media uploads, and notifications"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              className="font-mono text-[12px] leading-relaxed bg-white dark:bg-plum-900/60 border-cream-200 dark:border-plum-700/40 focus:ring-2 focus:ring-plum-500 focus:border-plum-500 rounded-xl resize-none"
            />
            <p className="text-[10px] text-ink-500 dark:text-cream-200/50">⌘↵ to generate</p>
          </div>

          {/* No key warning */}
          {!hasKey && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-500/40 px-3 py-2.5 text-[12px] text-amber-700 dark:text-amber-300">
              No API key for <strong>{provider}</strong>.{" "}
              <a href="/account?tab=api-keys" className="underline font-semibold">
                Add in settings
              </a>
              .
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-500/40 px-3 py-2.5 text-[12px] text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Streaming status */}
          {isStreaming && (
            <div className="flex flex-col gap-1.5 rounded-xl bg-plum-50 dark:bg-plum-800/40 border border-plum-200 dark:border-plum-700/40 px-3 py-2.5">
              <div className="flex items-center gap-2 text-[12px] text-plum-700 dark:text-plum-100">
                <Loader2 size={13} className="animate-spin shrink-0" />
                <span className="truncate">{currentAction}</span>
              </div>
              {nodeCount > 0 && (
                <p className="text-[10px] text-plum-600 dark:text-plum-300/80 pl-5">
                  {nodeCount} node{nodeCount !== 1 ? "s" : ""} added
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {isStreaming ? (
              <button
                onClick={cancel}
                className="flex-1 h-10 rounded-full border border-cream-200 dark:border-plum-700/40 text-ink-700 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-plum-800/40 transition font-medium text-sm"
              >
                Cancel
              </button>
            ) : (
              <button
                disabled={!hasKey || !prompt.trim()}
                onClick={handleGenerate}
                className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-full bg-plum-900 text-cream-50 font-semibold text-sm tracking-tight hover:bg-plum-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:scale-[1.02] shadow-soft"
              >
                <Sparkles size={14} className="text-amber-300" />
                Generate
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
