import { useState } from "react";
import { Loader2, X, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useApiKeys, type ProviderName } from "./use-api-keys";
import { useAiGenerate } from "./use-ai-generate";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import type { Level } from "@archlet/shared";
import { cn } from "@/lib/utils";

const PROVIDER_MODELS: Record<ProviderName, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
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
      <SheetContent className="w-80">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-violet-500" />
              <SheetTitle>AI Generate</SheetTitle>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={14} />
            </button>
          </div>
        </SheetHeader>

        <SheetBody>
          <div className="flex flex-col gap-4">
            {/* Provider + Model */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Provider
              </label>
              <Select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as ProviderName)}
                disabled={isStreaming}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="deepseek">DeepSeek</option>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Model
              </label>
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isStreaming}
              >
                {PROVIDER_MODELS[provider].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>

            {/* Level */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Detail level
              </label>
              <div className="flex gap-1">
                {(["high", "mid", "low"] as Level[]).map((l) => (
                  <button
                    key={l}
                    disabled={isStreaming}
                    onClick={() => setLevel(l)}
                    className={cn(
                      "flex-1 py-1.5 text-xs rounded border transition-colors",
                      level === l
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-medium"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">{LEVEL_LABELS[level]}</p>
            </div>

            {/* Prompt */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Describe your system
              </label>
              <Textarea
                rows={5}
                placeholder="e.g. Design a Twitter-like social media platform with real-time feeds, media uploads, and notifications"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
              />
              <p className="text-[10px] text-slate-400">⌘↵ to generate</p>
            </div>

            {/* No key warning */}
            {!hasKey && (
              <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                No API key for <strong>{provider}</strong>.{" "}
                <a href="/account/keys" className="underline">
                  Add in settings
                </a>
                .
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Streaming status */}
            {isStreaming && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Loader2 size={12} className="animate-spin shrink-0" />
                  <span className="truncate">{currentAction}</span>
                </div>
                {nodeCount > 0 && (
                  <p className="text-[10px] text-slate-400 pl-5">
                    {nodeCount} node{nodeCount !== 1 ? "s" : ""} added
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {isStreaming ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={cancel}
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                  disabled={!hasKey || !prompt.trim()}
                  onClick={handleGenerate}
                >
                  <Sparkles size={13} className="mr-1.5" />
                  Generate
                </Button>
              )}
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
