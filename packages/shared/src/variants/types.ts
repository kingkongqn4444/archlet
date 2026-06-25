import type { z } from "zod";
import type { CloudProvider } from "../cloud-providers";

export type VariantConfigSchema = z.ZodObject<z.ZodRawShape>;

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
