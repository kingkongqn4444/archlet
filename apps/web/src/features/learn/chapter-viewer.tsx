import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { chapterHtmlUrl, type Chapter } from "@archlet/shared";
import { useChapterMarkdown } from "./use-chapter-markdown";

// In-app markdown viewer for chapter content. Right-side drawer overlay.
// Fetches raw .md from GitHub at runtime (no rehosting). Sanitized via
// rehype-sanitize to prevent XSS from embedded HTML.

export function ChapterViewer({
  chapter,
  onClose,
}: {
  chapter: Chapter | null;
  onClose: () => void;
}) {
  const { data: markdown, isLoading, error } = useChapterMarkdown(chapter);

  useEffect(() => {
    if (!chapter) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [chapter, onClose]);

  if (!chapter) return null;

  const content = (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      {/* Right drawer */}
      <div className="relative ml-auto w-full max-w-3xl h-full bg-white dark:bg-plum-900 shadow-float flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-cream-200 dark:border-plum-700/40 bg-cream-50 dark:bg-plum-950/40 shrink-0">
          <span className="text-[12px] font-mono font-semibold text-ink-400 dark:text-cream-200/40 w-8">
            {String(chapter.number).padStart(2, "0")}
          </span>
          <h2 className="text-[18px] font-bold text-ink-900 dark:text-cream-50 flex-1 truncate">
            {chapter.title}
          </h2>
          <a
            href={chapterHtmlUrl(chapter)}
            target="_blank"
            rel="noreferrer noopener"
            className="p-1.5 rounded-lg text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800 transition-colors"
            title="Open on GitHub"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-500 dark:text-cream-200/60 hover:bg-cream-100 dark:hover:bg-plum-800 transition-colors"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {isLoading && (
            <div className="flex items-center justify-center py-20 text-ink-500 dark:text-cream-200/50">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-[13px]">Fetching chapter from GitHub…</span>
            </div>
          )}
          {error && (
            <div className="text-[13px] text-red-600 dark:text-red-300 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30">
              Failed to load: {(error as Error).message}.
              <br />
              <a href={chapterHtmlUrl(chapter)} target="_blank" rel="noreferrer noopener" className="underline">
                Open on GitHub instead →
              </a>
            </div>
          )}
          {markdown && (
            <article className="archlet-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {markdown}
              </ReactMarkdown>
            </article>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-cream-200 dark:border-plum-700/40 text-[10px] text-ink-400 dark:text-cream-200/40 shrink-0">
          Source: github.com/liquidslr/system-design-notes — {chapter.folder}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
