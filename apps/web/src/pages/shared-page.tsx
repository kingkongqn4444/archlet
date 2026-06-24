import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PublicDiagramResponseSchema } from "@archlet/shared";
import { CanvasEditor } from "@/features/canvas/canvas-editor";

const API_BASE = import.meta.env["VITE_API_URL"] ?? "http://localhost:8787";

function fetchPublicDiagram(token: string) {
  return fetch(`${API_BASE}/api/public/diagram/${token}`)
    .then((r) => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    })
    .then((d) => PublicDiagramResponseSchema.parse(d));
}

export function SharedPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-diagram", token],
    queryFn: () => fetchPublicDiagram(token!),
    enabled: !!token,
    staleTime: 60_000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-400 text-sm">Loading diagram…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <p className="text-slate-600 font-medium">Diagram not found</p>
          <p className="text-slate-400 text-sm">This link may have expired or been revoked.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-white dark:bg-slate-950">
      <CanvasEditor readOnly initialData={data} />
    </div>
  );
}
