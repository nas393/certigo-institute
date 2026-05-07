import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/kredo/Header";
import { CertificateView } from "@/components/kredo/CertificateView";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { downloadCertificatePdf } from "@/lib/pdf";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/certificate/$id")({
  head: () => ({ meta: [{ title: "Certificate — Kredo" }, { name: "description", content: "A QR-verified Kredo certificate." }] }),
  component: CertPage,
});

function CertPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [cert, setCert] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
      setCert(data);
      if (user) {
        const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
        setProfile(p);
      }
    })();
  }, [id, user]);

  if (!cert) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${cert.id}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/dashboard" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">← Back</Link>
        <div className="mt-3 micro-label">◆ Certificate {cert.serial}</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">{cert.recipient_name}</h1>
        <p className="mt-2 text-muted-foreground">{cert.course_topic}</p>
        <div className="mt-8">
          <CertificateView serial={cert.serial} recipientName={cert.recipient_name} courseTopic={cert.course_topic}
            score={cert.score} issuedAt={cert.issued_at} verifyUrl={verifyUrl} watermark={!profile?.premium} />
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => downloadCertificatePdf({
            serial: cert.serial, recipientName: cert.recipient_name, courseTopic: cert.course_topic,
            score: cert.score, issuedAt: cert.issued_at, verifyUrl, watermark: !profile?.premium,
          })}><Download className="me-2 h-4 w-4" /> Download PDF</Button>
          <Button asChild variant="outline"><Link to="/verify/$id" params={{ id: cert.id }}>Public verify page</Link></Button>
        </div>
      </div>
    </div>
  );
}
