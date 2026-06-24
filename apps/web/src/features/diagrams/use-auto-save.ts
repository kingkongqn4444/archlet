import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { DiagramResponseSchema, type DiagramResponse } from "@archlet/shared";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";

const DEBOUNCE_MS = 1500;

export function useAutoSave(diagramId: string | null) {
  const qc = useQueryClient();
  // track the updatedAt from the last successful save for optimistic concurrency
  const lastSavedAt = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        levelData: ReturnType<typeof buildLevelData>;
        activeLevel: string;
        updatedAt: number;
      };
    }) => apiClient.put(`/api/diagrams/${id}`, payload, DiagramResponseSchema),
    onSuccess: (updated) => {
      lastSavedAt.current = updated.updatedAt;
      qc.setQueryData(["diagram", updated.id], updated);
    },
    onError: () => {
      toast.error("Auto-save failed. Your changes may not be saved.", {
        action: { label: "Retry", onClick: () => triggerSave() },
      });
    },
  });

  function buildLevelData(store: ReturnType<typeof useDiagramStore.getState>) {
    const snapshot = { nodes: store.nodes, edges: store.edges };
    const levels = { ...store.levels, [store.activeLevel]: snapshot };

    const toLevel = (ld: { nodes: typeof store.nodes; edges: typeof store.edges }) => ({
      nodes: ld.nodes.map((n) => ({
        id: n.id,
        type: n.type as string,
        position: n.position,
        data: { label: n.data.label as string, description: n.data.description as string | undefined },
      })),
      edges: ld.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        data: { label: e.data?.label as string | undefined },
      })),
    });

    return {
      high: toLevel(levels.high),
      mid: toLevel(levels.mid),
      low: toLevel(levels.low),
    };
  }

  const triggerSave = useCallback(() => {
    if (!diagramId) return;
    const store = useDiagramStore.getState();
    const levelData = buildLevelData(store);
    const cached = qc.getQueryData<DiagramResponse>(["diagram", diagramId]);
    const updatedAt = lastSavedAt.current ?? cached?.updatedAt;
    if (updatedAt === undefined) return;
    mutation.mutate({
      id: diagramId,
      payload: { levelData, activeLevel: store.activeLevel, updatedAt },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramId]);

  useEffect(() => {
    if (!diagramId) return;

    const unsub = useDiagramStore.subscribe((state, prev) => {
      // only react to canvas content changes, not metadata
      if (
        state.levels === prev.levels &&
        state.nodes === prev.nodes &&
        state.edges === prev.edges &&
        state.activeLevel === prev.activeLevel
      ) {
        return;
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(triggerSave, DEBOUNCE_MS);
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [diagramId, triggerSave]);
}
