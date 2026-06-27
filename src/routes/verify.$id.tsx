import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/kredo/Header";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, ShieldX, Loader2, ArrowRight } from "lucide-react";
import { formatReference } from "@/lib/cert";
import { DigitalBadge } from "@/components/cert/DigitalBadge";

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Verify ${params.id} — CERTIGO.` },
      { name: "description", content: "Public verification page for a CERTIGO. credential." },
    ],
  }),
  component: VerifyOne,
});

function VerifyOne() {
  const { id } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok" | "miss" | "revoked">("loading");
  const [cert, setCert] = useState<any>(null);

  useEffect(() => {
    supabase.rpc("verify_certificate", { lookup: id })
      .then(({ data }: { data: any }) => {
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) { setState("miss"); return; }
        const shaped = {
          ...row,
          certifications: { title: row.cert_title, issuer_name: row.issuer_name },
        };
        if (row.revoked) { setCert(shaped); setState("revoked"); }
        else { setCert(shaped); setState("ok"); }
      });
  }, [id]);

  if (state === "loading") return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        {state === "ok" && cert && (
          <>
            <div className="flex items-center gap-2 rounded-md border-2 border-emerald-600 bg-emerald-50 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> CERTIGO<span className="text-emerald-700">.</span> SECURED — record verified
            </div>
            <div className="mt-8">
              <DigitalBadge
                serial={cert.serial}
                recipientName={cert.recipient_name}
                certTitle={cert.certifications?.title ?? "CERTIGO. Certificate"}
                issuerName={cert.certifications?.issuer_name ?? "CERTIGO."}
                issuedAt={cert.issued_at}
                verifyUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/verify/${cert.serial}`}
              />
            </div>
            <Link to="/certificate/$id" params={{ id: cert.serial }} className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
              Open full certificate page <ArrowRight className="h-3 w-3" />
            </Link>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Reference {formatReference(cert.serial)}
            </div>
          </>
        )}
        {state === "revoked" && (
          <div className="rounded-md border-2 border-destructive bg-destructive/5 p-6 text-destructive">
            <ShieldX className="h-5 w-5" />
            <div className="mt-2 font-bold">This certificate has been revoked.</div>
          </div>
        )}
        {state === "miss" && (
          <div className="rounded-md border-2 border-destructive bg-destructive/5 p-6 text-destructive">
            <ShieldX className="h-5 w-5" />
            <div className="mt-2 font-bold">No record matches {id}.</div>
          </div>
        )}
      </div>
    </div>
  );
}