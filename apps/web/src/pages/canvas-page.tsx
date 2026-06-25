import { useParams, Navigate, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { CanvasEditor } from "@/features/canvas/canvas-editor";
import { useDiagram } from "@/features/diagrams/use-diagram";
import { useAutoSave } from "@/features/diagrams/use-auto-save";
import { useQueryClient } from "@tanstack/react-query";

function CanvasPageInner({ id }: { id: string }) {
  const { data, isLoading, isError } = useDiagram(id);
  const qc = useQueryClient();
  const navigate = useNavigate();

  // derive projectId from cached diagram for sidebar highlight
  const projectId = data?.projectId ?? null;

  useAutoSave(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-cream-50 dark:bg-plum-950">
        <p className="text-ink-500 dark:text-cream-200/60 text-sm">Loading diagram…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full bg-cream-50 dark:bg-plum-950">
        <p className="text-red-500 text-sm">Failed to load diagram.</p>
      </div>
    );
  }

  function handleProjectSelect(pid: string) {
    // Prefetch diagrams list when user switches project
    void qc.prefetchQuery({
      queryKey: ["diagrams", pid],
      queryFn: () =>
        fetch(`${import.meta.env["VITE_API_URL"] ?? "http://localhost:8787"}/api/diagrams?projectId=${pid}`, {
          credentials: "include",
        }).then((r) => r.json()),
    });
    // Navigate back to workspace with the new project pre-selected so user
    // sees that project's diagrams list instead of staying on current canvas.
    navigate(`/d?project=${encodeURIComponent(pid)}`);
  }

  return (
    <AppShell activeProjectId={projectId} onProjectSelect={handleProjectSelect}>
      <CanvasEditor />
    </AppShell>
  );
}

export function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/d" replace />;
  return <CanvasPageInner id={id} />;
}
