import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { MonochromeTranscript, type TranscriptModule } from "@/components/certigo/MonochromeTranscript";

export interface TranscriptPdfData {
  serial: string;
  recipientName: string;
  programmeTitle: string;
  certificateId: string;
  issueDate: string;
  verifyUrl: string;
  modules: TranscriptModule[];
  finalGrade?: string;
  finalScorePct?: number;
  totalHours?: number;
}

/** Render the A4 transcript off-screen and export it as a single-page PDF. */
export async function downloadTranscriptPdf(t: TranscriptPdfData) {
  const RENDER_WIDTH = 1000;
  const RENDER_HEIGHT = Math.round(RENDER_WIDTH * 1.414);

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
    createElement(MonochromeTranscript, {
      recipientName: t.recipientName,
      programmeTitle: t.programmeTitle,
      certificateId: t.certificateId,
      issueDate: t.issueDate,
      verifyUrl: t.verifyUrl,
      modules: t.modules,
      finalGrade: t.finalGrade,
      finalScorePct: t.finalScorePct,
      totalHours: t.totalHours,
    }),
  );

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
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, w, h, "F");
    doc.addImage(img, "PNG", 0, 0, w, h, undefined, "FAST");
    doc.save(`transcript-${t.serial}.pdf`);
  } finally {
    root.unmount();
    host.remove();
  }
}