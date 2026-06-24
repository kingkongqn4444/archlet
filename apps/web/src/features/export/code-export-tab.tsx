import { useState, useMemo } from "react";
import { Copy, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";
import { GENERATORS, type GeneratorId, type IacNode, type IacEdge } from "./iac/index";

function toIacNodes(nodes: ReturnType<typeof useDiagramStore.getState>["nodes"]): IacNode[] {
  return nodes.map((n) => {
    const d = n.data as { label?: string; variant?: string; config?: Record<string, unknown> };
    const node: IacNode = {
      id: n.id,
      type: n.type ?? "",
      data: { label: d.label ?? n.id },
    };
    if (d.variant !== undefined) node.data.variant = d.variant;
    if (d.config !== undefined) node.data.config = d.config;
    return node;
  });
}

function toIacEdges(edges: ReturnType<typeof useDiagramStore.getState>["edges"]): IacEdge[] {
  return edges.map((e) => ({ source: e.source, target: e.target }));
}

export function CodeExportTab({ diagramName }: { diagramName: string }) {
  const [formatId, setFormatId] = useState<GeneratorId>("docker-compose");
  const nodes = useDiagramStore((s) => s.nodes);
  const edges = useDiagramStore((s) => s.edges);

  const iacNodes = useMemo(() => toIacNodes(nodes), [nodes]);
  const iacEdges = useMemo(() => toIacEdges(edges), [edges]);

  const code = useMemo(() => {
    try {
      return GENERATORS[formatId].generate(iacNodes, iacEdges);
    } catch (err) {
      console.error("IaC generation error:", err);
      return `# Generation error — check console for details\n# ${String(err)}`;
    }
  }, [formatId, iacNodes, iacEdges]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Clipboard access denied");
    }
  }

  function handleDownload() {
    const gen = GENERATORS[formatId];
    const slug = diagramName.replace(/\s+/g, "-").toLowerCase() || "diagram";
    const filename = `${slug}.${gen.ext}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  }

  return (
    <div className="space-y-4">
      {/* Format selector */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-ink-500 dark:text-cream-200/60 uppercase tracking-widest">
          Format
        </p>
        <Select
          value={formatId}
          onChange={(e) => setFormatId(e.target.value as GeneratorId)}
        >
          {(Object.entries(GENERATORS) as [GeneratorId, typeof GENERATORS[GeneratorId]][]).map(
            ([id, gen]) => (
              <option key={id} value={id}>
                {gen.label}
              </option>
            )
          )}
        </Select>
      </div>

      {/* Warning chip */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300">
        <AlertTriangle size={13} className="shrink-0" />
        <span className="text-xs">Starter template — review before production use</span>
      </div>

      {/* Preview pane */}
      <div className="rounded-lg overflow-hidden border border-plum-800/40">
        <div className="flex items-center justify-between px-3 py-1.5 bg-plum-900/80 border-b border-plum-800/40">
          <span className="text-[11px] font-mono text-cream-300/60 uppercase tracking-widest">
            {GENERATORS[formatId].lang}
          </span>
          <span className="text-[11px] text-cream-300/50">
            {code.split("\n").length} lines
          </span>
        </div>
        <pre className="overflow-auto max-h-[380px] p-4 bg-plum-950 text-cream-100 text-xs font-mono leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleCopy}
        >
          <Copy size={13} className="mr-1.5" />
          Copy
        </Button>
        <Button
          className="flex-1"
          onClick={handleDownload}
        >
          <Download size={13} className="mr-1.5" />
          Download .{GENERATORS[formatId].ext}
        </Button>
      </div>
    </div>
  );
}
