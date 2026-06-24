import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { ProjectResponseSchema } from "@archlet/shared";

const ProjectListSchema = z.array(ProjectResponseSchema);

const QUERY_KEY = ["projects"] as const;

export function useProjects() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiClient.get("/api/projects", ProjectListSchema),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiClient.post("/api/projects", { name }, ProjectResponseSchema),
    onSuccess: (project) => {
      qc.setQueryData(QUERY_KEY, (prev: z.infer<typeof ProjectListSchema> = []) => [
        project,
        ...prev,
      ]);
    },
  });
}

export function useRenameProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient.patch(`/api/projects/${id}`, { name }, ProjectResponseSchema),
    onSuccess: (updated) => {
      qc.setQueryData(QUERY_KEY, (prev: z.infer<typeof ProjectListSchema> = []) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/projects/${id}`),
    onSuccess: (_, id) => {
      qc.setQueryData(QUERY_KEY, (prev: z.infer<typeof ProjectListSchema> = []) =>
        prev.filter((p) => p.id !== id)
      );
    },
  });
}
