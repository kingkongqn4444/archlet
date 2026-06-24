import React, { useState } from "react";
import { Copy, Trash2, Link, Code2, Loader2 } from "lucide-react";
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
      title="Copy"
    >
      <Copy size={14} className={copied ? "text-green-500" : ""} />
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
        className="flex items-center gap-2 w-full justify-center px-3 py-2 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm hover:opacity-90 disabled:opacity-50"
      >
        {creating ? <Loader2 size={14} className="animate-spin" /> : <Link size={14} />}
        Create share link
      </button>

      {isLoading && (
        <p className="text-xs text-slate-400 text-center">Loading…</p>
      )}

      {tokens.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active links</p>
          {tokens.map((t) => (
            <div key={t.token} className="flex items-center gap-2 rounded border border-slate-200 dark:border-slate-700 px-2 py-1.5">
              <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1 font-mono">
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
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 shrink-0"
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Allow public embed</p>
          <p className="text-xs text-slate-500">Anyone can embed this diagram in an iframe</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            enabled ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Embed code</p>
          <div className="flex items-start gap-2 rounded border border-slate-200 dark:border-slate-700 px-2 py-1.5">
            <code className="text-xs text-slate-600 dark:text-slate-300 break-all flex-1">
              {iframeSnippet}
            </code>
            <CopyButton text={iframeSnippet} />
          </div>
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
          {(["link", "embed"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-slate-900 dark:border-slate-100 font-medium"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
