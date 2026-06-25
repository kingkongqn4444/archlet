import { useState, useCallback } from "react";
import { Cloud } from "lucide-react";
import type { CloudService, DiagramNode } from "@archlet/shared";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { ServicePickerModal } from "./service-picker-modal";

// Side-palette tile that opens cloud-services picker modal. Picking a service
// drops a node onto canvas using existing `external` NodeType with variant id
// set to the cloud service id (e.g. "aws-sagemaker"). VariantBadge in base-node
// falls back to CLOUD_SERVICES_CATALOG when variant id isn't in VARIANTS_CATALOG.

function nodeIdFor(serviceId: string): string {
  return `external-${Date.now()}-${serviceId}-${Math.random().toString(36).slice(2, 7)}`;
}

export function CloudGroup() {
  const [open, setOpen] = useState(false);
  const addNode = useDiagramStore((s) => s.addNode);

  const handlePick = useCallback((service: CloudService) => {
    const node: DiagramNode = {
      id: nodeIdFor(service.id),
      type: "external",
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 200 },
      data: {
        label: service.name,
        variant: service.id,
        config: {
          cloudProvider: service.cloud,
          serviceCategory: service.category,
          docsUrl: service.docsUrl,
        },
      },
    };
    addNode(node);
  }, [addNode]);

  return (
    <>
      <div className="mx-2 mt-1 mb-0.5 h-px bg-cream-200/80 dark:bg-plum-700/40" aria-hidden="true" />
      <div className="px-1 pt-0.5 pb-0.5 text-[9px] archlet-smallcaps font-semibold text-ink-300 dark:text-cream-200/40 text-center select-none">
        Cloud
      </div>
      <div
        onClick={() => setOpen(true)}
        title="Cloud Services (AWS / GCP / Azure)"
        className="group relative w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer hover:bg-cream-100 dark:hover:bg-plum-800/60 hover:scale-105 transition-all duration-150 select-none text-ink-500 dark:text-cream-200/60"
      >
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors group-hover:bg-sky-100 dark:group-hover:bg-white/10 group-hover:text-sky-600 dark:group-hover:text-sky-300">
          <Cloud size={15} strokeWidth={1.75} />
        </span>
        {!open && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-full ml-2 px-2.5 py-1 rounded-md text-[11px] font-medium bg-ink-900 text-cream-50 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 shadow-soft"
          >
            Cloud Services
          </span>
        )}
      </div>
      <ServicePickerModal open={open} onClose={() => setOpen(false)} onPick={handlePick} />
    </>
  );
}
