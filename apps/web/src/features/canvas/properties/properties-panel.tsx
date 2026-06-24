import React, { useCallback, useRef } from "react";
import { X } from "lucide-react";
import { useDiagramStore } from "../store/diagram-store";
import { usePropertiesPanel } from "./use-properties-panel";
import { VariantConfigForm } from "./variant-config-form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  VARIANTS_CATALOG,
  getVariant,
  getDefaultVariant,
  getVariantConfigSchema,
} from "@archlet/shared";
import type { NodeType } from "@archlet/shared";

type FieldValue = string | number | boolean;

function useDebounced<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export function PropertiesPanel() {
  const { nodeId, close } = usePropertiesPanel();
  const nodes = useDiagramStore((s) => s.nodes);
  const updateNode = useDiagramStore((s) => s.updateNode);
  const updateNodeConfig = useDiagramStore((s) => s.updateNodeConfig);
  const updateNodeVariant = useDiagramStore((s) => s.updateNodeVariant);

  const node = nodes.find((n) => n.id === nodeId);
  const isOpen = nodeId !== null && node !== undefined;

  const nodeType = node?.type as NodeType | undefined;
  const variantId =
    (node?.data.variant as string | undefined) ??
    (nodeType ? getDefaultVariant(nodeType).id : undefined);
  const variant = nodeType && variantId ? getVariant(nodeType, variantId) : undefined;
  const configSchema = nodeType && variantId ? getVariantConfigSchema(nodeType, variantId) : undefined;
  const config = (node?.data.config as Record<string, unknown>) ?? {};
  const variants = nodeType ? (VARIANTS_CATALOG[nodeType] as typeof VARIANTS_CATALOG[NodeType]) : [];

  const debouncedUpdateConfig = useDebounced(
    (id: string, cfg: Record<string, unknown>) => updateNodeConfig(id, cfg),
    300
  );

  const handleConfigChange = useCallback(
    (key: string, value: FieldValue) => {
      if (!nodeId) return;
      debouncedUpdateConfig(nodeId, { ...config, [key]: value });
    },
    [nodeId, config, debouncedUpdateConfig]
  );

  const handleVariantChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!nodeId) return;
      updateNodeVariant(nodeId, e.target.value);
    },
    [nodeId, updateNodeVariant]
  );

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!nodeId) return;
      updateNode(nodeId, { label: e.target.value });
    },
    [nodeId, updateNode]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!nodeId) return;
      updateNode(nodeId, { description: e.target.value });
    },
    [nodeId, updateNode]
  );

  return (
    <div
      className={[
        "absolute top-16 right-3 bottom-24 z-30 w-80",
        "bg-white dark:bg-plum-900/95 backdrop-blur-md",
        "rounded-2xl border border-cream-200 dark:border-plum-700/40 shadow-float",
        "flex flex-col overflow-hidden",
        "transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+16px)]",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-cream-200 dark:border-plum-700/40 shrink-0">
        {variant?.iconSlug && (
          <>
            <img
              src={`https://cdn.simpleicons.org/${variant.iconSlug}/6b7280`}
              alt=""
              width={16}
              height={16}
              className="dark:hidden shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <img
              src={`https://cdn.simpleicons.org/${variant.iconSlug}/a1a1aa`}
              alt=""
              width={16}
              height={16}
              className="hidden dark:inline shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </>
        )}
        <span className="flex-1 text-[13px] font-semibold text-ink-900 dark:text-cream-50 truncate">
          {variant?.label ?? "Configure"}
        </span>
        <button
          onClick={close}
          className="p-1 rounded-full text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800 transition"
          aria-label="Close panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {/* Label + Description */}
        <section className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 dark:text-cream-200/40">
            General
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-ink-600 dark:text-cream-200/70 uppercase tracking-wide">
              Label
            </label>
            <Input
              value={String(node?.data.label ?? "")}
              onChange={handleLabelChange}
              className="h-8 text-[12px]"
              placeholder="Node label"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-ink-600 dark:text-cream-200/70 uppercase tracking-wide">
              Description
            </label>
            <Input
              value={String(node?.data.description ?? "")}
              onChange={handleDescriptionChange}
              className="h-8 text-[12px]"
              placeholder="Optional description"
            />
          </div>
        </section>

        {/* Variant selector */}
        {variants.length > 0 && (
          <section className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 dark:text-cream-200/40">
              Variant
            </p>
            <Select
              value={variantId ?? ""}
              onChange={handleVariantChange}
              className="h-8 text-[12px]"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </Select>
            {variant?.description && (
              <p className="text-[11px] text-ink-500 dark:text-cream-200/50 -mt-1">
                {variant.description}
              </p>
            )}
          </section>
        )}

        {/* Config fields */}
        {configSchema && (
          <section className="flex flex-col gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-400 dark:text-cream-200/40">
              Configuration
            </p>
            <VariantConfigForm
              schema={configSchema}
              values={config}
              onChange={handleConfigChange}
            />
          </section>
        )}
      </div>
    </div>
  );
}
