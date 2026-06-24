import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon, Pencil, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjects, useCreateProject, useRenameProject, useDeleteProject } from "./use-projects";
import type { ProjectResponse } from "@archlet/shared";

interface Props {
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
}

function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateProject();
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await create.mutateAsync(name.trim());
    toast.success("Project created");
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        autoFocus
        placeholder="Project name"
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

function RenameProjectDialog({
  project,
  onClose,
}: {
  project: ProjectResponse;
  onClose: () => void;
}) {
  const rename = useRenameProject();
  const [name, setName] = useState(project.name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await rename.mutateAsync({ id: project.id, name: name.trim() });
    toast.success("Project renamed");
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

export function ProjectsSidebar({ selectedProjectId, onSelectProject }: Props) {
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const [showNew, setShowNew] = useState(false);
  const [renaming, setRenaming] = useState<ProjectResponse | null>(null);

  async function handleDelete(project: ProjectResponse) {
    if (!confirm(`Delete "${project.name}" and all its diagrams?`)) return;
    await deleteProject.mutateAsync(project.id);
    toast.success("Project deleted");
  }

  return (
    <aside className="w-56 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNew(true)}>
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {isLoading && (
          <p className="px-3 py-2 text-xs text-slate-400">Loading…</p>
        )}
        {!isLoading && projects.length === 0 && (
          <p className="px-3 py-4 text-xs text-slate-400 text-center">No projects yet</p>
        )}
        {projects.map((project) => {
          const active = project.id === selectedProjectId;
          return (
            <div
              key={project.id}
              className={`group flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded mx-1 ${
                active
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
              onClick={() => onSelectProject(project.id)}
            >
              <FolderOpen className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="flex-1 text-xs truncate">{project.name}</span>
              <span className="hidden group-hover:flex items-center gap-0.5">
                <button
                  className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                  onClick={(e) => { e.stopPropagation(); setRenaming(project); }}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                  onClick={(e) => { e.stopPropagation(); void handleDelete(project); }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            </div>
          );
        })}
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
          <NewProjectDialog onClose={() => setShowNew(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename project</DialogTitle></DialogHeader>
          {renaming && (
            <RenameProjectDialog project={renaming} onClose={() => setRenaming(null)} />
          )}
        </DialogContent>
      </Dialog>
    </aside>
  );
}
