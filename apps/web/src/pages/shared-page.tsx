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
      <div className="flex items-center justify-center h-screen bg-cream-50 dark:bg-plum-950">
        <p className="text-ink-500 dark:text-cream-200/60 text-sm">Loading diagram…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream-50 dark:bg-plum-950">
        <div className="text-center space-y-3 max-w-sm px-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-plum-100 dark:bg-plum-900/40 flex items-center justify-center text-2xl">
            🔒
          </div>
          <p className="text-ink-900 dark:text-cream-50 font-bold tracking-tight text-lg">
            Diagram not found
          </p>
          <p className="text-ink-500 dark:text-cream-200/60 text-sm">
            This link may have expired or been revoked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-cream-50 dark:bg-plum-950">
      <CanvasEditor readOnly initialData={data} />
    </div>
  );
}
