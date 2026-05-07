import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/kredo/Header";
import { CertificateView } from "@/components/kredo/CertificateView";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Verify ${params.id} — Kredo` },
      { name: "description", content: "Public verification page for a Kredo certificate." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOccupationalCredential",
          identifier: params.id,
          credentialCategory: "Certificate",
          issuedBy: { "@type": "Organization", name: "Kredo" },
        }),
      },
    ],
  }),
  component: VerifyOne,
});

function VerifyOne() {
  const { id } = Route.useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
      setCert(data); setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-12">
        {cert && !cert.revoked ? (
          <>
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-5 py-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <div className="font-display text-lg font-black tracking-tight">✓ Verified by Kredo</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Issued {new Date(cert.issued_at).toLocaleDateString()} · Serial {cert.serial}
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <CertificateView serial={cert.serial} recipientName={cert.recipient_name} courseTopic={cert.course_topic}
                score={cert.score} issuedAt={cert.issued_at} verifyUrl={`${window.location.origin}/verify/${cert.id}`} />
              <div>
                <div className="micro-label">◆ Recipient</div>
                <h1 className="mt-2 font-display text-3xl font-black tracking-tighter">{cert.recipient_name}</h1>
                <div className="mt-6 micro-label">◆ Credential</div>
                <p className="mt-2 font-display text-xl">{cert.course_topic}</p>
                <div className="mt-6 micro-label">◆ Score</div>
                <p className="mt-2 font-display text-xl">{cert.score}%</p>
              </div>
            </div>
          </>
        ) : cert?.revoked ? (
          <div className="text-center">
            <ShieldX className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 font-display text-3xl font-black tracking-tighter">Certificate revoked</h1>
            <p className="mt-2 text-muted-foreground">Serial {cert.serial} is no longer valid.</p>
          </div>
        ) : (
          <div className="text-center">
            <ShieldX className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 font-display text-3xl font-black tracking-tighter">Certificate not found</h1>
            <p className="mt-2 text-muted-foreground">This ID does not match any Kredo credential.</p>
            <Link to="/verify" className="mt-6 inline-block font-mono text-[10px] uppercase tracking-widest text-primary">← Try another</Link>
          </div>
        )}
      </div>
    </div>
  );
}
