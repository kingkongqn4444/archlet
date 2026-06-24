import { create } from "zustand";

type PanelState = {
  nodeId: string | null;
  open: (id: string) => void;
  close: () => void;
};

export const usePropertiesPanel = create<PanelState>((set) => ({
  nodeId: null,
  open: (id) => set({ nodeId: id }),
  close: () => set({ nodeId: null }),
}));
