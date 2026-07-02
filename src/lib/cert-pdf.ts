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
  /** Optional signature image (PNG data URL) — embedded when present. */
  signatureDataUrl?: string;
  /** Optional transcript modules — when present, a second A4 page is appended. */
  modules?: Array<{
    code: string;
    title: string;
    hours: number;
    grade: string;
    scorePct?: number;
  }>;
  totalHours?: number;
  programmeTitle?: string;
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

  // Background + corner crops (mirrors on-screen MonochromeCertificate Variant 01)
  doc.setDrawColor(20);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, W - 24, H - 24);
  drawCornerCrops(doc, 12, 12, W - 24, H - 24, 4);

  // Header
  drawWordmark(doc, 22, 25, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120);
  doc.text("INSTITUTE", 22 + doc.getTextWidth("CERTIGO.") + 2.5, 25);
  doc.setFontSize(8);
  doc.setTextColor(90);
  doc.text(`CERTIFICATE · NO. ${data.serial}`, W - 22, 25, { align: "right" });
  doc.setDrawColor(20);
  doc.setLineWidth(0.15);
  doc.line(22, 30, W - 22, 30);

  // Body — matches on-screen hierarchy
  doc.setTextColor(120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("THIS IS TO CERTIFY THAT", 22, 60);

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.text(data.recipientName, 22, 78);

  doc.setTextColor(120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("HAS SUCCESSFULLY COMPLETED", 22, 92);

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(data.certTitle, 22, 104);

  if (typeof data.scorePct === "number") {
    doc.setTextColor(90);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Final score · ${data.scorePct}%`, 22, 114);
  }

  // QR code (bottom-left)
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 256,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });
  doc.addImage(qrDataUrl, "PNG", 22, H - 55, 28, 28);
  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text("CREDENTIAL REF", 22, H - 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.text(formatReference(data.serial), 22, H - 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(90);
  doc.text(`Verify: ${data.verifyUrl}`, 22, H - 13);

  // Center signature
  const cx = W / 2;
  const sigY = H - 40;
  if (data.signatureDataUrl) {
    try { doc.addImage(data.signatureDataUrl, "PNG", cx - 32, sigY - 20, 64, 22); } catch { /* noop */ }
  }
  doc.setDrawColor(20);
  doc.setLineWidth(0.4);
  doc.line(cx - 40, sigY, cx + 40, sigY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90);
  doc.text("DIRECTOR OF ACADEMIC AFFAIRS", cx, sigY + 5, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text("CERTIGO. INSTITUTE", cx, sigY + 9.5, { align: "center" });

  // Bigger digital stamp — sits over the trailing "S" of AFFAIRS
  const roleWidth = doc.getTextWidth("DIRECTOR OF ACADEMIC AFFAIRS");
  const stampX = cx + roleWidth / 2 - 2;
  drawDigitalStamp(doc, stampX, sigY + 4, 12);

  // Date (right)
  const d = new Date(data.issuedAt);
  const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text("ISSUED", W - 22, H - 22, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.text(dateStr.toUpperCase(), W - 22, H - 17, { align: "right" });

  // Optional transcript page
  if (data.modules && data.modules.length > 0) {
    drawTranscriptPage(doc, data);
  }

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
  doc.setLineWidth(0.7);
  doc.circle(cx, cy, r, "S");
  doc.setLineWidth(0.3);
  doc.circle(cx, cy, r - 1.8, "S");
  doc.setTextColor(16, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(r * 0.9);
  doc.text("CERTIFIED", cx, cy + r * 0.05, { align: "center" });
  doc.setFontSize(r * 0.55);
  doc.text("CERTIGO.", cx, cy + r * 0.55, { align: "center" });
  doc.setFontSize(r * 0.9);
  doc.text("✓", cx, cy - r * 0.45, { align: "center" });
  doc.setTextColor(20);
  doc.restoreGraphicsState?.();
}

function drawWordmark(doc: jsPDF, x: number, y: number, size: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(20);
  doc.text("CERTIGO", x, y);
  doc.setTextColor(16, 185, 129);
  doc.text(".", x + doc.getTextWidth("CERTIGO"), y);
  doc.setTextColor(20);
}

function drawCornerCrops(doc: jsPDF, x: number, y: number, w: number, h: number, size: number) {
  doc.setDrawColor(20);
  doc.setLineWidth(0.5);
  // TL
  doc.line(x, y, x + size, y);
  doc.line(x, y, x, y + size);
  // TR
  doc.line(x + w - size, y, x + w, y);
  doc.line(x + w, y, x + w, y + size);
  // BL
  doc.line(x, y + h - size, x, y + h);
  doc.line(x, y + h, x + size, y + h);
  // BR
  doc.line(x + w - size, y + h, x + w, y + h);
  doc.line(x + w, y + h - size, x + w, y + h);
}

/** Second page — academic transcript of modules studied. */
function drawTranscriptPage(doc: jsPDF, data: CertPdfData) {
  doc.addPage("a4", "landscape");
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setDrawColor(20);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, W - 24, H - 24);
  drawCornerCrops(doc, 12, 12, W - 24, H - 24, 4);

  // Header
  drawWordmark(doc, 22, 25, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120);
  doc.text("INSTITUTE · REGISTRAR", 22 + doc.getTextWidth("CERTIGO.") + 2.5, 25);
  doc.setFontSize(8);
  doc.setTextColor(90);
  doc.text(`TRANSCRIPT · NO. ${data.serial}`, W - 22, 25, { align: "right" });
  doc.setLineWidth(0.15);
  doc.line(22, 30, W - 22, 30);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20);
  doc.text("Official Academic Transcript", 22, 46);

  // Recipient + programme
  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text("CONFERRED UPON", 22, 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20);
  doc.text(data.recipientName, 22, 66);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text("PROGRAMME OF STUDY", W - 22, 58, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text(data.programmeTitle ?? data.certTitle, W - 22, 66, { align: "right" });

  // Table
  const tableTop = 82;
  const rowH = 8;
  const cols = {
    code:  { x: 22,  w: 24,  label: "CODE",   align: "left"  as const },
    title: { x: 48,  w: 155, label: "MODULE · SUBJECT OF STUDY", align: "left" as const },
    hours: { x: 208, w: 20,  label: "HRS",    align: "right" as const },
    score: { x: 232, w: 28,  label: "SCORE",  align: "right" as const },
    grade: { x: 264, w: 20,  label: "GRADE",  align: "right" as const },
  };
  doc.setDrawColor(20);
  doc.setLineWidth(0.4);
  doc.line(22, tableTop, W - 22, tableTop);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(140);
  (Object.values(cols)).forEach((c) => {
    const tx = c.align === "right" ? c.x + c.w : c.x;
    doc.text(c.label, tx, tableTop - 2, { align: c.align });
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(20);
  let y = tableTop + rowH;
  let totalHours = 0;
  for (const m of data.modules!) {
    if (y > H - 40) break;
    doc.setTextColor(140);
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.text(m.code, cols.code.x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(20);
    doc.text(m.title, cols.title.x, y, { maxWidth: cols.title.w });
    doc.setFontSize(9);
    doc.text(String(m.hours), cols.hours.x + cols.hours.w, y, { align: "right" });
    doc.text(typeof m.scorePct === "number" ? `${m.scorePct}%` : "—", cols.score.x + cols.score.w, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(m.grade, cols.grade.x + cols.grade.w, y, { align: "right" });
    doc.setDrawColor(220);
    doc.setLineWidth(0.1);
    doc.line(22, y + 2.5, W - 22, y + 2.5);
    totalHours += m.hours || 0;
    y += rowH;
  }

  // Totals
  y += 2;
  doc.setDrawColor(20);
  doc.setLineWidth(0.4);
  doc.line(22, y, W - 22, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(90);
  doc.text("CUMULATIVE RESULT", 22, y);
  doc.setTextColor(20);
  doc.text(String(data.totalHours ?? totalHours), cols.hours.x + cols.hours.w, y, { align: "right" });
  doc.text(typeof data.scorePct === "number" ? `${data.scorePct}%` : "—", cols.score.x + cols.score.w, y, { align: "right" });
  const finalGrade =
    typeof data.scorePct === "number"
      ? data.scorePct >= 90 ? "A" : data.scorePct >= 80 ? "B" : data.scorePct >= 70 ? "C" : "Pass"
      : "Pass";
  doc.setFontSize(11);
  doc.text(finalGrade, cols.grade.x + cols.grade.w, y, { align: "right" });

  // Footer — ref + verify
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text("CREDENTIAL REF", 22, H - 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.text(formatReference(data.serial), 22, H - 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(90);
  doc.text(`Verify: ${data.verifyUrl}`, 22, H - 13);

  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text("ISSUED", W - 22, H - 22, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20);
  const dateStr = new Date(data.issuedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(dateStr.toUpperCase(), W - 22, H - 17, { align: "right" });
}