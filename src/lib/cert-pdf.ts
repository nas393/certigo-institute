import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { formatReference } from "./cert";

export interface CertPdfData {
  serial: string;
  recipientName: string;
  certTitle: string;
  issuerName?: string;
  issuedAt: string;
  scorePct?: number;
  verifyUrl: string;
}

export interface BuiltCertPdf {
  bytes: Uint8Array;
  filename: string;
  doc: jsPDF;
}

/**
 * Build an A4 landscape certificate PDF with embedded QR + serial.
 * Deterministic for the same input.
 */
export async function buildCertificatePdf(data: CertPdfData): Promise<BuiltCertPdf> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 297
  const H = doc.internal.pageSize.getHeight();  // 210

  // Background frame
  doc.setDrawColor(20);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, W - 20, H - 20);
  doc.setLineWidth(0.2);
  doc.rect(13, 13, W - 26, H - 26);

  // Wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text("CERTIGO", 20, 22);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(".", 20 + doc.getTextWidth("CERTIGO"), 22);
  doc.setTextColor(20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("INSTITUTE · CERTIFICATE OF COMPLETION", 20, 27);

  // Issuer right
  const issuer = (data.issuerName ?? "CERTIGO.").toUpperCase();
  doc.setFontSize(8);
  doc.text(`No. ${data.serial}`, W - 20, 22, { align: "right" });
  doc.text(issuer, W - 20, 27, { align: "right" });

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("THIS IS TO CERTIFY THAT", W / 2, 70, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text(data.recipientName, W / 2, 88, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("HAS SUCCESSFULLY COMPLETED", W / 2, 104, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(data.certTitle, W / 2, 118, { align: "center" });

  // Score
  if (typeof data.scorePct === "number") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Score: ${data.scorePct}%`, W / 2, 128, { align: "center" });
  }

  // QR code (bottom-left)
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 256,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });
  doc.addImage(qrDataUrl, "PNG", 20, H - 50, 30, 30);

  // Reference + verify URL
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(formatReference(data.serial), 55, H - 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Verify: ${data.verifyUrl}`, 55, H - 33);

  // Date + signature line (right)
  const d = new Date(data.issuedAt);
  const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  doc.setLineWidth(0.4);
  doc.line(W - 90, H - 38, W - 20, H - 38);
  doc.setFontSize(8);
  doc.text("DIRECTOR OF ACADEMIC AFFAIRS", W - 55, H - 33, { align: "center" });
  doc.text(`ISSUED ${dateStr.toUpperCase()}`, W - 55, H - 28, { align: "center" });

  // Digital stamp — emerald circular seal covering the "S" of AFFAIRS
  drawDigitalStamp(doc, W - 27, H - 34, 7);

  const bytes = doc.output("arraybuffer");
  return {
    bytes: new Uint8Array(bytes),
    filename: `cert-${data.serial}.pdf`,
    doc,
  };
}

export async function downloadCertificatePdf(data: CertPdfData) {
  const built = await buildCertificatePdf(data);
  built.doc.save(built.filename);
  return built;
}

/** Round emerald "CERTIGO · CERTIFIED" digital stamp drawn with vector primitives. */
function drawDigitalStamp(doc: jsPDF, cx: number, cy: number, r: number) {
  doc.saveGraphicsState?.();
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.6);
  doc.circle(cx, cy, r, "S");
  doc.setLineWidth(0.25);
  doc.circle(cx, cy, r - 1.3, "S");
  doc.setTextColor(16, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("CERTIFIED", cx, cy + 0.4, { align: "center" });
  doc.setFontSize(4);
  doc.text("CERTIGO.", cx, cy + 3.2, { align: "center" });
  doc.text("✓", cx, cy - 2.2, { align: "center" });
  doc.setTextColor(20);
  doc.restoreGraphicsState?.();
}