import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { QrCode, Search, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CertificateSheet } from "@/components/cert/CertificateView";

const OUTLINE_SLUGS = ["people-management-fundamentals", "procurement-and-vendor-management", "data-analytics-with-sql"];

/** Proof for visitors: a sample certificate, how employers check it, and real course outlines. */
export function HomeProof() {
  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("certifications").select("slug, title, summary, modules, question_count, pass_score").in("slug", OUTLINE_SLUGS)
      .then(({ data }) => setCourses((data ?? []).sort((a: any, b: any) => OUTLINE_SLUGS.indexOf(a.slug) - OUTLINE_SLUGS.indexOf(b.slug))));
  }, []);

  return (
    <>
      <section className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ What you receive</div>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tighter">A certificate built to be checked</h2>
        <div className="relative mt-6">
          <CertificateSheet
            recipientName="Ana Domingos" courseTitle="People Management Fundamentals"
            description="Coach, give feedback, and run effective 1:1s as a new manager."
            issueDate="2026-09-11T10:00:00Z" certificateId="CERT-SAMP-0000" verifyUrl="https://certigo.example/verify/CERT-SAMP-0000"
            skills={["Coaching", "1:1s", "Feedback", "Goal setting"]} moduleCount={6} hours={1.5} passMark={70}
          />
          <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow">
            Sample, not a real certificate
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ For employers</div>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tighter">How an employer checks a certificate</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: QrCode, t: "Scan the QR code", d: "Every certificate carries a QR code that opens its verification page." },
            { icon: Search, t: "Or enter the number", d: "Type the certificate number (CERT-XXXX-0000) on the verification page." },
            { icon: ShieldCheck, t: "See the live record", d: "Holder, course, issue date and whether it is still valid, straight from our registry." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-emerald-600" />
              <div className="mt-3 font-semibold">{t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {courses.length > 0 && (
        <section className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">◆ Inside a course</div>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tighter">See exactly what you'll learn</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {courses.map((c) => (
              <Link key={c.slug} to="/c/$slug" params={{ slug: c.slug }} className="rounded-xl border border-border bg-card p-5 transition hover:border-emerald-600/40">
                <div className="font-semibold">{c.title}</div>
                <ol className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {(Array.isArray(c.modules) ? c.modules : []).slice(0, 6).map((m: any, i: number) => (
                    <li key={i}>{i + 1}. {String(m?.title ?? "")}</li>
                  ))}
                </ol>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Exam · {c.question_count} questions · {c.pass_score}% to pass</div>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Want to know how we write courses and run exams? <Link to="/about" className="underline underline-offset-4">Read how we assess</Link>.
          </p>
        </section>
      )}
    </>
  );
}
