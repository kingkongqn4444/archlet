import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { BookOpen, ExternalLink } from "lucide-react";
import { CHAPTERS_CATALOG, chapterHtmlUrl, type Chapter } from "@archlet/shared";

// Side-palette mounted group: 1 tile (BookOpen) → hover opens flyout listing
// all 28 chapters from liquidslr/system-design-notes. Click chapter → open
// GitHub README in new tab (no in-app markdown viewer in Phase 1 framework).

function ChapterRow({ chapter }: { chapter: Chapter }) {
  return (
    <a
      href={chapterHtmlUrl(chapter)}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex items-start gap-2 p-2.5 rounded-lg hover:bg-cream-100 dark:hover:bg-plum-800/50 transition-colors"
    >
      <span className="shrink-0 mt-0.5 text-[10px] font-mono font-semibold text-ink-400 dark:text-cream-200/40 w-6">
        {String(chapter.number).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-ink-900 dark:text-cream-50 truncate">
            {chapter.title}
          </span>
          <ExternalLink size={10} className="text-ink-400 dark:text-cream-200/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
        <p className="text-[11px] text-ink-500 dark:text-cream-200/55 leading-snug line-clamp-2 mt-0.5">
          {chapter.summary}
        </p>
        {chapter.keyConcepts.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {chapter.keyConcepts.slice(0, 3).map((kc) => (
              <span key={kc} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-plum-50 dark:bg-plum-800/40 text-plum-600 dark:text-plum-300">
                {kc}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

function ChapterFlyout({
  anchorTop,
  anchorLeft,
}: { anchorTop: number; anchorLeft: number }) {
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number }>({ top: anchorTop, left: anchorLeft });

  useEffect(() => {
    const maxH = Math.min(window.innerHeight - 40, 600);
    let top = anchorTop;
    if (anchorTop + maxH > window.innerHeight) top = Math.max(20, window.innerHeight - maxH - 20);
    setHoverPos({ top, left: anchorLeft });
  }, [anchorTop, anchorLeft]);

  const content = (
    <div
      style={{ position: "fixed", top: hoverPos.top, left: hoverPos.left, maxHeight: 600, width: 400 }}
      className="z-50 flex flex-col bg-white dark:bg-plum-900 border border-cream-200 dark:border-plum-700/40 rounded-2xl shadow-float overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-cream-200 dark:border-plum-700/40 bg-cream-50 dark:bg-plum-950/40">
        <BookOpen size={14} className="text-plum-600 dark:text-plum-300" />
        <span className="text-[12px] archlet-smallcaps font-semibold text-ink-700 dark:text-cream-100">
          System Design Chapters
        </span>
        <span className="ml-auto text-[10px] text-ink-400 dark:text-cream-200/40">
          {CHAPTERS_CATALOG.length} chapters
        </span>
      </div>
      <div className="overflow-y-auto py-1 px-1">
        {CHAPTERS_CATALOG.map((ch) => (
          <ChapterRow key={ch.id} chapter={ch} />
        ))}
      </div>
      <div className="px-4 py-2 border-t border-cream-200 dark:border-plum-700/40 text-[10px] text-ink-400 dark:text-cream-200/40">
        Source: github.com/liquidslr/system-design-notes
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export function LearnGroup() {
  const [flyout, setFlyout] = useState<{ top: number; left: number } | null>(null);
  const flyoutHoveredRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      if (!flyoutHoveredRef.current) setFlyout(null);
    }, 300);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);

  function handleMouseEnter() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      cancelClose();
      const rect = tileRef.current?.getBoundingClientRect();
      const paletteRect = tileRef.current?.closest("[data-archlet-palette]")?.getBoundingClientRect();
      if (rect && paletteRect) {
        setFlyout({ top: rect.top, left: paletteRect.right + 8 });
      }
    }, 150);
  }

  function handleMouseLeave() {
    if (hoverTimer.current) { clearTimeout(hoverTimer.current); hoverTimer.current = null; }
    scheduleClose();
  }

  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <>
      <div className="mx-2 mt-1 mb-0.5 h-px bg-cream-200/80 dark:bg-plum-700/40" aria-hidden="true" />
      <div className="px-1 pt-0.5 pb-0.5 text-[9px] archlet-smallcaps font-semibold text-ink-300 dark:text-cream-200/40 text-center select-none">
        Learn
      </div>
      <div
        ref={tileRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="System Design Chapters"
        className={`group relative w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer hover:bg-cream-100 dark:hover:bg-plum-800/60 hover:scale-105 transition-all duration-150 select-none text-ink-500 dark:text-cream-200/60 ${
          flyout ? "bg-cream-100 dark:bg-plum-800/60 scale-105" : ""
        }`}
      >
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors group-hover:bg-plum-100 dark:group-hover:bg-white/10 group-hover:text-plum-600 dark:group-hover:text-plum-300">
          <BookOpen size={15} strokeWidth={1.75} />
        </span>
        {!flyout && (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-full ml-2 px-2.5 py-1 rounded-md text-[11px] font-medium bg-ink-900 text-cream-50 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 shadow-soft"
          >
            Chapters
          </span>
        )}
      </div>
      {flyout && (
        <div
          onMouseEnter={() => { flyoutHoveredRef.current = true; cancelClose(); }}
          onMouseLeave={() => { flyoutHoveredRef.current = false; scheduleClose(); }}
        >
          <ChapterFlyout anchorTop={flyout.top} anchorLeft={flyout.left} />
        </div>
      )}
    </>
  );
}
