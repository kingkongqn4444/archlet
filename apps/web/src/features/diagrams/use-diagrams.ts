import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { DiagramResponseSchema } from "@archlet/shared";

const DiagramListSchema = z.array(DiagramResponseSchema);

const listKey = (projectId: string) => ["diagrams", projectId] as const;

export function useDiagramList(projectId: string | null) {
  return useQuery({
    queryKey: listKey(projectId ?? ""),
    queryFn: () =>
      apiClient.get(`/api/diagrams?projectId=${projectId}`, DiagramListSchema),
    enabled: !!projectId,
  });
}

export function useCreateDiagram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { projectId: string; name?: string }) =>
      apiClient.post("/api/diagrams", params, DiagramResponseSchema),
    onSuccess: (diagram) => {
      qc.setQueryData(
        listKey(diagram.projectId),
        (prev: z.infer<typeof DiagramListSchema> = []) => [diagram, ...prev]
      );
    },
  });
}

export function useRenameDiagram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient.patch(`/api/diagrams/${id}`, { name }, DiagramResponseSchema),
    onSuccess: (updated) => {
      qc.setQueryData(
        listKey(updated.projectId),
        (prev: z.infer<typeof DiagramListSchema> = []) =>
          prev.map((d) => (d.id === updated.id ? updated : d))
      );
      qc.setQueryData(["diagram", updated.id], updated);
    },
  });
}

export function useDeleteDiagram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      apiClient.delete(`/api/diagrams/${id}`).then(() => ({ id, projectId })),
    onSuccess: ({ id, projectId }) => {
      qc.setQueryData(
        listKey(projectId),
        (prev: z.infer<typeof DiagramListSchema> = []) =>
          prev.filter((d) => d.id !== id)
      );
      qc.removeQueries({ queryKey: ["diagram", id] });
    },
  });
}
