import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Cloud as CloudIcon } from "lucide-react";
import {
  CLOUD_SERVICES_CATALOG, searchServices,
  type CloudService, type CloudServiceCategory, type CloudServiceProvider,
} from "@archlet/shared";

const CATEGORY_FACETS: CloudServiceCategory[] = [
  "compute", "container", "serverless", "storage", "database", "cache",
  "queue", "stream", "event", "workflow", "cdn", "networking", "loadbalancer",
  "dns", "auth", "iam", "security", "kms", "ml-ai", "analytics",
  "observability", "devops", "management", "migration", "iot", "media",
];

const CLOUD_FACETS: Array<{ id: CloudServiceProvider | "all"; label: string }> = [
  { id: "all", label: "All Clouds" },
  { id: "aws", label: "AWS" },
  { id: "gcp", label: "GCP" },
  { id: "azure", label: "Azure" },
];

function ServiceCard({ service, onSelect }: { service: CloudService; onSelect: (s: CloudService) => void }) {
  const slug = service.iconSlug ?? "amazonwebservices";
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className="group flex flex-col items-start gap-1.5 p-3 rounded-xl border border-cream-200 dark:border-plum-700/40 bg-white dark:bg-plum-900/60 hover:border-plum-400 dark:hover:border-plum-500/60 hover:shadow-card hover:-translate-y-0.5 transition-all duration-150 text-left"
    >
      <div className="flex items-center gap-2 w-full">
        <img
          src={`https://cdn.simpleicons.org/${slug}/6b7280`}
          alt=""
          width={16}
          height={16}
          className="dark:hidden shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <img
          src={`https://cdn.simpleicons.org/${slug}/a1a1aa`}
          alt=""
          width={16}
          height={16}
          className="hidden dark:inline shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="text-[12.5px] font-semibold text-ink-900 dark:text-cream-50 truncate flex-1">
          {service.name}
        </span>
        <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-plum-100 dark:bg-plum-800/60 text-plum-700 dark:text-plum-200 font-bold shrink-0">
          {service.cloud}
        </span>
      </div>
      <p className="text-[11px] text-ink-500 dark:text-cream-200/55 leading-snug line-clamp-2">
        {service.description}
      </p>
      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-cream-100 dark:bg-plum-800/40 text-ink-500 dark:text-cream-200/55">
        {service.category}
      </span>
    </button>
  );
}

export function ServicePickerModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (service: CloudService) => void;
}) {
  const [query, setQuery] = useState("");
  const [cloudFilter, setCloudFilter] = useState<CloudServiceProvider | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<CloudServiceCategory | "all">("all");

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    return searchServices(query, {
      ...(cloudFilter !== "all" ? { cloud: cloudFilter } : {}),
      ...(categoryFilter !== "all" ? { category: categoryFilter } : {}),
      limit: 100,
    });
  }, [query, cloudFilter, categoryFilter]);

  // Category facets only show categories that have ≥1 service in current cloud filter
  const availableCategories = useMemo(() => {
    const inCloud = cloudFilter === "all"
      ? CLOUD_SERVICES_CATALOG
      : CLOUD_SERVICES_CATALOG.filter((s) => s.cloud === cloudFilter);
    return new Set(inCloud.map((s) => s.category));
  }, [cloudFilter]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-plum-900 rounded-2xl shadow-float overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-cream-200 dark:border-plum-700/40 bg-cream-50 dark:bg-plum-950/40 shrink-0">
          <CloudIcon size={16} className="text-plum-600 dark:text-plum-300" />
          <h2 className="text-[14px] font-bold text-ink-900 dark:text-cream-50 flex-1">
            Cloud Services
          </h2>
          <span className="text-[11px] text-ink-400 dark:text-cream-200/40">
            {results.length} of {CLOUD_SERVICES_CATALOG.length}
          </span>
          <button onClick={onClose} className="p-1 rounded-md text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800">
            <X size={16} />
          </button>
        </div>
        {/* Search + facets */}
        <div className="flex flex-col gap-2.5 px-5 py-3 border-b border-cream-200 dark:border-plum-700/40 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-cream-200/40" />
            <input
              type="text"
              autoFocus
              placeholder="Search services… (e.g. lambda, kafka, sagemaker)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-cream-200 dark:border-plum-700/40 bg-white dark:bg-plum-900/60 text-[13px] text-ink-900 dark:text-cream-50 placeholder:text-ink-400 dark:placeholder:text-cream-200/30 outline-none focus:ring-2 focus:ring-plum-400"
            />
          </div>
          {/* Cloud facets */}
          <div className="flex gap-1 flex-wrap">
            {CLOUD_FACETS.map((f) => (
              <button
                key={f.id}
                onClick={() => setCloudFilter(f.id)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                  cloudFilter === f.id
                    ? "bg-plum-600 text-white"
                    : "bg-cream-100 dark:bg-plum-800/40 text-ink-700 dark:text-cream-200/70 hover:bg-cream-200 dark:hover:bg-plum-800/60"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* Category facets */}
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                categoryFilter === "all"
                  ? "bg-plum-500 text-white"
                  : "bg-cream-100 dark:bg-plum-800/40 text-ink-600 dark:text-cream-200/60 hover:bg-cream-200"
              }`}
            >
              All categories
            </button>
            {CATEGORY_FACETS.filter((c) => availableCategories.has(c)).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                  categoryFilter === c
                    ? "bg-plum-500 text-white"
                    : "bg-cream-100 dark:bg-plum-800/40 text-ink-600 dark:text-cream-200/60 hover:bg-cream-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {/* Results grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {results.length === 0 ? (
            <div className="text-center py-12 text-ink-500 dark:text-cream-200/50 text-[13px]">
              No services match. Try clearing filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {results.map((s) => (
                <ServiceCard key={s.id} service={s} onSelect={(svc) => { onPick(svc); onClose(); }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
