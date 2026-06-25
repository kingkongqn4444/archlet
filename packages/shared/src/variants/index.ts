import type { NodeType } from "../diagram";
import type { Variant, VariantConfigSchema } from "./types";
import { USER_VARIANTS } from "./user";
import { API_VARIANTS } from "./api";
import { DATABASE_VARIANTS } from "./database";
import { CACHE_VARIANTS } from "./cache";
import { QUEUE_VARIANTS } from "./queue";
import { STORAGE_VARIANTS } from "./storage";
import { CDN_VARIANTS } from "./cdn";
import { LOAD_BALANCER_VARIANTS } from "./load-balancer";
import { WORKER_VARIANTS } from "./worker";
import { EXTERNAL_VARIANTS } from "./external";

export type { Variant, VariantConfigSchema } from "./types";

export const VARIANTS_CATALOG = {
  user: USER_VARIANTS,
  api: API_VARIANTS,
  database: DATABASE_VARIANTS,
  cache: CACHE_VARIANTS,
  queue: QUEUE_VARIANTS,
  storage: STORAGE_VARIANTS,
  cdn: CDN_VARIANTS,
  load_balancer: LOAD_BALANCER_VARIANTS,
  worker: WORKER_VARIANTS,
  external: EXTERNAL_VARIANTS,
} satisfies Record<NodeType, Variant[]>;

export function getVariant(type: NodeType, variantId: string): Variant | undefined {
  return (VARIANTS_CATALOG[type] as Variant[]).find((v) => v.id === variantId);
}

export function getDefaultVariant(type: NodeType): Variant {
  // Catalog is statically non-empty for every NodeType; assertion is safe.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (VARIANTS_CATALOG[type] as Variant[])[0]!;
}

export function getVariantConfigSchema(type: NodeType, variantId: string): VariantConfigSchema | undefined {
  return getVariant(type, variantId)?.configSchema;
}

/** Parse config with defaults; returns defaults if input is empty/invalid.
 *  For discriminatedUnion schemas, fall back to first branch (typically
 *  "self-hosted") when discriminator missing on input. Zod v4: schema internals
 *  exposed via _zod.def. */
export function parseVariantConfig(type: NodeType, variantId: string, raw: unknown): Record<string, unknown> {
  const schema = getVariantConfigSchema(type, variantId);
  if (!schema) return {};
  const input = { ...((raw ?? {}) as Record<string, unknown>) };
  const def = (schema as { _zod?: { def?: { type?: string; discriminator?: string } } })._zod?.def;
  const isDU = def?.type === "union" && typeof def.discriminator === "string";
  const discKey = isDU ? def!.discriminator! : undefined;
  if (discKey && input[discKey] === undefined) {
    input[discKey] = "self-hosted";
  }
  const result = schema.safeParse(input);
  if (result.success) return result.data as Record<string, unknown>;
  const defaultsInput = discKey ? { [discKey]: "self-hosted" } : {};
  const defaults = schema.safeParse(defaultsInput);
  return defaults.success ? (defaults.data as Record<string, unknown>) : {};
}
