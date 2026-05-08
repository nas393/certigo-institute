import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import logoUrl from "@/assets/kredo-logo.png";
import signatureUrl from "@/assets/kredo-signature.png";
import stampUrl from "@/assets/kredo-stamp.png";

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
  const toDataUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.readAsDataURL(blob);
    });
  };
  const [logoData, sigData, stampData] = await Promise.all([
    toDataUrl(logoUrl),
    toDataUrl(signatureUrl),
    toDataUrl(stampUrl),
  ]);

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

  // logo
  const logoH = 36;
  const logoW = 100;
  doc.addImage(logoData, "PNG", 60, 50, logoW, logoH);

  // serial
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 90);
  doc.text(c.serial, w - 60, 70, { align: "right" });

  // eyebrow (avoid Unicode glyph + letter-spaced rendering bugs)
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 120);
  doc.text("CERTIFICATE OF COMPLETION", w / 2, 150, { align: "center" });

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

  // signature image
  doc.addImage(sigData, "PNG", 60, h - 150, 160, 60);
  doc.setDrawColor(20, 20, 30);
  doc.setLineWidth(0.4);
  doc.line(60, h - 90, 240, h - 90);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 30);
  doc.text("Certigo Director", 60, h - 78);
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 120);
  doc.text("Verified by Certigo  ·  certigo.app/verify", 60, h - 64);

  // stamp (between signature and QR)
  const stampSize = 90;
  doc.addImage(stampData, "PNG", w / 2 - stampSize / 2, h - 50 - stampSize, stampSize, stampSize);

  if (c.watermark) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(80);
    doc.setTextColor(230, 230, 235);
    doc.text("CERTIGO FREE", w / 2, h / 2 + 20, { align: "center", angle: -20 });
  }

  doc.save(`certigo-${c.serial}.pdf`);
}
