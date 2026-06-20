import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/kredo/Header";
import { CertificateView, type CertTemplate, type CertOrientation } from "@/components/kredo/CertificateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Loader2, Pencil, Lock, Linkedin, Share2, QrCode, BadgeCheck } from "lucide-react";
import QRCode from "qrcode";
import { formatSerial } from "@/lib/cert";
import { downloadCertificatePdf } from "@/lib/pdf";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/certificate/$id")({
  head: () => ({ meta: [{ title: "Certificate — CERTIGO." }, { name: "description", content: "A QR-verified CERTIGO. certificate." }] }),
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
  const [tpl, setTpl] = useState<CertTemplate>("signature");
  const [ori, setOri] = useState<CertOrientation>("landscape");
  const [view, setView] = useState<"digital" | "print">("print");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTpl(((localStorage.getItem("kredo.certTemplate") as CertTemplate) || "signature"));
      setOri(((localStorage.getItem("kredo.certOrientation") as CertOrientation) || "landscape"));
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
          <div className="mb-5 inline-flex items-center rounded-full border border-border bg-surface p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setView("digital")}
              className={`h-9 min-w-[10rem] rounded-full px-4 transition-colors ${view === "digital" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              Digital badge view
            </button>
            <button
              type="button"
              onClick={() => setView("print")}
              className={`h-9 min-w-[10rem] rounded-full px-4 transition-colors ${view === "print" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              Official print view
            </button>
          </div>
          {view === "digital" ? (
            <DigitalBadge cert={cert} verifyUrl={verifyUrl} />
          ) : (
          <div
            className="mx-auto"
            style={{
              width: ori === "portrait"
                ? "min(100%, calc(78vh / 1.414))"
                : "min(100%, calc(78vh * 1.414))",
            }}
          >
            <CertificateView serial={cert.serial} recipientName={cert.recipient_name} courseTopic={cert.course_topic}
              score={cert.score} issuedAt={cert.issued_at} verifyUrl={verifyUrl} watermark={!profile?.premium} template={tpl} orientation={ori} />
          </div>
          )}
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button className="w-full sm:w-auto" onClick={() => downloadCertificatePdf({
            serial: cert.serial, recipientName: cert.recipient_name, courseTopic: cert.course_topic,
            score: cert.score, issuedAt: cert.issued_at, verifyUrl, watermark: !profile?.premium, orientation: ori,
          })}><Download className="me-2 h-4 w-4" /> Download PDF</Button>
          <AddToLinkedInButton cert={cert} verifyUrl={verifyUrl} />
          <Button asChild variant="outline" className="w-full sm:w-auto"><Link to="/verify/$id" params={{ id: cert.id }}>Public verify page</Link></Button>
          <Button asChild variant="outline" className="w-full sm:w-auto"><Link to="/transcript/$id" params={{ id: cert.id }}>View transcript (A4)</Link></Button>
        </div>
      </div>
      {/* Sticky one-tap download bar (mobile only) */}
      <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:hidden">
        <Button
          size="lg"
          className="h-12 w-full"
          onClick={() => downloadCertificatePdf({
            serial: cert.serial, recipientName: cert.recipient_name, courseTopic: cert.course_topic,
            score: cert.score, issuedAt: cert.issued_at, verifyUrl, watermark: !profile?.premium, orientation: ori,
          })}
        >
          <Download className="me-2 h-4 w-4" /> Download certificate (PDF)
        </Button>
      </div>
    </div>
  );
}

function AddToLinkedInButton({ cert, verifyUrl }: { cert: any; verifyUrl: string }) {
  const d = new Date(cert.issued_at);
  const issueMonth = d.getUTCMonth() + 1;
  const issueYear = d.getUTCFullYear();
  const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` +
    `&name=${encodeURIComponent(cert.course_topic)}` +
    `&organizationName=${encodeURIComponent("CERTIGO. Institute")}` +
    `&issueMonth=${issueMonth}` +
    `&issueYear=${issueYear}` +
    `&certUrl=${encodeURIComponent(verifyUrl)}` +
    `&certId=${encodeURIComponent(formatSerial(cert.serial))}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-10 min-h-[3rem] w-full items-center justify-center gap-2 rounded-md bg-[#0A66C2] px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:h-10 sm:min-h-10 sm:w-auto"
      aria-label="Add this certificate to your LinkedIn profile"
    >
      <Linkedin className="h-4 w-4" /> Add to LinkedIn profile
    </a>
  );
}

function DigitalBadge({ cert, verifyUrl }: { cert: any; verifyUrl: string }) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(verifyUrl, { margin: 0, width: 240, color: { dark: "#0B1B3A", light: "#ffffff00" } })
      .then((d) => { if (live) setQr(d); }).catch(() => {});
    return () => { live = false; };
  }, [verifyUrl]);
  const issued = new Date(cert.issued_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const onShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: cert.course_topic, url: verifyUrl }); return; } catch { /* cancelled */ }
    }
    try { await navigator.clipboard.writeText(verifyUrl); } catch { /* noop */ }
  };
  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-[#0B1B3A] px-5 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em]">
          <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "#10B981" }} />
          <span className="truncate">CERTIGO<span style={{ color: "#10B981" }}>.</span> Verified credential</span>
        </div>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">{formatSerial(cert.serial)}</span>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Awarded to</div>
          <h2 className="mt-1 truncate font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{cert.recipient_name}</h2>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Certification</div>
          <div className="mt-1 font-display text-base font-bold sm:text-lg">{cert.course_topic}</div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border bg-surface p-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Issued</dt>
              <dd className="mt-1 font-semibold">{issued}</dd>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Score</dt>
              <dd className="mt-1 font-semibold">{cert.score ? `${cert.score}%` : "Pass"}</dd>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Issuer</dt>
              <dd className="mt-1 font-semibold">CERTIGO. Institute</dd>
            </div>
            <div className="rounded-lg border border-border bg-surface p-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Expires</dt>
              <dd className="mt-1 font-semibold">No expiry</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 sm:items-end">
          <div className="rounded-xl bg-white p-3 ring-1 ring-border">
            {qr ? <img src={qr} alt="Verify QR" className="h-32 w-32 sm:h-36 sm:w-36" /> : <div className="grid h-32 w-32 place-items-center text-muted-foreground sm:h-36 sm:w-36"><QrCode className="h-6 w-6" /></div>}
          </div>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex h-11 min-w-[8rem] items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-xs font-semibold hover:bg-surface-muted"
          >
            <Share2 className="h-4 w-4" /> Share link
          </button>
        </div>
      </div>
    </div>
  );
}
