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
  CLOUD_PROVIDERS,
  CLOUD_DISPLAY_NAMES,
  getCloudService,
} from "@archlet/shared";
import type { NodeType, CloudProvider } from "@archlet/shared";
import { ExternalLink } from "lucide-react";

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

/** Map known iconSlug → hex accent color for variant-specific gradient header. */
const VARIANT_ACCENT: Record<string, string> = {
  postgresql: "#336791",
  mysql: "#4479A1",
  mongodb: "#47A248",
  redis: "#DC382D",
  elasticsearch: "#005571",
  sqlite: "#003B57",
  mariadb: "#003545",
  amazons3: "#569A31",
  googlecloudstorage: "#4285F4",
  cloudflare: "#F38020",
  amazoncloudfront: "#FF9900",
  rabbitmq: "#FF6600",
  apachekafka: "#231F20",
  nginx: "#009639",
  haproxy: "#106DA9",
  nodedotjs: "#5FA04E",
  go: "#00ADD8",
  python: "#3776AB",
  rust: "#000000",
  java: "#007396",
  googlechrome: "#4285F4",
  firefox: "#FF7139",
  safari: "#000000",
};

function variantHeaderStyle(iconSlug?: string | null): React.CSSProperties {
  if (!iconSlug) return {};
  const color = VARIANT_ACCENT[iconSlug.toLowerCase()] ?? "#6C2BD9";
  return {
    backgroundImage: `linear-gradient(90deg, ${color}26 0%, transparent 75%)`,
  };
}

interface SectionHeadingProps {
  children: React.ReactNode;
}
function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400 dark:text-cream-200/40">
      {children}
    </p>
  );
}

interface FieldLabelProps {
  children: React.ReactNode;
}
function FieldLabel({ children }: FieldLabelProps) {
  return (
    <label className="text-[10.5px] font-medium text-ink-600 dark:text-cream-200/70 uppercase tracking-wide">
      {children}
    </label>
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
      key={nodeId ?? "closed"}
      className={[
        "absolute top-16 right-3 bottom-24 z-30 w-80",
        "bg-white dark:bg-plum-900/95 backdrop-blur-md",
        "rounded-2xl border border-cream-200 dark:border-plum-700/40 shadow-float",
        "flex flex-col overflow-hidden",
        "transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0 animate-slide-in-right" : "translate-x-[calc(100%+16px)]",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      {/* Header with variant-colored gradient */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-cream-200 dark:border-plum-700/40 shrink-0"
        style={variantHeaderStyle(variant?.iconSlug)}
      >
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
        <span className="flex-1 text-[13px] font-semibold tracking-tight text-ink-900 dark:text-cream-50 truncate">
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
        <section className="flex flex-col gap-3">
          <SectionHeading>General</SectionHeading>
          <div className="flex flex-col gap-1">
            <FieldLabel>Label</FieldLabel>
            <Input
              value={String(node?.data.label ?? "")}
              onChange={handleLabelChange}
              className="h-8 text-[12px] transition focus:ring-2 focus:ring-plum-500/30 focus:border-plum-400"
              placeholder="Node label"
            />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel>Description</FieldLabel>
            <Input
              value={String(node?.data.description ?? "")}
              onChange={handleDescriptionChange}
              className="h-8 text-[12px] transition focus:ring-2 focus:ring-plum-500/30 focus:border-plum-400"
              placeholder="Optional description"
            />
          </div>
        </section>

        {variants.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Variant</SectionHeading>
            <Select
              value={variantId ?? ""}
              onChange={handleVariantChange}
              className="h-8 text-[12px] transition focus:ring-2 focus:ring-plum-500/30 focus:border-plum-400"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </Select>
            {variant?.description && (
              <p className="text-[11px] leading-relaxed text-ink-500 dark:text-cream-200/50 -mt-1">
                {variant.description}
              </p>
            )}
          </section>
        )}

        {variantId && getCloudService(variantId) && (() => {
          const svc = getCloudService(variantId)!;
          const slug = svc.iconSlug ?? "amazonwebservices";
          return (
            <section className="flex flex-col gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700/30">
              <div className="flex items-center gap-2">
                <img src={`https://cdn.simpleicons.org/${slug}/0284c7`} alt="" width={20} height={20} className="dark:hidden shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <img src={`https://cdn.simpleicons.org/${slug}/7dd3fc`} alt="" width={20} height={20} className="hidden dark:inline shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[12.5px] font-bold text-ink-900 dark:text-cream-50">{svc.name}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-ink-500 dark:text-cream-200/55">
                    <span className="uppercase font-bold tracking-wide">{svc.cloud}</span>
                    <span>·</span>
                    <span>{svc.category}</span>
                  </div>
                </div>
                <a href={svc.docsUrl} target="_blank" rel="noreferrer noopener" className="p-1.5 rounded-md text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-800/40" title="Open docs">
                  <ExternalLink size={14} />
                </a>
              </div>
              <p className="text-[11px] text-ink-600 dark:text-cream-200/60 leading-snug">{svc.description}</p>
              <div className="text-[10px] text-ink-400 dark:text-cream-200/40 italic">
                Reference node — not included in capacity simulation.
              </div>
            </section>
          );
        })()}

        {variant && !getCloudService(variantId ?? "") && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Cloud Provider</SectionHeading>
            <Select
              value={(config.cloudProvider as string | undefined) ?? "self-hosted"}
              onChange={(e) => handleConfigChange("cloudProvider", e.target.value)}
              className="h-8 text-[12px]"
            >
              {(variant.availableClouds ?? CLOUD_PROVIDERS).map((cp) => (
                <option key={cp} value={cp}>{CLOUD_DISPLAY_NAMES[cp as CloudProvider]}</option>
              ))}
            </Select>
          </section>
        )}

        {configSchema && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Configuration</SectionHeading>
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
