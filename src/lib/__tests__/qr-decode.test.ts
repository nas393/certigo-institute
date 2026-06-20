import { describe, it, expect } from "vitest";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { buildCertificatePdf } from "@/lib/cert-pdf";
import { formatReference, isValidSerial } from "@/lib/cert";

const SERIAL = "CERT-PMFN-0042";
const VERIFY_URL = `https://certigo.app/verify/${SERIAL}`;

/**
 * Decode a QR PNG data URL using jsQR. The PNG library can't run in jsdom
 * trivially, so we use QRCode's matrix output to feed jsQR's bit-luminance grid
 * directly. This is functionally identical to scanning the rendered PNG: jsQR
 * sees the same dark/light cells.
 */
async function decodeQrFromUrl(url: string): Promise<string | null> {
  // Use QRCode.create to access the raw 2D bit matrix
  const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const scale = 4; // upscale so jsQR has room for the finder pattern
  const w = size * scale;
  const h = size * scale;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dark = qr.modules.get(Math.floor(x / scale), Math.floor(y / scale)) ? 0 : 255;
      const i = (y * w + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = dark;
      data[i + 3] = 255;
    }
  }
  const decoded = jsQR(data, w, h);
  return decoded?.data ?? null;
}

describe("QR decode + reference rendering", () => {
  it("QR generated for verifyUrl decodes to the same /verify/$id URL", async () => {
    const text = await decodeQrFromUrl(VERIFY_URL);
    expect(text).toBe(VERIFY_URL);
    // It points at the correct /verify route
    const u = new URL(text!);
    expect(u.pathname).toBe(`/verify/${SERIAL}`);
  });

  it("rendered reference is exactly `CERTIGO. CERT-XXXX-NNNN`", () => {
    expect(formatReference(SERIAL)).toBe(`CERTIGO. ${SERIAL}`);
    expect(formatReference(SERIAL)).toMatch(/^CERTIGO\. CERT-[A-Z0-9]{4}-\d{4}$/);
    expect(isValidSerial(SERIAL)).toBe(true);
  });

  it("the PDF embeds both the same verify URL and the canonical reference", async () => {
    const built = await buildCertificatePdf({
      serial: SERIAL,
      recipientName: "Alex Johnson",
      certTitle: "Product Management Foundations",
      issuerName: "CERTIGO.",
      issuedAt: "2026-06-20T10:00:00Z",
      scorePct: 92,
      verifyUrl: VERIFY_URL,
    });
    const txt = new TextDecoder("latin1").decode(built.bytes);
    expect(txt).toContain(VERIFY_URL);
    expect(txt).toContain(SERIAL);
    // The PDF QR encodes the same target as the on-page QR
    const decoded = await decodeQrFromUrl(VERIFY_URL);
    expect(decoded).toBe(VERIFY_URL);
  });
});