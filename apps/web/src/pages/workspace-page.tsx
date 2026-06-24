import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DiagramList } from "@/features/diagrams/diagram-list";
import { useProjects } from "@/features/projects/use-projects";
import { LayoutDashboard } from "lucide-react";

export function WorkspacePage() {
  const { data: projects = [], isLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-select first project when list loads
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
        <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8">
          <div className="w-20 h-20 rounded-3xl bg-plum-100 dark:bg-plum-900/40 flex items-center justify-center">
            <LayoutDashboard className="w-9 h-9 text-plum-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-ink-900 dark:text-cream-50">
            Create your first project
          </h2>
          <p className="text-sm text-ink-500 dark:text-cream-200/60 max-w-xs leading-relaxed">
            Click the <strong className="text-plum-500">+</strong> button in the Projects sidebar to get started.
          </p>
        </div>
      )}
    </AppShell>
  );
}
