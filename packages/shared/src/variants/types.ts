import type { z } from "zod";

export type VariantConfigSchema = z.ZodObject<z.ZodRawShape>;

export type Variant = {
  id: string;
  label: string;
  iconSlug?: string;
  description?: string;
  configSchema: VariantConfigSchema;
};
