import { create } from "zustand";
import type { SimSnapshot } from "./simulator";

type EdgeMetricEntry = number; // req/s
type NodeMetricEntry = { arrivalRate: number; util: number };

type SimState = {
  isRunning: boolean;
  edgeMetrics: Record<string, EdgeMetricEntry>;
  nodeMetrics: Record<string, NodeMetricEntry>;
  deadNodes: Set<string>;
  failureModeActive: boolean;
};

type SimActions = {
  setRunning: (running: boolean) => void;
  applySnapshot: (snap: SimSnapshot) => void;
  clearMetrics: () => void;
  setDeadNode: (id: string, dead: boolean) => void;
  clearDeadNodes: () => void;
  setFailureModeActive: (active: boolean) => void;
};

export const useSimStore = create<SimState & SimActions>()((set) => ({
  isRunning: false,
  edgeMetrics: {},
  nodeMetrics: {},
  deadNodes: new Set<string>(),
  failureModeActive: false,

  setRunning: (running) => set({ isRunning: running }),

  applySnapshot: (snap) =>
    set({
      edgeMetrics: snap.edgeMetrics,
      nodeMetrics: snap.nodeMetrics,
    }),

  clearMetrics: () =>
    set({ edgeMetrics: {}, nodeMetrics: {} }),

  setDeadNode: (id, dead) =>
    set((s) => {
      const next = new Set(s.deadNodes);
      if (dead) next.add(id);
      else next.delete(id);
      return { deadNodes: next };
    }),

  clearDeadNodes: () => set({ deadNodes: new Set<string>() }),

  setFailureModeActive: (active) => set({ failureModeActive: active }),
}));

