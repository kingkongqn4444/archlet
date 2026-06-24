import { create } from "zustand";
import { estimateCost, type LineItem } from "@archlet/shared";
import { useDiagramStore } from "@/features/canvas/store/diagram-store";

export type NodeCost = {
  nodeId: string;
  label: string;
  type: string;
  variant: string;
  monthly: number;
  lineItems: LineItem[];
};

type CostState = {
  isOpen: boolean;
  total: number;
  breakdown: NodeCost[];
};

type CostActions = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  computeNow: () => void;
};

export const useCostStore = create<CostState & CostActions>()((set) => ({
  isOpen: false,
  total: 0,
  breakdown: [],

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  computeNow: () => {
    const { nodes } = useDiagramStore.getState();
    const breakdown: NodeCost[] = nodes.map((n) => {
      const type = n.type as string;
      const variant = (n.data.variant as string) ?? "";
      const config = (n.data.config as Record<string, unknown>) ?? {};
      const est = estimateCost(type, variant, config);
      return {
        nodeId: n.id,
        label: String(n.data.label ?? n.id),
        type,
        variant,
        monthly: est.monthly,
        lineItems: est.lineItems,
      };
    });
    const total = breakdown.reduce((t, b) => t + b.monthly, 0);
    set({ breakdown, total });
  },
}));

// Subscribe to diagram changes and recompute
useDiagramStore.subscribe(() => {
  useCostStore.getState().computeNow();
});
