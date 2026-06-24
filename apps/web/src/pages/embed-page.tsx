import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PublicDiagramResponseSchema } from "@archlet/shared";
import { CanvasEditor } from "@/features/canvas/canvas-editor";

const API_BASE = import.meta.env["VITE_API_URL"] ?? "http://localhost:8787";

function fetchEmbedDiagram(id: string) {
  return fetch(`${API_BASE}/api/public/embed/${id}`)
    .then((r) => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    })
    .then((d) => PublicDiagramResponseSchema.parse(d));
}

export function EmbedPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-embed", id],
    queryFn: () => fetchEmbedDiagram(id!),
    enabled: !!id,
    staleTime: 60_000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <p className="text-slate-400 text-sm">Loading…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <p className="text-slate-400 text-sm">Diagram unavailable.</p>
      </div>
    );
  }

  // Minimal layout — full viewport, no chrome, embedable in iframes
  return (
    <div className="w-screen h-screen overflow-hidden">
      <CanvasEditor readOnly initialData={data} />
    </div>
  );
}
