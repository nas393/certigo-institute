import { formatSerial } from "@/lib/cert";
import { MonochromeCertificate, type MonoVariant } from "@/components/certigo/MonochromeCertificate";

/**
 * Single source of truth for the rendered certificate. There is exactly ONE
 * locked template (Helvetica Grid / mono-01). Legacy template keys are kept
 * only to avoid breaking older callers — they all collapse to mono-01 so
 * the app, verify modal, PDF export, and home demo are pixel-identical.
 */
export type CertTemplate =
  | "classic" | "double" | "ornate" | "minimal" | "deco"
  | "bordered" | "navy" | "emerald" | "stripe" | "embossed" | "signature"
  | "executive" | "technical" | "dark-glass"
  | "mono-01" | "mono-02" | "mono-03";
export type CertOrientation = "landscape" | "portrait";
export type SignatureVariant = 0 | 1 | 2 | 3 | 4;

export const SIGNATURE_VARIANTS: { key: SignatureVariant; label: string }[] = [
  { key: 0, label: "Standard" },
];

export const CERT_TEMPLATES: { key: CertTemplate; label: string; hint: string }[] = [
  { key: "mono-01", label: "Helvetica Grid", hint: "Locked global standard — Swiss precision, all-caps mono, hairline rules" },
];

interface Props {
  serial: string;
  recipientName: string;
  courseTopic: string;
  score?: number | null;
  issuedAt: string;
  verifyUrl: string;
  watermark?: boolean;
  compact?: boolean;
  template?: CertTemplate;
  orientation?: CertOrientation;
  signatureVariant?: SignatureVariant;
}

// Locked: every certificate renders Variant 01 (Helvetica Grid).
function resolveVariant(_t?: CertTemplate): MonoVariant {
  return "01";
}

export function CertificateView(p: Props) {
  const displaySerial = formatSerial(p.serial);
  return (
    <div className={p.compact ? "" : "shadow-2xl"}>
      <MonochromeCertificate
        variant={resolveVariant(p.template)}
        recipientName={p.recipientName}
        courseTitle={p.courseTopic}
        issueDate={p.issuedAt}
        certificateId={displaySerial}
        verifyUrl={p.verifyUrl}
        scorePct={p.score ?? undefined}
      />
      {p.watermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            style={{
              transform: "rotate(-22deg)",
              fontFamily: "'Archivo Black', sans-serif",
              fontWeight: 900,
              color: "rgba(10,10,10,0.04)",
              fontSize: "11cqw",
              letterSpacing: "-0.03em",
            }}
          >
            CERTIGO. FREE
          </div>
        </div>
      )}
    </div>
  );
}
