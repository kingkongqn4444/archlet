import { useState, useCallback } from "react";

export type ProviderName = "openai" | "anthropic" | "deepseek";

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  deepseek?: string;
  defaultProvider: ProviderName;
  defaultModel: string;
}

const STORAGE_KEY = "archlet_keys_v1";

const DEFAULT_MODELS: Record<ProviderName, string> = {
  openai: "gpt-5",
  anthropic: "claude-sonnet-4-6",
  deepseek: "deepseek-v3",
};

// Models that are deprecated upstream (Anthropic returns 404). When loaded,
// auto-upgrade to current default for that provider so users with stale
// localStorage aren't stuck.
const DEPRECATED_MODELS: Record<ProviderName, readonly string[]> = {
  openai: ["gpt-3.5-turbo"],
  anthropic: [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ],
  deepseek: [],
};

function load(): ApiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { defaultProvider: "openai", defaultModel: DEFAULT_MODELS.openai };
    const parsed = JSON.parse(raw) as ApiKeys;
    let mutated = false;
    // Migrate: if defaultProvider has no key, switch to first provider that does.
    const providers: ProviderName[] = ["anthropic", "openai", "deepseek"];
    if (!parsed[parsed.defaultProvider]) {
      const withKey = providers.find((p) => !!parsed[p]);
      if (withKey && withKey !== parsed.defaultProvider) {
        parsed.defaultProvider = withKey;
        parsed.defaultModel = DEFAULT_MODELS[withKey];
        mutated = true;
      }
    }
    // Migrate: deprecated model selections → current default for active provider.
    const provider = parsed.defaultProvider;
    if (DEPRECATED_MODELS[provider]?.includes(parsed.defaultModel)) {
      parsed.defaultModel = DEFAULT_MODELS[provider];
      mutated = true;
    }
    if (mutated) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch { /* noop */ }
    }
    return parsed;
  } catch {
    return { defaultProvider: "openai", defaultModel: DEFAULT_MODELS.openai };
  }
}

function save(keys: ApiKeys): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>(load);

  const updateKeys = useCallback((updates: Partial<ApiKeys>) => {
    setKeys((prev) => {
      const next = { ...prev, ...updates };
      save(next);
      return next;
    });
  }, []);

  const getKeyForProvider = useCallback(
    (provider: ProviderName): string | undefined => keys[provider],
    [keys]
  );

  return { keys, updateKeys, getKeyForProvider, DEFAULT_MODELS };
}
