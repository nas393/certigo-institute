import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export interface CertData {
  serial: string;
  recipientName: string;
  courseTopic: string;
  score?: number | null;
  issuedAt: string;
  verifyUrl: string;
  watermark?: boolean;
}

export async function downloadCertificatePdf(c: CertData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // background
  doc.setFillColor(252, 251, 248);
  doc.rect(0, 0, w, h, "F");

  // outer thin border
  doc.setDrawColor(20, 20, 30);
  doc.setLineWidth(1);
  doc.rect(28, 28, w - 56, h - 56);
  doc.setLineWidth(0.4);
  doc.rect(38, 38, w - 76, h - 76);

  // wordmark
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 30);
  doc.setFontSize(20);
  doc.text("KREDO.", 60, 70);

  // serial
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 90);
  doc.text(c.serial, w - 60, 70, { align: "right" });

  // eyebrow
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 120);
  doc.text("◆  CERTIFICATE OF COMPLETION", w / 2, 150, { align: "center" });

  // recipient name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(54);
  doc.setTextColor(20, 20, 30);
  doc.text(c.recipientName, w / 2, 230, { align: "center" });

  // line
  doc.setDrawColor(20, 20, 30);
  doc.setLineWidth(0.5);
  doc.line(w / 2 - 60, 250, w / 2 + 60, 250);

  // course
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 70);
  const text = `For successfully completing  "${c.courseTopic}"`;
  doc.text(text, w / 2, 290, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(90, 90, 100);
  const meta = `${c.score != null ? `Score ${c.score}%   ·   ` : ""}Issued ${new Date(c.issuedAt).toLocaleDateString()}`;
  doc.text(meta, w / 2, 312, { align: "center" });

  // QR
  const qrDataUrl = await QRCode.toDataURL(c.verifyUrl, { margin: 0, width: 240 });
  const qrSize = 110;
  doc.addImage(qrDataUrl, "PNG", w - 60 - qrSize, h - 60 - qrSize, qrSize, qrSize);
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 90);
  doc.text("SCAN TO VERIFY", w - 60 - qrSize / 2, h - 50 - qrSize - 6, { align: "center" });

  // signature
  doc.setDrawColor(20, 20, 30);
  doc.setLineWidth(0.4);
  doc.line(60, h - 90, 240, h - 90);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 30);
  doc.text("Kredo Director", 60, h - 78);
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 120);
  doc.text("Verified by Kredo  ·  kredo.app/verify", 60, h - 64);

  if (c.watermark) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(80);
    doc.setTextColor(230, 230, 235);
    doc.text("KREDO FREE", w / 2, h / 2 + 20, { align: "center", angle: -20 });
  }

  doc.save(`kredo-${c.serial}.pdf`);
}
