import { create } from "zustand";

export type MentorMessage = {
  role: "user" | "assistant";
  content: string;
  ts: number;
};

type MentorState = {
  isOpen: boolean;
  messages: MentorMessage[];
  isStreaming: boolean;
};

type MentorActions = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  addMessage: (msg: MentorMessage) => void;
  appendToLast: (chunk: string) => void;
  clear: () => void;
  setStreaming: (v: boolean) => void;
};

export type MentorStore = MentorState & MentorActions;

function loadMessages(diagramId: string): MentorMessage[] {
  if (!diagramId) return [];
  try {
    const raw = localStorage.getItem(`archlet_mentor_${diagramId}`);
    return raw ? (JSON.parse(raw) as MentorMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(diagramId: string, messages: MentorMessage[]): void {
  if (!diagramId) return;
  try {
    localStorage.setItem(`archlet_mentor_${diagramId}`, JSON.stringify(messages));
  } catch {
    // ignore quota errors
  }
}

let _diagramId = "";

export function initMentorStore(diagramId: string): void {
  _diagramId = diagramId;
  const messages = loadMessages(diagramId);
  useMentorStore.setState({ messages });
}

export const useMentorStore = create<MentorStore>()((set, get) => ({
  isOpen: false,
  messages: [],
  isStreaming: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  addMessage: (msg) => {
    const messages = [...get().messages, msg];
    set({ messages });
    saveMessages(_diagramId, messages);
  },

  appendToLast: (chunk) => {
    const prev = get().messages;
    if (prev.length === 0) return;
    const messages = prev.map((m, i) =>
      i === prev.length - 1 ? { ...m, content: m.content + chunk } : m
    );
    set({ messages });
    saveMessages(_diagramId, messages);
  },

  clear: () => {
    set({ messages: [] });
    saveMessages(_diagramId, []);
  },

  setStreaming: (v) => set({ isStreaming: v }),
}));
