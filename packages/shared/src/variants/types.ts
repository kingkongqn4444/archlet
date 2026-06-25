import type { z } from "zod";
import type { CloudProvider } from "../cloud-providers";

// Variant config schema is either a flat object (most variants) or a
// discriminated union on `cloudProvider` (variants with per-cloud SKU fields,
// rolled out in Cloud Phase B). The form-renderer detects which kind at runtime.
// Use ZodType to accommodate both shapes in Zod v4's stricter generics.
export type VariantConfigSchema = z.ZodType<Record<string, unknown>>;

export type Variant = {
  id: string;
  label: string;
  iconSlug?: string;
  description?: string;
  configSchema: VariantConfigSchema;
  // Phase A cloud-tag fields:
  availableClouds?: readonly CloudProvider[]; // defaults to ["self-hosted"] when omitted
  cloudIconSlug?: Partial<Record<CloudProvider, string>>; // override default cloud icon per (variant, cloud)
};
