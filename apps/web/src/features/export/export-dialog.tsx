import { useState } from "react";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { htmlToPng, downloadBlob } from "./export-png";
import { htmlToSvg } from "./export-svg";
import { htmlToPdf } from "./export-pdf";
import { CodeExportTab } from "./code-export-tab";

type Tab = "image" | "code";
type Format = "png" | "svg" | "pdf";
type Scale = 1 | 2 | 3;

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagramName: string;
}

function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
  format = (v: T) => String(v).toUpperCase(),
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <div className="inline-flex w-full p-1 rounded-full bg-cream-100 dark:bg-plum-900/40 border border-cream-200 dark:border-plum-700/40">
      {options.map((opt) => (
        <button
          key={String(opt)}
          onClick={() => onChange(opt)}
          className={`flex-1 py-1.5 text-sm rounded-full font-medium transition-all duration-150 ${
            opt === value
              ? "bg-white dark:bg-plum-700/70 text-plum-700 dark:text-cream-50 font-semibold shadow-soft"
              : "text-ink-500 dark:text-cream-200/60 hover:text-ink-900 dark:hover:text-cream-50"
          }`}
        >
          {format(opt)}
        </button>
      ))}
    </div>
  );
}

export function ExportDialog({ open, onOpenChange, diagramName }: ExportDialogProps) {
  const [tab, setTab] = useState<Tab>("image");
  const [format, setFormat] = useState<Format>("png");
  const [transparent, setTransparent] = useState(false);
  const [scale, setScale] = useState<Scale>(2);
  const [exporting, setExporting] = useState(false);

  function getTarget(): HTMLElement | null {
    return document.querySelector<HTMLElement>(".react-flow__viewport");
  }

  async function handleDownload() {
    const el = getTarget();
    if (!el) {
      toast.error("Canvas not found — open a diagram first");
      return;
    }
    setExporting(true);
    try {
      const slug = diagramName.replace(/\s+/g, "-").toLowerCase() || "diagram";
      if (format === "png") {
        const blob = await htmlToPng(el, { transparent, scale });
        downloadBlob(blob, `${slug}.png`);
      } else if (format === "svg") {
        const blob = await htmlToSvg(el);
        downloadBlob(blob, `${slug}.svg`);
      } else {
        const blob = await htmlToPdf(el, { scale });
        downloadBlob(blob, `${slug}.pdf`);
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Export failed — check console for details");
    } finally {
      setExporting(false);
    }
  }

  function handlePermanentLink() {
    toast.info("Permanent link — coming soon in Phase 6");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Export diagram</DialogTitle>
        </DialogHeader>

        {/* Top-level tabs: Image | Code */}
        <PillGroup<Tab>
          options={["image", "code"] as const}
          value={tab}
          onChange={setTab}
          format={(v) => v === "image" ? "Image" : "Code"}
        />

        {tab === "image" && (
          <>
            {/* Format */}
            <div className="space-y-2 mt-4">
              <p className="text-[11px] font-bold text-ink-500 dark:text-cream-200/60 uppercase tracking-widest">
                Format
              </p>
              <PillGroup<Format>
                options={["png", "svg", "pdf"] as const}
                value={format}
                onChange={setFormat}
              />
            </div>

            {/* Options — PNG & PDF only */}
            {format !== "svg" && (
              <div className="space-y-2 mt-5">
                <p className="text-[11px] font-bold text-ink-500 dark:text-cream-200/60 uppercase tracking-widest">
                  Scale
                </p>
                <PillGroup<Scale>
                  options={[1, 2, 3] as const}
                  value={scale}
                  onChange={setScale}
                  format={(v) => `${v}x`}
                />
              </div>
            )}

            {format === "png" && (
              <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                  className="rounded accent-plum-500"
                />
                <span className="text-sm text-ink-700 dark:text-cream-100">
                  Transparent background
                </span>
              </label>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleDownload}
                disabled={exporting}
                className="flex-1"
              >
                {exporting ? (
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                ) : (
                  <Download size={14} className="mr-1.5" />
                )}
                {exporting ? "Exporting…" : "Download"}
              </Button>
              <Button
                variant="outline"
                onClick={handlePermanentLink}
                className="flex-1 text-xs"
              >
                Permanent link
              </Button>
            </div>
          </>
        )}

        {tab === "code" && (
          <div className="mt-4">
            <CodeExportTab diagramName={diagramName} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
