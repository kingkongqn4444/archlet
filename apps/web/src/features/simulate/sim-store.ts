import { create } from "zustand";
import type { SimSnapshot } from "./simulator";

type EdgeMetricEntry = number; // req/s
type NodeMetricEntry = { arrivalRate: number; util: number };

type SimState = {
  isRunning: boolean;
  edgeMetrics: Record<string, EdgeMetricEntry>;
  nodeMetrics: Record<string, NodeMetricEntry>;
};

type SimActions = {
  setRunning: (running: boolean) => void;
  applySnapshot: (snap: SimSnapshot) => void;
  clearMetrics: () => void;
};

export const useSimStore = create<SimState & SimActions>()((set) => ({
  isRunning: false,
  edgeMetrics: {},
  nodeMetrics: {},

  setRunning: (running) => set({ isRunning: running }),

  applySnapshot: (snap) =>
    set({
      edgeMetrics: snap.edgeMetrics,
      nodeMetrics: snap.nodeMetrics,
    }),

  clearMetrics: () =>
    set({ edgeMetrics: {}, nodeMetrics: {} }),
}));

