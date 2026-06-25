import { useQuery } from "@tanstack/react-query";
import { chapterReadmeUrl, type Chapter } from "@archlet/shared";

// Fetch raw markdown from GitHub. Cached infinity in TanStack Query.
// Rewrites relative image paths to absolute GH raw URLs so <img> renders.
export function useChapterMarkdown(chapter: Chapter | null) {
  return useQuery({
    queryKey: ["chapter-markdown", chapter?.id],
    enabled: chapter !== null,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async () => {
      if (!chapter) throw new Error("no chapter");
      const url = chapterReadmeUrl(chapter);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const md = await res.text();
      // Rewrite relative img paths → absolute GitHub raw URLs
      const baseRaw = `https://raw.githubusercontent.com/liquidslr/system-design-notes/master/${encodeURI(chapter.folder)}/`;
      return md.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (_m, alt, path) => {
        return `![${alt}](${baseRaw}${path.replace(/^\.\//, "")})`;
      });
    },
  });
}
