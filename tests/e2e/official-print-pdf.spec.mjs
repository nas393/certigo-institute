#!/usr/bin/env node
/**
 * Playwright E2E: Official Print → Download PDF
 *
 * Verifies:
 *  - A4 landscape (~841×595 pt)
 *  - Serial CERT-XXXX-NNNN appears in PDF text
 *  - QR target points to /verify/<serial>
 *  - Re-download after refresh reuses the same stored record
 */
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const OUT = "/tmp/browser/certigo-pdf";
const PORT = process.env.PORT ?? "8080";
const BASE = `http://localhost:${PORT}`;

function findConfiguredSerial() {
  const serial = process.env.E2E_CERTIFICATE_SERIAL?.trim();
  if (!serial || !/^[A-Za-z0-9-]+$/.test(serial)) {
    throw new Error("Set E2E_CERTIFICATE_SERIAL to a valid staging certificate serial.");
  }
  return serial;
}

function assert(cond, msg) {
  if (!cond) { console.error("FAIL:", msg); process.exit(1); }
  console.log("PASS:", msg);
}

async function pdfTextLatin1(file) {
  const buf = await readFile(file);
  return { buf, txt: Buffer.from(buf).toString("latin1") };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const serial = findConfiguredSerial();
  console.log("Testing serial:", serial);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 }, acceptDownloads: true });
  const page = await ctx.newPage();

  const key = process.env.E2E_SUPABASE_STORAGE_KEY;
  const sess = process.env.E2E_SUPABASE_SESSION_JSON;
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  if (key && sess) await page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [key, sess]);

  await page.goto(`${BASE}/issued/${serial}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT, "1-issued.png") });

  const officialBtn = page.getByRole("button", { name: /official|print/i });
  if (await officialBtn.count()) await officialBtn.first().click();

  const [dl1] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /download.*pdf/i }).first().click(),
  ]);
  const f1 = path.join(OUT, "first.pdf");
  await dl1.saveAs(f1);

  const { txt: t1 } = await pdfTextLatin1(f1);
  assert(t1.startsWith("%PDF-"), "valid PDF");
  assert(t1.includes(serial), `serial ${serial} in PDF`);
  assert(t1.includes(`/verify/${serial}`), `QR target /verify/${serial} in PDF`);
  const m = t1.match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  assert(!!m, "PDF has a MediaBox");
  const [w, h] = [Number(m[1]), Number(m[2])];
  assert(w > h && Math.abs(w - 841.89) < 2 && Math.abs(h - 595.28) < 2, `A4 landscape ${w}×${h}`);

  await page.reload({ waitUntil: "networkidle" });
  if (await officialBtn.count()) await officialBtn.first().click();
  const [dl2] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /download.*pdf/i }).first().click(),
  ]);
  const f2 = path.join(OUT, "second.pdf");
  await dl2.saveAs(f2);
  const { txt: t2 } = await pdfTextLatin1(f2);
  assert(t2.includes(serial), `re-download still uses ${serial}`);
  assert(dl1.suggestedFilename() === dl2.suggestedFilename(), "regenerated filename matches (same record)");

  await browser.close();
  console.log("\nALL CHECKS PASSED ✅  ", OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });