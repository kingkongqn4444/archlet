import React from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { VariantConfigSchema } from "@archlet/shared";

type FieldValue = string | number | boolean;

type Props = {
  schema: VariantConfigSchema;
  values: Record<string, unknown>;
  onChange: (key: string, value: FieldValue) => void;
};

function toLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-ink-600 dark:text-cream-200/70 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

export function VariantConfigForm({ schema, values, onChange }: Props) {
  const shape = schema.shape as Record<string, z.ZodTypeAny>;

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(shape).map(([key, fieldSchema]) => {
        const rawVal = values[key];
        const label = toLabel(key);

        // Unwrap ZodDefault to get inner type
        const inner =
          fieldSchema instanceof z.ZodDefault
            ? fieldSchema._def.innerType
            : fieldSchema;

        if (inner instanceof z.ZodEnum) {
          const options = inner.options as string[];
          const val = typeof rawVal === "string" ? rawVal : String(options[0]);
          return (
            <FieldRow key={key} label={label}>
              <Select
                value={val}
                onChange={(e) => onChange(key, e.target.value)}
                className="h-8 text-[12px]"
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </FieldRow>
          );
        }

        if (inner instanceof z.ZodBoolean) {
          const checked = typeof rawVal === "boolean" ? rawVal : false;
          return (
            <FieldRow key={key} label={label}>
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(key, !checked)}
                className={[
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
                  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500",
                  checked
                    ? "bg-plum-500"
                    : "bg-cream-300 dark:bg-plum-700",
                ].join(" ")}
              >
                <span
                  className={[
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200",
                    checked ? "translate-x-4" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </FieldRow>
          );
        }

        if (inner instanceof z.ZodNumber) {
          const num = typeof rawVal === "number" ? rawVal : 0;
          return (
            <FieldRow key={key} label={label}>
              <Input
                type="number"
                value={num}
                onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
                className="h-8 text-[12px]"
              />
            </FieldRow>
          );
        }

        // Default: text input
        const str = rawVal != null ? String(rawVal) : "";
        return (
          <FieldRow key={key} label={label}>
            <Input
              type="text"
              value={str}
              onChange={(e) => onChange(key, e.target.value)}
              className="h-8 text-[12px]"
            />
          </FieldRow>
        );
      })}
    </div>
  );
}
