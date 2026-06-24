import { ToolCallSchema, TOOL_DEFINITIONS, type AIClient, type ToolCall } from "./ai-client";

// Anthropic tool schema uses "input_schema" instead of "parameters"
const ANTHROPIC_TOOLS = TOOL_DEFINITIONS.map((t) => ({
  name: t.name,
  description: t.description,
  input_schema: t.parameters,
}));

export const anthropicClient: AIClient = {
  async *stream(opts): AsyncIterable<ToolCall> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": opts.apiKey,
        "anthropic-version": "2023-06-01",
        // Required for direct browser-to-Anthropic calls
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: 4096,
        stream: true,
        tools: ANTHROPIC_TOOLS,
        system: opts.systemPrompt,
        messages: [{ role: "user", content: opts.userPrompt }],
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
    // Map block_index → accumulated JSON string
    const buffers = new Map<number, { name: string; json: string }>();
    let buffer = "";
    let eventType = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();

          if (trimmed.startsWith("event:")) {
            eventType = trimmed.slice(6).trim();
            continue;
          }

          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();

          let parsed: unknown;
          try {
            parsed = JSON.parse(data);
          } catch {
            continue;
          }

          const obj = parsed as Record<string, unknown>;

          if (eventType === "content_block_start") {
            const block = obj["content_block"] as Record<string, unknown> | undefined;
            const idx = obj["index"] as number;
            if (block?.["type"] === "tool_use") {
              buffers.set(idx, { name: block["name"] as string, json: "" });
            }
          } else if (eventType === "content_block_delta") {
            const idx = obj["index"] as number;
            const delta = obj["delta"] as Record<string, unknown> | undefined;
            if (delta?.["type"] === "input_json_delta" && buffers.has(idx)) {
              buffers.get(idx)!.json += delta["partial_json"] as string;
            }
          } else if (eventType === "content_block_stop") {
            const idx = obj["index"] as number;
            const entry = buffers.get(idx);
            if (entry) {
              const yielded = tryYield(entry.name, entry.json);
              if (yielded) yield yielded;
              buffers.delete(idx);
            }
          }

          eventType = "";
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

function tryYield(name: string, argsRaw: string): ToolCall | null {
  try {
    const args = JSON.parse(argsRaw || "{}");
    const result = ToolCallSchema.safeParse({ name, args });
    if (!result.success) {
      console.warn("[ai/anthropic] invalid tool call", name, result.error.issues);
      return null;
    }
    return result.data;
  } catch {
    console.warn("[ai/anthropic] failed to parse args", name, argsRaw);
    return null;
  }
}
