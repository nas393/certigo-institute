import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/kredo/Header";
import { CertificateView, type CertTemplate } from "@/components/kredo/CertificateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Loader2, Pencil, Lock } from "lucide-react";
import { downloadCertificatePdf } from "@/lib/pdf";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/certificate/$id")({
  head: () => ({ meta: [{ title: "Certificate — Certogo" }, { name: "description", content: "A QR-verified Certogo certificate." }] }),
  component: CertPage,
});

function CertPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [cert, setCert] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [tpl, setTpl] = useState<CertTemplate>("classic");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTpl(((localStorage.getItem("kredo.certTemplate") as CertTemplate) || "classic"));
    }
  }, []);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("certificates").select("*").eq("id", id).maybeSingle();
      setCert(data);
      if (data) setName(data.recipient_name);
      if (user) {
        const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
        setProfile(p);
      }
    })();
  }, [id, user]);

  if (!cert) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${cert.id}`;
  const isOwner = user?.id === cert.user_id;
  const locked = !!cert.name_edited;
  const ADMIN_CODE = "T101112";

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Name cannot be empty"); return; }
    if (trimmed.length > 100) { toast.error("Name too long"); return; }
    if (locked && adminCode.trim().toUpperCase() !== ADMIN_CODE) {
      toast.error("Admin code required to change name again");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("certificates")
      .update({ recipient_name: trimmed, name_edited: true })
      .eq("id", cert.id)
      .select("*")
      .maybeSingle();
    setSaving(false);
    if (error || !data) { toast.error("Could not update name"); return; }
    setCert(data);
    setEditing(false);
    setAdminCode("");
    toast.success("Certificate name updated");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/dashboard" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">← Back</Link>
        <div className="mt-3 micro-label">◆ Certificate {cert.serial}</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter md:text-5xl">{cert.recipient_name}</h1>
        <p className="mt-2 text-muted-foreground">{cert.course_topic}</p>
        {isOwner && (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
            {!editing ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  {locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Pencil className="h-4 w-4 text-primary" />}
                  <span className="text-muted-foreground">
                    {locked ? "Name locked. Admin code required to change." : "You can edit the name on your certificate once."}
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit name</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Recipient name" className="h-10" />
                {locked && (
                  <Input value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Admin code" type="password" className="h-10 sm:max-w-[10rem]" />
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveName} disabled={saving}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditing(false); setName(cert.recipient_name); setAdminCode(""); }}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-8">
          <CertificateView serial={cert.serial} recipientName={cert.recipient_name} courseTopic={cert.course_topic}
            score={cert.score} issuedAt={cert.issued_at} verifyUrl={verifyUrl} watermark={!profile?.premium} template={tpl} />
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
