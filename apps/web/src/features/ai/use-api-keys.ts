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
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20241022",
  deepseek: "deepseek-chat",
};

function load(): ApiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { defaultProvider: "openai", defaultModel: DEFAULT_MODELS.openai };
    return JSON.parse(raw) as ApiKeys;
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
