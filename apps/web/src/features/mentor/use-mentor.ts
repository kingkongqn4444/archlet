import { useRef, useCallback } from "react";
import { toast } from "sonner";
import { useApiKeys } from "@/features/ai/use-api-keys";
import { useMentorStore } from "./mentor-store";
import { buildSystemContext } from "./build-context";

// Streams plain text (no tool calls) from OpenAI-compatible APIs
async function* streamText(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
  extraHeaders?: Record<string, string>;
  signal: AbortSignal;
}): AsyncIterable<string> {
  const res = await fetch(opts.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
      ...opts.extraHeaders,
    },
    body: JSON.stringify({
      model: opts.model,
      stream: true,
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userMessage },
      ],
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401) throw new Error("Invalid API key");
    if (res.status === 429) throw new Error("Rate limited — wait and retry");
    throw new Error(`Provider error ${res.status}: ${body.slice(0, 120)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();
  let buf = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const chunk = JSON.parse(data) as {
            choices?: { delta?: { content?: string } }[];
          };
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // skip malformed
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Anthropic streaming (SSE format differs slightly)
async function* streamAnthropicText(opts: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
  signal: AbortSignal;
}): AsyncIterable<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 1024,
      stream: true,
      system: opts.systemPrompt,
      messages: [{ role: "user", content: opts.userMessage }],
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401) throw new Error("Invalid API key");
    if (res.status === 429) throw new Error("Rate limited — wait and retry");
    throw new Error(`Anthropic error ${res.status}: ${body.slice(0, 120)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();
  let buf = "";
  let eventType = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("event:")) {
          eventType = trimmed.slice(6).trim();
          continue;
        }
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (eventType === "content_block_delta") {
          try {
            const obj = JSON.parse(data) as {
              delta?: { type?: string; text?: string };
            };
            if (obj.delta?.type === "text_delta" && obj.delta.text) {
              yield obj.delta.text;
            }
          } catch {
            // skip
          }
        }
        eventType = "";
      }
    }
  } finally {
    reader.releaseLock();
  }
}

const PROVIDER_CONFIG = {
  openai: {
    baseUrl: "https://api.openai.com/v1/chat/completions",
    models: ["gpt-5", "gpt-5-mini", "gpt-5-nano", "o3", "o3-mini", "gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  },
  anthropic: {
    baseUrl: "",
    models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1/chat/completions",
    models: ["deepseek-chat", "deepseek-reasoner", "deepseek-v3", "deepseek-r1"],
  },
} as const;

export function useMentor() {
  const { keys } = useApiKeys();
  const store = useMentorStore();
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (userText: string) => {
      if (!userText.trim() || store.isStreaming) return;

      const provider = keys.defaultProvider;
      const apiKey = keys[provider];
      if (!apiKey) {
        toast.error(`No API key for ${provider}. Add one in Settings.`);
        return;
      }

      store.addMessage({ role: "user", content: userText.trim(), ts: Date.now() });
      store.addMessage({ role: "assistant", content: "", ts: Date.now() });
      store.setStreaming(true);

      const abort = new AbortController();
      abortRef.current = abort;

      const systemPrompt = buildSystemContext();

      try {
        if (provider === "anthropic") {
          for await (const chunk of streamAnthropicText({
            apiKey,
            model: keys.defaultModel,
            systemPrompt,
            userMessage: userText.trim(),
            signal: abort.signal,
          })) {
            if (abort.signal.aborted) break;
            store.appendToLast(chunk);
          }
        } else {
          const cfg = PROVIDER_CONFIG[provider];
          for await (const chunk of streamText({
            baseUrl: cfg.baseUrl,
            apiKey,
            model: keys.defaultModel,
            systemPrompt,
            userMessage: userText.trim(),
            signal: abort.signal,
          })) {
            if (abort.signal.aborted) break;
            store.appendToLast(chunk);
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = (err as Error).message ?? "Request failed";
        toast.error(msg.includes("Invalid API key") ? "Invalid API key — check Settings" : msg);
        // Remove empty assistant placeholder
        const msgs = useMentorStore.getState().messages;
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant" && !last.content) {
          useMentorStore.setState({ messages: msgs.slice(0, -1) });
        }
      } finally {
        store.setStreaming(false);
        abortRef.current = null;
      }
    },
    [keys, store]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { send, abort };
}
