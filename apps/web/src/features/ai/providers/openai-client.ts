import { ToolCallSchema, TOOL_DEFINITIONS, type AIClient, type ToolCall } from "./ai-client";

interface ToolCallAccumulator {
  index: number;
  name: string;
  argsRaw: string;
}

async function* streamOpenAICompatible(
  baseUrl: string,
  opts: Parameters<AIClient["stream"]>[0]
): AsyncIterable<ToolCall> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      stream: true,
      tools: TOOL_DEFINITIONS.map((t) => ({ type: "function", function: t })),
      tool_choice: "auto",
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userPrompt },
      ],
    }),
    signal: opts.signal ?? null,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401) throw new Error("Invalid API key");
    if (res.status === 429) throw new Error("Rate limited");
    throw new Error(`Provider error ${res.status}: ${body.slice(0, 200)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  const accumulators = new Map<number, ToolCallAccumulator>();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;

        let chunk: unknown;
        try {
          chunk = JSON.parse(data);
        } catch {
          continue;
        }

        const delta = (chunk as { choices?: { delta?: { tool_calls?: unknown[] } }[] })
          ?.choices?.[0]?.delta;
        if (!delta?.tool_calls) continue;

        for (const tc of delta.tool_calls as { index: number; function?: { name?: string; arguments?: string } }[]) {
          const idx = tc.index;
          if (!accumulators.has(idx)) {
            accumulators.set(idx, { index: idx, name: "", argsRaw: "" });
          }
          const acc = accumulators.get(idx)!;
          if (tc.function?.name) acc.name += tc.function.name;
          if (tc.function?.arguments) acc.argsRaw += tc.function.arguments;

          // Yield when args JSON is complete (balanced braces)
          if (acc.name && isJsonComplete(acc.argsRaw)) {
            const yielded = tryYieldToolCall(acc.name, acc.argsRaw);
            if (yielded) yield yielded;
            accumulators.delete(idx);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Flush any remaining accumulators
  for (const acc of accumulators.values()) {
    if (acc.name && acc.argsRaw) {
      const yielded = tryYieldToolCall(acc.name, acc.argsRaw);
      if (yielded) yield yielded;
    }
  }
}

function isJsonComplete(s: string): boolean {
  const trimmed = s.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return false;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (const ch of trimmed) {
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") depth--;
  }
  return depth === 0;
}

function tryYieldToolCall(name: string, argsRaw: string): ToolCall | null {
  try {
    const args = JSON.parse(argsRaw);
    const result = ToolCallSchema.safeParse({ name, args });
    if (!result.success) {
      console.warn("[ai] invalid tool call", name, result.error.issues);
      return null;
    }
    return result.data;
  } catch {
    console.warn("[ai] failed to parse tool args", name, argsRaw);
    return null;
  }
}

export const openaiClient: AIClient = {
  stream: (opts) =>
    streamOpenAICompatible("https://api.openai.com/v1/chat/completions", opts),
};
