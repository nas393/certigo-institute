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
  /** Real-world professional skills — printed as a chip strip on the certificate. */
  skills?: string[];
  /** Optional transcript modules — when present, a second A4 page is appended. */
  modules?: Array<{
    code: string;
    title: string;
    hours: number;
    grade: string;
    scorePct?: number;
    subject?: string;
    learned?: string;
    /** Job-relevant skills this specific lesson maps to. */
    skills?: string[];
  }>;
  totalHours?: number;
  programmeTitle?: string;
  /** Second-copy language. When set (and not "en"), a translated certificate page is appended. */
  language?: CertLang;
  /** Translated course title for the second-copy page. */
  translatedTitle?: string;
}

export type CertLang = "en" | "fr" | "es" | "pt" | "ar";

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
  doc.setLineWidth(0.6); // ~100% thicker outer border
  doc.rect(12, 12, W - 24, H - 24);
  drawCornerCrops(doc, 12, 12, W - 24, H - 24, 4);

  // Header — left wordmark, right bold CERTIGO. + tiny serial
  drawWordmark(doc, 22, 25, 12);
  drawWordmark(doc, W - 22, 25, 11, "right");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(`NO. ${data.serial}`, W - 22, 30, { align: "right" });
  doc.setDrawColor(20);
  doc.setLineWidth(0.15);
  doc.line(22, 34, W - 22, 34);

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

  // Skills strip — real-world professional skills
  if (data.skills && data.skills.length > 0) {
    const stripY = 124;
    doc.setDrawColor(200);
    doc.setLineWidth(0.15);
    doc.line(22, stripY, W - 22, stripY);
    doc.line(22, stripY + 14, W - 22, stripY + 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(140);
    doc.text("SKILLS APPLIED IN THE REAL PROFESSIONAL WORLD", 22, stripY + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30);
    let cx = 22;
    const chipY = stripY + 10.2;
    for (const s of data.skills.slice(0, 8)) {
      const label = s.toUpperCase();
      const w = doc.getTextWidth(label) + 5;
      if (cx + w > W - 22) break;
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(210);
      doc.setLineWidth(0.1);
      doc.roundedRect(cx, chipY - 3.4, w, 4.6, 0.6, 0.6, "FD");
      doc.text(label, cx + 2.5, chipY);
      cx += w + 2.5;
    }
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

  // Second copy in the chosen language — the English page above stays the official record.
  if (data.language && data.language !== "en") {
    await drawTranslatedCertificatePage(doc, data, qrDataUrl);
  }

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

function drawWordmark(
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
  align: "left" | "right" = "left",
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  const wordW = doc.getTextWidth("CERTIGO");
  const dotW = doc.getTextWidth(".");
  const startX = align === "right" ? x - (wordW + dotW) : x;
  doc.setTextColor(20);
  doc.text("CERTIGO", startX, y);
  doc.setTextColor(16, 185, 129);
  doc.text(".", startX + wordW, y);
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
  doc.setLineWidth(0.6);
  doc.rect(12, 12, W - 24, H - 24);
  drawCornerCrops(doc, 12, 12, W - 24, H - 24, 4);

  // Header — bold wordmark both sides, serial small under right
  drawWordmark(doc, 22, 25, 12);
  drawWordmark(doc, W - 22, 25, 11, "right");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(`TRANSCRIPT · NO. ${data.serial}`, W - 22, 30, { align: "right" });
  doc.setLineWidth(0.15);
  doc.line(22, 34, W - 22, 34);

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
    if (y > H - 42) break;
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
    let subY = y;
    if (m.subject) {
      subY += 3.6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(120);
      doc.text(`SUBJECT · ${m.subject.toUpperCase()}`, cols.title.x, subY, { maxWidth: cols.title.w });
    }
    if (m.learned) {
      subY += 3.6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(90);
      const wrapped = doc.splitTextToSize(m.learned, cols.title.w);
      doc.text(wrapped, cols.title.x, subY);
      subY += (wrapped.length - 1) * 3.2;
    }
    if (m.skills && m.skills.length > 0) {
      subY += 3.4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(120);
      const line = `SKILLS APPLIED · ${m.skills.slice(0, 4).join(" · ").toUpperCase()}`;
      const wrappedSkills = doc.splitTextToSize(line, cols.title.w);
      doc.text(wrappedSkills, cols.title.x, subY);
      subY += (wrappedSkills.length - 1) * 3;
    }
    doc.setDrawColor(220);
    doc.setLineWidth(0.1);
    doc.line(22, subY + 2.5, W - 22, subY + 2.5);
    totalHours += m.hours || 0;
    y = subY + rowH;
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
/* ------------------------------------------------------------------ *
 * Second copy of the certificate in the learner's chosen language.
 * Rendered on a canvas so accents and Arabic script (shaping + RTL)
 * come out exactly as the browser draws them, then placed as a full
 * page. Falls back silently when no canvas is available (e.g. tests).
 * ------------------------------------------------------------------ */

const CERT_LABELS: Record<Exclude<CertLang, "en">, Record<string, string>> = {
  fr: {
    certify: "NOUS CERTIFIONS QUE",
    completed: "A SUIVI AVEC SUCCÈS",
    score: "Note finale",
    ref: "RÉFÉRENCE DU CERTIFICAT",
    verify: "Vérifier",
    issued: "DÉLIVRÉ LE",
    role: "DIRECTEUR DES AFFAIRES ACADÉMIQUES",
    note: "Copie traduite — la version anglaise constitue le document officiel.",
    lang: "VERSION FRANÇAISE",
  },
  es: {
    certify: "SE CERTIFICA QUE",
    completed: "HA COMPLETADO CON ÉXITO",
    score: "Nota final",
    ref: "REFERENCIA DE LA CREDENCIAL",
    verify: "Verificar",
    issued: "EMITIDO EL",
    role: "DIRECTOR DE ASUNTOS ACADÉMICOS",
    note: "Copia traducida: la versión en inglés es el documento oficial.",
    lang: "VERSIÓN EN ESPAÑOL",
  },
  pt: {
    certify: "CERTIFICA-SE QUE",
    completed: "CONCLUIU COM ÊXITO",
    score: "Nota final",
    ref: "REFERÊNCIA DA CREDENCIAL",
    verify: "Verificar",
    issued: "EMITIDO EM",
    role: "DIRETOR DE ASSUNTOS ACADÉMICOS",
    note: "Cópia traduzida — a versão em inglês é o documento oficial.",
    lang: "VERSÃO EM PORTUGUÊS",
  },
  ar: {
    certify: "نشهد بأن",
    completed: "قد أتمّ بنجاح",
    score: "النتيجة النهائية",
    ref: "المرجع الرسمي للشهادة",
    verify: "التحقق",
    issued: "تاريخ الإصدار",
    role: "مدير الشؤون الأكاديمية",
    note: "نسخة مترجمة — النسخة الإنجليزية هي الوثيقة الرسمية.",
    lang: "النسخة العربية",
  },
};

const CERT_LOCALES: Record<Exclude<CertLang, "en">, string> = {
  fr: "fr-FR",
  es: "es-ES",
  pt: "pt-PT",
  ar: "ar",
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function drawTranslatedCertificatePage(doc: jsPDF, data: CertPdfData, qrDataUrl: string) {
  const lang = data.language as Exclude<CertLang, "en">;
  const L = CERT_LABELS[lang];
  if (!L || typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  const scale = 6; // 297mm x 210mm at ~150dpi
  const CW = 297 * scale;
  const CH = 210 * scale;
  canvas.width = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rtl = lang === "ar";
  const body = rtl
    ? '"Noto Sans Arabic", "Segoe UI", sans-serif'
    : 'Inter, Helvetica, Arial, sans-serif';
  const mm = (v: number) => v * scale;
  // Text anchor helpers: the layout mirrors for right-to-left languages.
  const startX = rtl ? CW - mm(22) : mm(22);
  const endX = rtl ? mm(22) : CW - mm(22);
  const align: CanvasTextAlign = rtl ? "right" : "left";
  const alignEnd: CanvasTextAlign = rtl ? "left" : "right";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CW, CH);

  // Frame + corner crops
  ctx.strokeStyle = "#141414";
  ctx.lineWidth = mm(0.6);
  ctx.strokeRect(mm(12), mm(12), CW - mm(24), CH - mm(24));
  const c = mm(4);
  ctx.lineWidth = mm(0.5);
  const corners: Array<[number, number, number, number]> = [
    [mm(12), mm(12), mm(12) + c, mm(12)], [mm(12), mm(12), mm(12), mm(12) + c],
    [CW - mm(12) - c, mm(12), CW - mm(12), mm(12)], [CW - mm(12), mm(12), CW - mm(12), mm(12) + c],
    [mm(12), CH - mm(12) - c, mm(12), CH - mm(12)], [mm(12), CH - mm(12), mm(12) + c, CH - mm(12)],
    [CW - mm(12) - c, CH - mm(12), CW - mm(12), CH - mm(12)], [CW - mm(12), CH - mm(12) - c, CW - mm(12), CH - mm(12)],
  ];
  ctx.beginPath();
  corners.forEach(([x1, y1, x2, y2]) => { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); });
  ctx.stroke();

  // Wordmark (both top corners) — always Latin
  const wordmark = (x: number, y: number, size: number, anchor: CanvasTextAlign) => {
    ctx.textAlign = "left";
    ctx.font = `800 ${mm(size)}px Inter, Helvetica, Arial, sans-serif`;
    const w = ctx.measureText("CERTIGO").width;
    const dot = ctx.measureText(".").width;
    const sx = anchor === "right" ? x - (w + dot) : x;
    ctx.fillStyle = "#141414";
    ctx.fillText("CERTIGO", sx, y);
    ctx.fillStyle = "#10B981";
    ctx.fillText(".", sx + w, y);
    ctx.fillStyle = "#141414";
  };
  wordmark(mm(22), mm(25), 12, "left");
  wordmark(CW - mm(22), mm(25), 11, "right");

  ctx.textAlign = alignEnd;
  ctx.font = `500 ${mm(3)}px ${body}`;
  ctx.fillStyle = "#787878";
  ctx.fillText(`${L.lang} · NO. ${data.serial}`, endX, mm(30));

  ctx.strokeStyle = "#141414";
  ctx.lineWidth = mm(0.15);
  ctx.beginPath();
  ctx.moveTo(mm(22), mm(34));
  ctx.lineTo(CW - mm(22), mm(34));
  ctx.stroke();

  // Body
  ctx.textAlign = align;
  ctx.fillStyle = "#787878";
  ctx.font = `600 ${mm(3.4)}px ${body}`;
  ctx.fillText(L.certify, startX, mm(60));

  ctx.fillStyle = "#141414";
  ctx.font = `800 ${mm(15)}px ${body}`;
  ctx.fillText(data.recipientName, startX, mm(78));

  ctx.fillStyle = "#787878";
  ctx.font = `600 ${mm(3.4)}px ${body}`;
  ctx.fillText(L.completed, startX, mm(92));

  ctx.fillStyle = "#141414";
  ctx.font = `700 ${mm(9)}px ${body}`;
  const title = data.translatedTitle || data.certTitle;
  const maxTitleW = CW - mm(44);
  let titleSize = 9;
  while (titleSize > 5) {
    ctx.font = `700 ${mm(titleSize)}px ${body}`;
    if (ctx.measureText(title).width <= maxTitleW) break;
    titleSize -= 0.4;
  }
  ctx.fillText(title, startX, mm(105));

  if (typeof data.scorePct === "number") {
    ctx.fillStyle = "#5a5a5a";
    ctx.font = `500 ${mm(3.8)}px ${body}`;
    ctx.fillText(`${L.score} · ${data.scorePct}%`, startX, mm(116));
  }

  // QR + reference
  const qr = await loadImage(qrDataUrl);
  if (qr) {
    const qx = rtl ? CW - mm(22) - mm(28) : mm(22);
    ctx.drawImage(qr, qx, CH - mm(55), mm(28), mm(28));
  }
  ctx.textAlign = align;
  ctx.fillStyle = "#8c8c8c";
  ctx.font = `500 ${mm(3)}px ${body}`;
  ctx.fillText(L.ref, startX, CH - mm(22));
  ctx.fillStyle = "#141414";
  ctx.font = `700 ${mm(4)}px Inter, Helvetica, Arial, sans-serif`;
  ctx.fillText(formatReference(data.serial), startX, CH - mm(17));
  ctx.fillStyle = "#5a5a5a";
  ctx.font = `400 ${mm(2.8)}px Inter, Helvetica, Arial, sans-serif`;
  ctx.fillText(`${L.verify}: ${data.verifyUrl}`, startX, CH - mm(13));

  // Signature block (centred)
  const cx = CW / 2;
  const sigY = CH - mm(40);
  if (data.signatureDataUrl) {
    const sig = await loadImage(data.signatureDataUrl);
    if (sig) ctx.drawImage(sig, cx - mm(32), sigY - mm(20), mm(64), mm(22));
  }
  ctx.strokeStyle = "#141414";
  ctx.lineWidth = mm(0.4);
  ctx.beginPath();
  ctx.moveTo(cx - mm(40), sigY);
  ctx.lineTo(cx + mm(40), sigY);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = "#5a5a5a";
  ctx.font = `600 ${mm(3.4)}px ${body}`;
  ctx.fillText(L.role, cx, sigY + mm(6));
  ctx.fillStyle = "#8c8c8c";
  ctx.font = `500 ${mm(3)}px Inter, Helvetica, Arial, sans-serif`;
  ctx.fillText("CERTIGO. INSTITUTE", cx, sigY + mm(10.5));

  // Emerald digital stamp, mirroring the English page
  const roleW = ctx.measureText(L.role).width;
  const stampX = cx + roleW / 2 + mm(4);
  const r = mm(12);
  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = mm(0.7);
  ctx.beginPath(); ctx.arc(stampX, sigY + mm(4), r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = mm(0.3);
  ctx.beginPath(); ctx.arc(stampX, sigY + mm(4), r - mm(1.8), 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#10B981";
  ctx.textAlign = "center";
  ctx.font = `700 ${mm(4)}px Inter, Helvetica, Arial, sans-serif`;
  ctx.fillText("CERTIFIED", stampX, sigY + mm(5));
  ctx.font = `700 ${mm(2.6)}px Inter, Helvetica, Arial, sans-serif`;
  ctx.fillText("CERTIGO.", stampX, sigY + mm(8.5));
  ctx.font = `700 ${mm(4)}px Inter, Helvetica, Arial, sans-serif`;
  ctx.fillText("✓", stampX, sigY - mm(0.5));

  // Issue date + translated-copy note
  ctx.textAlign = alignEnd;
  ctx.fillStyle = "#8c8c8c";
  ctx.font = `500 ${mm(3)}px ${body}`;
  ctx.fillText(L.issued, endX, CH - mm(22));
  ctx.fillStyle = "#141414";
  ctx.font = `700 ${mm(4)}px ${body}`;
  const dateStr = new Date(data.issuedAt).toLocaleDateString(CERT_LOCALES[lang], {
    day: "2-digit", month: "long", year: "numeric",
  });
  ctx.fillText(dateStr, endX, CH - mm(17));
  ctx.fillStyle = "#8c8c8c";
  ctx.font = `400 ${mm(2.8)}px ${body}`;
  ctx.fillText(L.note, endX, CH - mm(13));

  doc.addPage("a4", "landscape");
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, W, H);
}
