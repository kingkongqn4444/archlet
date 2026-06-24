import React, { useEffect, useRef, useState } from "react";
import { X, Trash2, Send, Brain, Loader2, Sparkles } from "lucide-react";
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
  const model = keys.defaultModel.split("-").slice(0, 2).join("-");
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/40 border border-white/10">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60 shrink-0" />
      {keys.defaultProvider} · {model}
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <Sheet open={open} onOpenChange={onOpenChange} noBackdrop>
      <SheetContent
        className="w-[380px] flex flex-col p-0"
        style={{
          background: "linear-gradient(180deg, #1a0f2e 0%, #140c24 100%)",
          borderLeft: "1px solid rgba(139, 92, 246, 0.15)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            {/* Glowing brain icon */}
            <div
              className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(109,40,217,0.2) 100%)",
                border: "1px solid rgba(139,92,246,0.3)",
                boxShadow: "0 0 12px rgba(139,92,246,0.25)",
              }}
            >
              <Brain size={15} className="text-violet-300" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white tracking-tight leading-none">Mentor</div>
              <div className="text-[10px] text-white/30 mt-0.5">AI design advisor</div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={clear}
              title="Clear history"
              className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all duration-150"
            >
              <Trash2 size={12} />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              title="Close"
              className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all duration-150"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 scrollbar-thin">
          {isEmpty ? (
            <div className="flex flex-col items-center gap-5 mt-4">
              {/* Hero icon with glow */}
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(109,40,217,0.1) 100%)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    boxShadow: "0 0 30px rgba(139,92,246,0.2)",
                  }}
                >
                  <Brain size={28} className="text-violet-300" />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 0 8px rgba(245,158,11,0.5)" }}
                >
                  <Sparkles size={10} className="text-white" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-[13px] font-medium text-white/70 leading-relaxed">
                  Ask me anything about your design
                </p>
                <p className="text-[11px] text-white/25 mt-1">
                  I analyze your nodes, edges and sim metrics
                </p>
              </div>

              {/* Suggested prompts */}
              <div className="flex flex-col gap-2 w-full">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSuggestion(p)}
                    className="group w-full text-left px-3.5 py-2.5 rounded-xl text-[12px] text-white/60 hover:text-white/90 transition-all duration-150"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(139,92,246,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLButtonElement).style.border = "1px solid rgba(255,255,255,0.07)";
                    }}
                  >
                    <span className="text-violet-400/60 mr-2">→</span>
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
                  "flex gap-2.5 max-w-full",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div
                    className="w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(109,40,217,0.15))",
                      border: "1px solid rgba(139,92,246,0.25)",
                    }}
                  >
                    <Brain size={11} className="text-violet-300" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[84%] whitespace-pre-wrap break-words",
                    msg.role === "user"
                      ? "rounded-br-sm text-white/90"
                      : "rounded-bl-sm text-white/75"
                  )}
                  style={
                    msg.role === "user"
                      ? {
                          background: "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(109,40,217,0.15) 100%)",
                          border: "1px solid rgba(139,92,246,0.2)",
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }
                  }
                >
                  {msg.content}
                  {msg.role === "assistant" &&
                    isStreaming &&
                    i === messages.length - 1 &&
                    !msg.content && (
                      <span className="inline-flex gap-1 items-center">
                        <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="shrink-0 px-4 py-4 flex flex-col gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex gap-2 items-end rounded-2xl p-2"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your design…"
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent text-[13px] text-white/80 placeholder:text-white/25 focus:outline-none disabled:opacity-40 px-1 py-0.5 leading-relaxed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              title="Send (Enter)"
              className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 hover:scale-105"
              style={{
                background: input.trim() && !isStreaming
                  ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                  : "rgba(255,255,255,0.06)",
                boxShadow: input.trim() && !isStreaming ? "0 0 12px rgba(124,58,237,0.4)" : "none",
              }}
            >
              {isStreaming ? (
                <Loader2 size={13} className="animate-spin text-white/50" />
              ) : (
                <Send size={12} className={input.trim() ? "text-white" : "text-white/30"} />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between px-1">
            <ProviderBadge />
            <span className="text-[10px] text-white/20">↵ send · ⇧↵ newline</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
