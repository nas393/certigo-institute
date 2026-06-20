import { describe, it, expect } from "vitest";
import { buildCertificatePdf } from "@/lib/cert-pdf";

const FIXTURE = {
  serial: "CERT-PMFN-0042",
  recipientName: "Alex Johnson",
  certTitle: "Product Management Foundations",
  issuerName: "CERTIGO.",
  issuedAt: "2026-06-20T10:00:00Z",
  scorePct: 92,
  verifyUrl: "https://certigo.app/verify/CERT-PMFN-0042",
};

function pdfBytesToString(bytes: Uint8Array) {
  return new TextDecoder("latin1").decode(bytes);
}

describe("buildCertificatePdf", () => {
  it("returns A4 landscape bytes starting with %PDF and named cert-{serial}.pdf", async () => {
    const built = await buildCertificatePdf(FIXTURE);
    expect(built.filename).toBe("cert-CERT-PMFN-0042.pdf");
    expect(built.bytes.byteLength).toBeGreaterThan(2000);
    expect(pdfBytesToString(built.bytes.slice(0, 8))).toMatch(/^%PDF-/);

    // Landscape A4: width > height; jsPDF mm
    expect(built.doc.internal.pageSize.getWidth()).toBeCloseTo(297, 0);
    expect(built.doc.internal.pageSize.getHeight()).toBeCloseTo(210, 0);
  });

  it("embeds the serial and verify URL in the PDF content", async () => {
    const built = await buildCertificatePdf(FIXTURE);
    const txt = pdfBytesToString(built.bytes);
    expect(txt).toContain("CERT-PMFN-0042");
    expect(txt).toContain("certigo.app/verify/CERT-PMFN-0042");
  });

  it("is deterministic in serial/filename for the same input (re-issue uses same record)", async () => {
    const a = await buildCertificatePdf(FIXTURE);
    const b = await buildCertificatePdf(FIXTURE);
    expect(a.filename).toBe(b.filename);
    // QR + page metadata may differ in trailing bytes, but the serial must match
    expect(pdfBytesToString(a.bytes)).toContain(FIXTURE.serial);
    expect(pdfBytesToString(b.bytes)).toContain(FIXTURE.serial);
  });
});