import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";

/** A4 portrait printable area in PDF points (jsPDF default). */
const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const PAGE_MARGIN_PT = 40;
const CONTENT_WIDTH_PT = A4_WIDTH_PT - PAGE_MARGIN_PT * 2;
const CONTENT_HEIGHT_PT = A4_HEIGHT_PT - PAGE_MARGIN_PT * 2;

/** DOM width that maps cleanly to A4 content width at capture time. */
export const PDF_CAPTURE_WIDTH_PX = 720;

/** Balance legibility vs file size for rasterized itinerary PDFs. */
const PDF_CAPTURE_PIXEL_RATIO = 1.25;
const PDF_JPEG_QUALITY = 0.82;

function canvasToJpegDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", PDF_JPEG_QUALITY);
}

/**
 * Capture a DOM element and download it as a legible multi-page A4 portrait PDF.
 * The element should be styled at {@link PDF_CAPTURE_WIDTH_PX}px wide for best results.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const previousWidth = element.style.width;
  const previousMaxWidth = element.style.maxWidth;
  element.style.width = `${PDF_CAPTURE_WIDTH_PX}px`;
  element.style.maxWidth = `${PDF_CAPTURE_WIDTH_PX}px`;

  try {
    const canvas = await toCanvas(element, {
      pixelRatio: PDF_CAPTURE_PIXEL_RATIO,
      width: PDF_CAPTURE_WIDTH_PX,
      backgroundColor: "#ffffff",
      cacheBust: true,
    });

    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4", compress: true });
    const sliceHeightPx = (CONTENT_HEIGHT_PT * canvas.width) / CONTENT_WIDTH_PT;
    const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const sourceY = pageIndex * sliceHeightPx;
      const sourceHeight = Math.min(sliceHeightPx, canvas.height - sourceY);
      const destHeightPt = (sourceHeight * CONTENT_WIDTH_PT) / canvas.width;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;

      const context = pageCanvas.getContext("2d");
      if (!context) {
        throw new Error("Could not prepare PDF page.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sourceHeight,
        0,
        0,
        canvas.width,
        sourceHeight,
      );

      pdf.addImage(
        canvasToJpegDataUrl(pageCanvas),
        "JPEG",
        PAGE_MARGIN_PT,
        PAGE_MARGIN_PT,
        CONTENT_WIDTH_PT,
        destHeightPt,
        undefined,
        "FAST",
      );
    }

    pdf.save(filename);
  } finally {
    element.style.width = previousWidth;
    element.style.maxWidth = previousMaxWidth;
  }
}
