import { useParams, Navigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { CanvasEditor } from "@/features/canvas/canvas-editor";
import { useDiagram } from "@/features/diagrams/use-diagram";
import { useAutoSave } from "@/features/diagrams/use-auto-save";
import { useQueryClient } from "@tanstack/react-query";

function CanvasPageInner({ id }: { id: string }) {
  const { data, isLoading, isError } = useDiagram(id);
  const qc = useQueryClient();

  // derive projectId from cached diagram for sidebar highlight
  const projectId = data?.projectId ?? null;

  useAutoSave(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400 text-sm">Loading diagram…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400 text-sm">Failed to load diagram.</p>
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
