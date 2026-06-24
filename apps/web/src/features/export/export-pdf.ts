import { jsPDF } from "jspdf";
import { htmlToPng } from "./export-png";

export interface PdfExportOptions {
  scale?: 1 | 2 | 3;
}

/** Renders element as PNG, embeds in landscape jsPDF, returns Blob. */
export async function htmlToPdf(el: HTMLElement, opts: PdfExportOptions = {}): Promise<Blob> {
  const { scale = 2 } = opts;
  const blob = await htmlToPng(el, { transparent: false, scale });

  const imgUrl = URL.createObjectURL(blob);
  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const orientation = w >= h ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "px", format: [w, h] });
      pdf.addImage(imgUrl, "PNG", 0, 0, w, h);
      URL.revokeObjectURL(imgUrl);
      const pdfBlob = pdf.output("blob");
      resolve(pdfBlob);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(imgUrl);
      reject(e);
    };
    img.src = imgUrl;
  });
}
