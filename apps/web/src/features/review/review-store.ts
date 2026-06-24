import { create } from "zustand";
import type { Finding } from "./types";

type Grade = "A" | "B" | "C" | "D" | "F";

type ReviewState = {
  findings: Finding[];
  score: number;
  grade: Grade;
  isOpen: boolean;
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
};

type ReviewActions = {
  setFindings: (findings: Finding[], score: number, grade: Grade) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  highlightFinding: (f: Finding | null) => void;
};

export const useReviewStore = create<ReviewState & ReviewActions>()((set) => ({
  findings: [],
  score: 100,
  grade: "A",
  isOpen: false,
  highlightedNodeIds: new Set(),
  highlightedEdgeIds: new Set(),

  setFindings: (findings, score, grade) =>
    set({ findings, score, grade }),

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  highlightFinding: (f) =>
    set({
      highlightedNodeIds: new Set(f?.nodeIds ?? []),
      highlightedEdgeIds: new Set(f?.edgeIds ?? []),
    }),
}));
