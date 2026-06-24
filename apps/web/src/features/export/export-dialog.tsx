import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { htmlToPng, downloadBlob } from "./export-png";
import { htmlToSvg } from "./export-svg";
import { htmlToPdf } from "./export-pdf";

type Format = "png" | "svg" | "pdf";
type Scale = 1 | 2 | 3;

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagramName: string;
}

export function ExportDialog({ open, onOpenChange, diagramName }: ExportDialogProps) {
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
      <DialogContent className="w-full max-w-sm dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Export diagram</DialogTitle>
        </DialogHeader>

        {/* Format */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Format</p>
          <div className="flex gap-2">
            {(["png", "svg", "pdf"] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-1.5 rounded text-sm border transition-colors ${
                  format === f
                    ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Options — PNG & PDF only */}
        {format !== "svg" && (
          <div className="space-y-3 mt-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Scale</p>
            <div className="flex gap-2">
              {([1, 2, 3] as Scale[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-1.5 rounded text-sm border transition-colors ${
                    scale === s
                      ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}

        {format === "png" && (
          <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Transparent background</span>
          </label>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <Button
            onClick={handleDownload}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-1.5"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : null}
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
      </DialogContent>
    </Dialog>
  );
}
