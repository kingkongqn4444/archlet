import React, { useState } from "react";
import { Copy, Trash2, Link, Code2, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useShareTokens, useCreateShare, useRevokeShare, useEmbedToggle } from "./use-share";
import type { DiagramResponse } from "@archlet/shared";

type Tab = "link" | "embed";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diagram: Pick<DiagramResponse, "id" | "name" | "publicEmbed">;
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all duration-150 shrink-0 ${
        copied
          ? "bg-plum-500 text-cream-50"
          : "hover:bg-cream-100 dark:hover:bg-plum-800/60 text-ink-700 dark:text-cream-100"
      }`}
      title={label}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function LinkTab({ diagramId }: { diagramId: string }) {
  const { data: tokens = [], isLoading } = useShareTokens(diagramId);
  const { mutate: createShare, isPending: creating } = useCreateShare(diagramId);
  const { mutate: revokeShare, isPending: revoking } = useRevokeShare(diagramId);

  const handleCreate = () => {
    createShare(undefined, {
      onSuccess: (t) => {
        void navigator.clipboard.writeText(t.url);
        toast.success("Link created and copied!");
      },
      onError: () => toast.error("Failed to create share link"),
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCreate}
        disabled={creating}
        className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-full bg-plum-900 text-cream-50 text-sm font-semibold tracking-tight hover:bg-plum-700 hover:scale-[1.01] transition-all duration-150 shadow-soft disabled:opacity-50"
      >
        {creating ? <Loader2 size={14} className="animate-spin" /> : <Link size={14} />}
        Create share link
      </button>

      {isLoading && (
        <p className="text-xs text-ink-500 dark:text-cream-200/60 text-center">Loading…</p>
      )}

      {tokens.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-ink-500 dark:text-cream-200/60 uppercase tracking-widest">
            Active links
          </p>
          {tokens.map((t) => (
            <div
              key={t.token}
              className="flex items-center gap-2 rounded-xl bg-cream-100 dark:bg-plum-900/50 border border-cream-200 dark:border-plum-700/40 px-3 py-2"
            >
              <span className="text-xs text-ink-700 dark:text-cream-100 truncate flex-1 font-mono">
                {t.url}
              </span>
              <CopyButton text={t.url} />
              <button
                onClick={() =>
                  revokeShare(t.token, {
                    onSuccess: () => toast.success("Link revoked"),
                    onError: () => toast.error("Failed to revoke"),
                  })
                }
                disabled={revoking}
                className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 shrink-0 transition"
                title="Revoke"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface EmbedTabProps {
  diagram: Pick<DiagramResponse, "id" | "publicEmbed">;
}

function EmbedTab({ diagram }: EmbedTabProps) {
  const { mutate: toggleEmbed, isPending } = useEmbedToggle(diagram.id);
  const [enabled, setEnabled] = useState(diagram.publicEmbed ?? false);

  const embedUrl = `${window.location.origin}/e/${diagram.id}`;
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;

  const handleToggle = () => {
    const next = !enabled;
    toggleEmbed(next, {
      onSuccess: () => {
        setEnabled(next);
        toast.success(next ? "Embed enabled" : "Embed disabled");
      },
      onError: () => toast.error("Failed to update embed setting"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-cream-100 dark:bg-plum-900/50 border border-cream-200 dark:border-plum-700/40 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink-900 dark:text-cream-50">
            Allow public embed
          </p>
          <p className="text-xs text-ink-500 dark:text-cream-200/60 mt-0.5">
            Anyone can embed this diagram in an iframe
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 shrink-0 ${
            enabled ? "bg-plum-500" : "bg-cream-200 dark:bg-plum-800"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-ink-500 dark:text-cream-200/60 uppercase tracking-widest">
              Embed code
            </p>
            <CopyButton text={iframeSnippet} />
          </div>
          <pre className="rounded-xl bg-ink-900 dark:bg-plum-950 text-cream-50 px-3 py-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {iframeSnippet}
          </pre>
        </div>
      )}
    </div>
  );
}

export function ShareDialog({ open, onOpenChange, diagram }: ShareDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>("link");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Share "{diagram.name}"</DialogTitle>
        </DialogHeader>

        {/* Pill tabs */}
        <div className="inline-flex p-1 rounded-full bg-cream-100 dark:bg-plum-900/40 border border-cream-200 dark:border-plum-700/40 mb-5">
          {(["link", "embed"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-full capitalize transition-all duration-150 ${
                activeTab === tab
                  ? "bg-white dark:bg-plum-700/70 text-plum-700 dark:text-cream-50 font-semibold shadow-soft"
                  : "text-ink-500 dark:text-cream-200/60 hover:text-ink-900 dark:hover:text-cream-50"
              }`}
            >
              {tab === "link" ? <Link size={13} /> : <Code2 size={13} />}
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "link" && <LinkTab diagramId={diagram.id} />}
        {activeTab === "embed" && <EmbedTab diagram={diagram} />}
      </DialogContent>
    </Dialog>
  );
}
