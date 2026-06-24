import type { ProviderName } from "../use-api-keys";
import type { AIClient } from "./ai-client";
import { openaiClient } from "./openai-client";
import { anthropicClient } from "./anthropic-client";
import { deepseekClient } from "./deepseek-client";

const clients: Record<ProviderName, AIClient> = {
  openai: openaiClient,
  anthropic: anthropicClient,
  deepseek: deepseekClient,
};

export function getClient(provider: ProviderName): AIClient {
  return clients[provider];
}
