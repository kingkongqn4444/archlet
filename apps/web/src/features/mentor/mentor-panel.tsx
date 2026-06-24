import React, { useEffect, useRef, useState } from "react";
import { X, Trash2, Send, Brain, Loader2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMentorStore } from "./mentor-store";
import { useMentor } from "./use-mentor";
import { useApiKeys } from "@/features/ai/use-api-keys";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "Where's the biggest bottleneck?",
  "How would Netflix solve this?",
  "Should I add a cache?",
  "Estimate this at 10M users",
];

function ProviderBadge() {
  const { keys } = useApiKeys();
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-plum-100 dark:bg-plum-800/60 text-plum-700 dark:text-plum-300 border border-plum-200 dark:border-plum-700/40">
      {keys.defaultProvider} · {keys.defaultModel.split("-").slice(0, 2).join("-")}
    </span>
  );
}

interface MentorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MentorPanel({ open, onOpenChange }: MentorPanelProps) {
  const messages = useMentorStore((s) => s.messages);
  const isStreaming = useMentorStore((s) => s.isStreaming);
  const clear = useMentorStore((s) => s.clear);
  const { send, abort } = useMentor();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Abort stream when panel closes
  useEffect(() => {
    if (!open && isStreaming) abort();
  }, [open, isStreaming, abort]);

  function handleSend() {
    if (!input.trim() || isStreaming) return;
    const text = input;
    setInput("");
    void send(text);
  }

  function handleSuggestion(prompt: string) {
    setInput(prompt);
    // Send immediately
    void send(prompt);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px] flex flex-col p-0 bg-cream-50 dark:bg-plum-950">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200 dark:border-plum-700/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-plum-100 dark:bg-plum-800/60">
              <Brain size={14} className="text-plum-600 dark:text-plum-300" />
            </span>
            <span className="text-[14px] font-semibold text-ink-900 dark:text-cream-50 tracking-tight">
              Mentor
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clear}
              title="Clear history"
              className="w-7 h-7 inline-flex items-center justify-center rounded-full text-ink-500 dark:text-cream-200/50 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              title="Close"
              className="w-7 h-7 inline-flex items-center justify-center rounded-full text-ink-500 dark:text-cream-200/50 hover:bg-cream-100 dark:hover:bg-plum-800/60 transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {isEmpty ? (
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="w-12 h-12 rounded-full bg-plum-100 dark:bg-plum-800/60 flex items-center justify-center">
                <Brain size={22} className="text-plum-500 dark:text-plum-300" />
              </div>
              <p className="text-[13px] text-ink-500 dark:text-cream-200/60 text-center leading-relaxed">
                Ask me anything about your design
              </p>
              <div className="flex flex-col gap-2 w-full">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSuggestion(p)}
                    className="w-full text-left px-3 py-2 rounded-xl text-[12px] text-plum-700 dark:text-plum-300 bg-plum-50 dark:bg-plum-900/60 border border-plum-100 dark:border-plum-700/40 hover:bg-plum-100 dark:hover:bg-plum-800/60 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2 max-w-full",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <span className="w-6 h-6 mt-0.5 rounded-full bg-plum-100 dark:bg-plum-800/60 flex items-center justify-center shrink-0">
                    <Brain size={11} className="text-plum-600 dark:text-plum-300" />
                  </span>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-[13px] leading-relaxed max-w-[85%] whitespace-pre-wrap break-words",
                    msg.role === "user"
                      ? "bg-plum-100 dark:bg-plum-700/60 text-ink-900 dark:text-cream-50 rounded-br-sm"
                      : "bg-cream-100 dark:bg-plum-900/60 text-ink-800 dark:text-cream-100 rounded-bl-sm border border-cream-200 dark:border-plum-700/40"
                  )}
                >
                  {msg.content}
                  {msg.role === "assistant" &&
                    isStreaming &&
                    i === messages.length - 1 &&
                    !msg.content && (
                      <Loader2 size={12} className="animate-spin inline-block text-plum-500" />
                    )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-cream-200 dark:border-plum-700/40 px-3 py-3 flex flex-col gap-2">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your design…"
              disabled={isStreaming}
              className="flex-1 resize-none rounded-xl px-3 py-2 text-[13px] bg-white dark:bg-plum-900/60 border border-cream-200 dark:border-plum-700/40 text-ink-900 dark:text-cream-50 placeholder:text-ink-400 dark:placeholder:text-cream-200/40 focus:outline-none focus:ring-2 focus:ring-plum-500 disabled:opacity-50 transition"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              title="Send (Enter)"
              className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-full bg-plum-900 dark:bg-plum-600 text-cream-50 hover:bg-plum-700 dark:hover:bg-plum-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 hover:scale-105"
            >
              {isStreaming ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <ProviderBadge />
            <span className="text-[10px] text-ink-400 dark:text-cream-200/40">↵ send · ⇧↵ newline</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
