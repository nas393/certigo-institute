import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatReference, isValidSerial } from "@/lib/cert";
import { buildLinkedInAddToProfileUrl, linkedInMetaFromCert } from "@/lib/linkedin";

interface Cert {
  serial: string;
  recipient_name: string;
  issued_at: string;
  certifications?: { title: string; issuer_name: string } | null;
}

/** Dev-only banner asserting QR target, reference format, and LinkedIn URL. */
export function CertChecksBanner({ cert }: { cert: Cert }) {
  if (!import.meta.env.DEV) return null;
  const [qrResolves, setQrResolves] = useState<boolean | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const verifyUrl = `${origin}/verify/${cert.serial}`;
  const reference = formatReference(cert.serial);
  const linkedInUrl = buildLinkedInAddToProfileUrl(
    linkedInMetaFromCert({
      certTitle: cert.certifications?.title ?? "CERTIGO. Certificate",
      issuerName: cert.certifications?.issuer_name ?? "CERTIGO.",
      issuedAt: cert.issued_at,
      serial: cert.serial,
      verifyUrl,
    }),
  );

  useEffect(() => {
    let live = true;
    supabase
      .from("certificates")
      .select("serial")
      .eq("serial", cert.serial)
      .maybeSingle()
      .then(({ data }) => { if (live) setQrResolves(data?.serial === cert.serial); });
    return () => { live = false; };
  }, [cert.serial]);

  let linkedInOk = false;
  try {
    const u = new URL(linkedInUrl);
    linkedInOk =
      u.host === "www.linkedin.com" &&
      u.searchParams.get("certId") === cert.serial &&
      u.searchParams.get("certUrl") === verifyUrl &&
      !!u.searchParams.get("name") &&
      !!u.searchParams.get("organizationName") &&
      !!u.searchParams.get("issueYear") &&
      !!u.searchParams.get("issueMonth");
  } catch { linkedInOk = false; }

  const checks = [
    { label: `Reference renders “${reference}”`, pass: isValidSerial(cert.serial) },
    { label: `QR target ${verifyUrl} resolves to record`, pass: qrResolves === true },
    { label: "LinkedIn URL has all 6 params + opens linkedin.com", pass: linkedInOk },
  ];
  const allPass = checks.every((c) => c.pass);
  return (
    <div className={"mx-auto mt-4 max-w-3xl rounded-md border px-4 py-3 font-mono text-[10px] uppercase tracking-widest " + (allPass ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700" : "border-destructive/40 bg-destructive/5 text-destructive")}>
      <div className="mb-1 font-bold">DEV · CERTIGO E2E checks {allPass ? "✓ pass" : "✗ fail"}</div>
      <ul className="space-y-0.5">
        {checks.map((c) => (
          <li key={c.label}>{c.pass ? "✓" : qrResolves === null && c.label.startsWith("QR") ? "…" : "✗"} {c.label}</li>
        ))}
      </ul>
    </div>
  );
}