import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PlusIcon, Pencil, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDiagramList, useCreateDiagram, useRenameDiagram, useDeleteDiagram } from "./use-diagrams";
import type { DiagramResponse } from "@archlet/shared";

interface Props {
  projectId: string;
}

function NewDiagramDialog({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const create = useCreateDiagram();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const diagram = await create.mutateAsync({
      projectId,
      name: name.trim() || "Untitled diagram",
    });
    toast.success("Diagram created");
    onClose();
    navigate(`/d/${diagram.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        autoFocus
        placeholder="Diagram name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={create.isPending}>Create</Button>
      </div>
    </form>
  );
}

function RenameDiagramDialog({
  diagram,
  onClose,
}: {
  diagram: DiagramResponse;
  onClose: () => void;
}) {
  const rename = useRenameDiagram();
  const [name, setName] = useState(diagram.name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await rename.mutateAsync({ id: diagram.id, name: name.trim() });
    toast.success("Diagram renamed");
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={rename.isPending}>Save</Button>
      </div>
    </form>
  );
}

export function DiagramList({ projectId }: Props) {
  const navigate = useNavigate();
  const { data: diagrams = [], isLoading } = useDiagramList(projectId);
  const deleteDiagram = useDeleteDiagram();
  const [showNew, setShowNew] = useState(false);
  const [renaming, setRenaming] = useState<DiagramResponse | null>(null);

  async function handleDelete(diagram: DiagramResponse) {
    if (!confirm(`Delete "${diagram.name}"?`)) return;
    await deleteDiagram.mutateAsync({ id: diagram.id, projectId });
    toast.success("Diagram deleted");
  }

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink-900 dark:text-cream-50">
            Diagrams
          </h2>
          <p className="text-sm text-ink-500 dark:text-cream-200/60 mt-0.5">
            {diagrams.length} {diagrams.length === 1 ? "diagram" : "diagrams"}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <PlusIcon className="w-4 h-4 mr-1.5" /> New diagram
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-ink-500 dark:text-cream-200/60">Loading…</p>
      )}

      {!isLoading && diagrams.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-plum-100 dark:bg-plum-900/40 flex items-center justify-center">
            <FileText className="w-7 h-7 text-plum-500" />
          </div>
          <p className="text-sm text-ink-500 dark:text-cream-200/60">No diagrams yet</p>
          <Button onClick={() => setShowNew(true)}>Create your first diagram</Button>
        </div>
      )}

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {diagrams.map((diagram) => (
          <div
            key={diagram.id}
            className="group relative flex flex-col gap-2 p-4 rounded-2xl border border-cream-200 dark:border-plum-700/30 bg-white dark:bg-plum-900/40 cursor-pointer hover:border-plum-300 dark:hover:border-plum-500/50 hover:shadow-card hover:-translate-y-0.5 transition-all duration-150"
            onClick={() => navigate(`/d/${diagram.id}`)}
          >
            <div className="w-10 h-10 rounded-xl bg-plum-50 dark:bg-plum-800/50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-plum-500" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-ink-900 dark:text-cream-50 truncate">
              {diagram.name}
            </span>
            <span className="text-[11px] text-ink-500 dark:text-cream-200/50">
              Updated {new Date(diagram.updatedAt).toLocaleDateString()}
            </span>
            <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
              <button
                className="p-1.5 rounded-full bg-white dark:bg-plum-900 border border-cream-200 dark:border-plum-700/40 hover:bg-cream-100 dark:hover:bg-plum-800 shadow-soft"
                onClick={(e) => { e.stopPropagation(); setRenaming(diagram); }}
                title="Rename"
              >
                <Pencil className="w-3 h-3 text-ink-700 dark:text-cream-100" />
              </button>
              <button
                className="p-1.5 rounded-full bg-white dark:bg-plum-900 border border-cream-200 dark:border-plum-700/40 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 shadow-soft"
                onClick={(e) => { e.stopPropagation(); void handleDelete(diagram); }}
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>New diagram</DialogTitle></DialogHeader>
          <NewDiagramDialog projectId={projectId} onClose={() => setShowNew(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename diagram</DialogTitle></DialogHeader>
          {renaming && (
            <RenameDiagramDialog diagram={renaming} onClose={() => setRenaming(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
