import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import QRCode from "qrcode";
import type { ReactElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { MonochromeCertificate } from "@/components/certigo/MonochromeCertificate";
import { MonochromeTranscript } from "@/components/certigo/MonochromeTranscript";
import type { CertificateDocument } from "@/lib/certificate-data";

/**
 * Print and PDF are rendered from the very same React components shown on
 * screen, at a fixed A4 size, so all three always look identical.
 * This module is loaded on demand (dynamic import) to keep pages light.
 */
export const CERT_SIZE = { w: 1123, h: 794 }; // A4 landscape at 96 dpi
export const TRANSCRIPT_SIZE = { w: 794, h: 1123 }; // A4 portrait at 96 dpi

interface Page { orientation: "landscape" | "portrait"; image: string }

async function renderNode(node: ReactElement, w: number, h: number): Promise<string> {
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-100000px;top:0;width:${w}px;height:${h}px;background:#fff;pointer-events:none;`;
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(node));
    try { await (document as any).fonts?.ready; } catch { /* noop */ }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await Promise.all(Array.from(host.querySelectorAll("img")).map((img) =>
      img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
    const canvas = await html2canvas(host, {
      backgroundColor: "#ffffff", scale: 2, useCORS: true,
      width: w, height: h, windowWidth: w, windowHeight: h,
    });
    return canvas.toDataURL("image/jpeg", 0.95);
  } finally {
    root.unmount();
    host.remove();
  }
}

/** Official document order: certificate, translated copy (if any), transcript (if any). */
async function renderPages(doc: CertificateDocument): Promise<Page[]> {
  const qrDataUrl = await QRCode.toDataURL(doc.verifyUrl, {
    errorCorrectionLevel: "M", margin: 0, width: 300, color: { dark: "#0a0a0a", light: "#ffffff00" },
  });
  const pages: Page[] = [];
  pages.push({ orientation: "landscape", image: await renderNode(
    <MonochromeCertificate variant="01" {...doc.certificate} qrDataUrl={qrDataUrl} />, CERT_SIZE.w, CERT_SIZE.h) });
  if (doc.second) {
    pages.push({ orientation: "landscape", image: await renderNode(
      <MonochromeCertificate variant="01" {...doc.second} qrDataUrl={qrDataUrl} />, CERT_SIZE.w, CERT_SIZE.h) });
  }
  if (doc.transcript) {
    pages.push({ orientation: "portrait", image: await renderNode(
      <MonochromeTranscript {...doc.transcript} qrDataUrl={qrDataUrl} />, TRANSCRIPT_SIZE.w, TRANSCRIPT_SIZE.h) });
  }
  return pages;
}

export async function buildCertificatePdf(doc: CertificateDocument): Promise<jsPDF> {
  const pages = await renderPages(doc);
  const pdf = new jsPDF({ orientation: pages[0].orientation, unit: "mm", format: "a4" });
  pages.forEach((p, i) => {
    if (i > 0) pdf.addPage("a4", p.orientation);
    const [w, h] = p.orientation === "landscape" ? [297, 210] : [210, 297];
    pdf.addImage(p.image, "JPEG", 0, 0, w, h, undefined, "FAST");
  });
  pdf.setProperties({ title: `CERTIGO certificate ${doc.serial}`, subject: doc.verifyUrl, creator: "CERTIGO" });
  return pdf;
}

export async function downloadCertificatePdf(doc: CertificateDocument): Promise<void> {
  const pdf = await buildCertificatePdf(doc);
  pdf.save(`CERTIGO-${doc.serial}.pdf`);
}

/** Prints the exact same pages as the PDF through a hidden frame (no pop-up needed). */
export async function printCertificate(doc: CertificateDocument): Promise<void> {
  const pages = await renderPages(doc);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const d = frame.contentDocument!;
  d.open();
  d.write(`<!doctype html><html><head><title>CERTIGO ${doc.serial}</title><style>
    @page land { size: A4 landscape; margin: 0 }
    @page port { size: A4 portrait; margin: 0 }
    html, body { margin: 0; padding: 0; }
    img { display: block; break-after: page; }
    img:last-child { break-after: auto; }
    .landscape { page: land; width: 297mm; height: 210mm; }
    .portrait { page: port; width: 210mm; height: 297mm; }
  </style></head><body>${pages.map((p) => `<img class="${p.orientation}" src="${p.image}" alt="">`).join("")}</body></html>`);
  d.close();
  await Promise.all(Array.from(d.images).map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
  frame.contentWindow!.focus();
  frame.contentWindow!.print();
  setTimeout(() => frame.remove(), 60_000);
}
