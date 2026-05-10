import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { CertificateView, type CertOrientation, type CertTemplate } from "@/components/kredo/CertificateView";

export interface CertData {
  serial: string;
  recipientName: string;
  courseTopic: string;
  score?: number | null;
  issuedAt: string;
  verifyUrl: string;
  watermark?: boolean;
  orientation?: CertOrientation;
  template?: CertTemplate;
}

/**
 * Render the React CertificateView off-screen at full A4-landscape size,
 * capture with html2canvas, and embed in a single-page PDF so the export
 * matches the on-screen preview pixel-for-pixel.
 */
export async function downloadCertificatePdf(c: CertData) {
  const isPortrait = c.orientation === "portrait";
  const RENDER_WIDTH = isPortrait ? 1000 : 1414;
  const RENDER_HEIGHT = isPortrait ? Math.round(RENDER_WIDTH * 1.414) : Math.round(RENDER_WIDTH / 1.414);

  const host = document.createElement("div");
  host.style.cssText = [
    "position:fixed",
    "left:-100000px",
    "top:0",
    `width:${RENDER_WIDTH}px`,
    `height:${RENDER_HEIGHT}px`,
    "background:#ffffff",
    "z-index:-1",
    "pointer-events:none",
  ].join(";");
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(
    createElement(CertificateView, {
      serial: c.serial,
      recipientName: c.recipientName,
      courseTopic: c.courseTopic,
      score: c.score,
      issuedAt: c.issuedAt,
      verifyUrl: c.verifyUrl,
      watermark: c.watermark,
      compact: false,
      orientation: c.orientation,
      template: c.template,
    }),
  );

  // wait for QR code, images, and fonts to settle
  await new Promise((r) => setTimeout(r, 600));
  if ((document as any).fonts?.ready) {
    try { await (document as any).fonts.ready; } catch { /* noop */ }
  }

  try {
    const canvas = await html2canvas(host, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      width: RENDER_WIDTH,
      height: RENDER_HEIGHT,
      windowWidth: RENDER_WIDTH,
      windowHeight: RENDER_HEIGHT,
    });
    const img = canvas.toDataURL("image/png");

    const doc = new jsPDF({ orientation: isPortrait ? "portrait" : "landscape", unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, w, h, "F");
    doc.addImage(img, "PNG", 0, 0, w, h, undefined, "FAST");
    const themeSuffix = c.template ? `-${c.template}` : "";
    doc.save(`certigo-${c.serial}${themeSuffix}.pdf`);
  } finally {
    root.unmount();
    host.remove();
  }
}
