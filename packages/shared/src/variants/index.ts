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

/** Parse config with defaults; returns defaults if input is empty/invalid. */
export function parseVariantConfig(type: NodeType, variantId: string, raw: unknown): Record<string, unknown> {
  const schema = getVariantConfigSchema(type, variantId);
  if (!schema) return {};
  const result = schema.safeParse(raw ?? {});
  if (result.success) return result.data as Record<string, unknown>;
  const defaults = schema.safeParse({});
  return defaults.success ? (defaults.data as Record<string, unknown>) : {};
}
