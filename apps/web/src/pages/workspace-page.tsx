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
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      ) : effectiveProjectId ? (
        <DiagramList projectId={effectiveProjectId} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
          <LayoutDashboard className="w-16 h-16 text-slate-200 dark:text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Create your first project
          </h2>
          <p className="text-sm text-slate-400 max-w-xs">
            Click the <strong>+</strong> button in the Projects sidebar to get started.
          </p>
        </div>
      )}
    </AppShell>
  );
}
