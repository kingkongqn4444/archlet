import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { DiagramResponseSchema } from "@archlet/shared";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";

export function useDiagram(id: string | null) {
  const loadDiagram = useDiagramStore((s) => s.loadDiagram);

  const query = useQuery({
    queryKey: ["diagram", id],
    queryFn: () => apiClient.get(`/api/diagrams/${id}`, DiagramResponseSchema),
    enabled: !!id,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!query.data) return;
    const d = query.data;
    loadDiagram({
      id: d.id,
      name: d.name,
      activeLevel: d.activeLevel,
      levels: d.levelData,
    });
  }, [query.data, loadDiagram]);

  return query;
}
