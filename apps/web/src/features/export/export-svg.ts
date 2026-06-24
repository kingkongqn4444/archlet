import { toSvg } from "html-to-image";

/** Returns an SVG blob of the given element. */
export async function htmlToSvg(el: HTMLElement): Promise<Blob> {
  const dataUrl = await toSvg(el, {
    backgroundColor: "#fefcf6",
    cacheBust: true,
  });
  const res = await fetch(dataUrl);
  return res.blob();
}
