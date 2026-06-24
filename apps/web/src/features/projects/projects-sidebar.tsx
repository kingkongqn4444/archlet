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
    <aside className="w-60 flex flex-col border-r border-cream-200 dark:border-plum-700/30 bg-white/60 dark:bg-plum-900/30 h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200 dark:border-plum-700/30">
        <span className="text-[11px] font-bold text-ink-500 dark:text-cream-200/60 uppercase tracking-widest">
          Projects
        </span>
        <button
          onClick={() => setShowNew(true)}
          className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-plum-500 text-cream-50 hover:bg-plum-700 hover:scale-110 transition-all"
          title="New project"
        >
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        {isLoading && (
          <p className="px-3 py-2 text-xs text-ink-500 dark:text-cream-200/60">Loading…</p>
        )}
        {!isLoading && projects.length === 0 && (
          <p className="px-3 py-4 text-xs text-ink-500 dark:text-cream-200/60 text-center">
            No projects yet
          </p>
        )}
        {projects.map((project) => {
          const active = project.id === selectedProjectId;
          return (
            <div
              key={project.id}
              className={`group flex items-center gap-2 px-2.5 py-2 cursor-pointer rounded-xl mb-1 transition-all ${
                active
                  ? "bg-plum-100 dark:bg-plum-800/60 text-plum-700 dark:text-cream-50 font-semibold"
                  : "text-ink-700 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-plum-800/40"
              }`}
              onClick={() => onSelectProject(project.id)}
            >
              <FolderOpen className={`w-4 h-4 shrink-0 ${active ? "text-plum-500" : "text-ink-500 dark:text-cream-200/50"}`} />
              <span className="flex-1 text-xs truncate">{project.name}</span>
              <span className="hidden group-hover:flex items-center gap-0.5">
                <button
                  className="p-1 rounded-full hover:bg-white dark:hover:bg-plum-900/60"
                  onClick={(e) => { e.stopPropagation(); setRenaming(project); }}
                  title="Rename"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                  onClick={(e) => { e.stopPropagation(); void handleDelete(project); }}
                  title="Delete"
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
