import { useEffect, useRef, useState, type ReactNode } from "react";
import { Download, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MonochromeCertificate } from "@/components/certigo/MonochromeCertificate";
import { MonochromeTranscript } from "@/components/certigo/MonochromeTranscript";
import type { CertificateDocument, CertificateProps, TranscriptProps } from "@/lib/certificate-data";

const CERT = { w: 1123, h: 794 };
const TRANSCRIPT = { w: 794, h: 1123 };

/**
 * Lays the page out at its fixed A4 size and scales it to the container,
 * so the certificate looks the same on a phone, a desktop, in print and in the PDF.
 */
export function ScaledPage({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / w);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ height: scale ? h * scale : undefined, aspectRatio: scale ? undefined : `${w} / ${h}` }}>
      <div style={{ width: w, height: h, transform: `scale(${scale || 0.0001})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {children}
      </div>
    </div>
  );
}

export function CertificateSheet(props: CertificateProps) {
  return <ScaledPage w={CERT.w} h={CERT.h}><MonochromeCertificate variant="01" {...props} /></ScaledPage>;
}

export function TranscriptSheet(props: TranscriptProps) {
  return <ScaledPage w={TRANSCRIPT.w} h={TRANSCRIPT.h}><MonochromeTranscript {...props} /></ScaledPage>;
}

/** Official PDF and print. Shown only to the certificate owner (callers check ownership). */
export function OfficialDocumentButtons({ doc, className = "" }: { doc: CertificateDocument; className?: string }) {
  const [busy, setBusy] = useState<"pdf" | "print" | null>(null);
  async function run(kind: "pdf" | "print") {
    setBusy(kind);
    try {
      const m = await import("@/lib/certificate-document");
      await (kind === "pdf" ? m.downloadCertificatePdf(doc) : m.printCertificate(doc));
    } catch (e: any) {
      toast.error(e?.message ?? "Could not prepare the document");
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <Button onClick={() => void run("pdf")} disabled={!!busy} className={"min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700 " + className}>
        {busy === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Download official PDF
      </Button>
      <Button variant="outline" onClick={() => void run("print")} disabled={!!busy} className={"min-h-[44px] " + className}>
        {busy === "print" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />} Official print
      </Button>
    </>
  );
}
