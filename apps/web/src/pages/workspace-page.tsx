import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, FolderPlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DiagramList } from "@/features/diagrams/diagram-list";
import { useProjects, useCreateProject } from "@/features/projects/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function WorkspacePage() {
  const { data: projects = [], isLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const effectiveProjectId =
    selectedProjectId ?? (projects[0]?.id ?? null);

  return (
    <AppShell
      activeProjectId={effectiveProjectId}
      onProjectSelect={setSelectedProjectId}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-ink-500 dark:text-cream-200/60 text-sm">Loading…</p>
        </div>
      ) : effectiveProjectId ? (
        <DiagramList projectId={effectiveProjectId} />
      ) : (
        <EmptyWorkspace onCreate={() => setShowNew(true)} />
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
          <NewProjectForm onClose={() => setShowNew(false)} />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function EmptyWorkspace({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative flex flex-col items-center justify-center h-full px-8 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-plum-100 dark:bg-plum-900/40 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-100 dark:bg-amber-900/20 blur-3xl opacity-50" />

      <div className="relative flex flex-col items-center text-center gap-6 max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-plum-900/40 border border-cream-200 dark:border-plum-700/40 shadow-sm backdrop-blur">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-ink-700 dark:text-cream-200">
            Welcome to archlet
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink-900 dark:text-cream-50 leading-tight">
          Let’s design your
          <br />
          <span className="relative inline-block">
            first system
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 200 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 9 C 50 1, 150 1, 198 9"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
        </h1>

        <p className="text-base text-ink-500 dark:text-cream-200/70 leading-relaxed">
          Group diagrams into <strong className="text-ink-700 dark:text-cream-100">projects</strong>.
          Each project can have many diagrams — one per service, feature, or pitch.
        </p>

        <Button
          onClick={onCreate}
          size="lg"
          className="bg-plum-900 hover:bg-plum-700 text-cream-50 shadow-lg shadow-plum-900/20 px-6 py-6 text-base gap-2"
        >
          <FolderPlus className="w-5 h-5" />
          Create your first project
        </Button>

        <p className="text-xs text-ink-500 dark:text-cream-200/50">
          Tip: you can also click the
          <span className="inline-flex mx-1 w-4 h-4 items-center justify-center rounded-full bg-plum-500 text-white text-[10px] font-bold align-middle">+</span>
          in the Projects sidebar.
        </p>
      </div>
    </div>
  );
}

function NewProjectForm({ onClose }: { onClose: () => void }) {
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
        placeholder="e.g. Photo Sharing Service"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={create.isPending || !name.trim()}>
          Create
        </Button>
      </div>
    </form>
  );
}
