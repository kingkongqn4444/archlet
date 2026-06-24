import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  ShareResponseSchema,
  type ShareResponse,
  type CreateShareRequest,
} from "@archlet/shared";
import { z } from "zod";

const ShareListSchema = z.array(ShareResponseSchema);

// List all share tokens filtered to a specific diagram
export function useShareTokens(diagramId: string) {
  return useQuery({
    queryKey: ["share-tokens", diagramId],
    queryFn: async () => {
      const all = await apiClient.get<ShareResponse[]>("/api/share", ShareListSchema);
      return all.filter((t) => t.diagramId === diagramId);
    },
    staleTime: 10_000,
  });
}

// Create a share token for a diagram
export function useCreateShare(diagramId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { expiresIn?: number }) =>
      apiClient.post<ShareResponse>(
        "/api/share",
        { diagramId, ...payload } satisfies CreateShareRequest,
        ShareResponseSchema
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["share-tokens", diagramId] });
    },
  });
}

// Revoke (delete) a share token
export function useRevokeShare(diagramId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      apiClient.delete<{ ok: boolean }>(`/api/share/${token}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["share-tokens", diagramId] });
    },
  });
}

// Toggle public embed for a diagram
export function useEmbedToggle(diagramId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) =>
      apiClient.patch<{ ok: boolean; publicEmbed: boolean }>(
        `/api/diagrams/${diagramId}/embed`,
        { enabled }
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["diagram", diagramId] });
    },
  });
}
