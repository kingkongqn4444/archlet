import { toPng } from "html-to-image";

export interface PngExportOptions {
  transparent?: boolean;
  scale?: 1 | 2 | 3;
}

/** Returns a PNG blob of the given element. */
export async function htmlToPng(el: HTMLElement, options: PngExportOptions = {}): Promise<Blob> {
  const { transparent = false, scale = 1 } = options;
  const toPngOptions = {
    pixelRatio: scale,
    cacheBust: true,
    ...(transparent ? {} : { backgroundColor: "#fefcf6" }),
  };
  const dataUrl = await toPng(el, toPngOptions);
  const res = await fetch(dataUrl);
  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
