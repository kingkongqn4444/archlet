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
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Diagrams</h2>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <PlusIcon className="w-4 h-4 mr-1" /> New diagram
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-slate-400">Loading…</p>
      )}

      {!isLoading && diagrams.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <FileText className="w-12 h-12 text-slate-200 dark:text-slate-700" />
          <p className="text-sm text-slate-400">No diagrams yet</p>
          <Button onClick={() => setShowNew(true)}>Create your first diagram</Button>
        </div>
      )}

      <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
        {diagrams.map((diagram) => (
          <div
            key={diagram.id}
            className="group relative flex flex-col gap-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
            onClick={() => navigate(`/d/${diagram.id}`)}
          >
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
              {diagram.name}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(diagram.updatedAt).toLocaleDateString()}
            </span>
            <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
              <button
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={(e) => { e.stopPropagation(); setRenaming(diagram); }}
              >
                <Pencil className="w-3 h-3 text-slate-500" />
              </button>
              <button
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                onClick={(e) => { e.stopPropagation(); void handleDelete(diagram); }}
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
