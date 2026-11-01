import { supabase } from "@/integrations/supabase/client";
import { CERT_LABELS, type MonoCertProps } from "@/components/certigo/MonochromeCertificate";
import type { MonoTranscriptProps, TranscriptModule } from "@/components/certigo/MonochromeTranscript";

/**
 * Single source of truth for every certificate view: on screen, print and PDF,
 * for old and new certificates alike. All pages load the record here and build
 * the same props, so the layouts can't drift apart.
 */
export interface CertificateRecord {
  id: string;
  serial: string;
  recipient_name: string;
  recipient_id: string;
  issued_at: string;
  revoked: boolean;
  score: number;
  cert_title: string;
  slug: string;
  issuer_name: string;
  summary: string;
  skills: string[];
  modules: any[];
  pass_score: number;
}

export type DocLang = keyof typeof CERT_LABELS;
export const DOC_LOCALES: Record<DocLang, string> = { en: "en-GB", fr: "fr-FR", es: "es-ES", pt: "pt-PT", ar: "ar" };

export type CertificateProps = Omit<MonoCertProps, "variant" | "qrDataUrl">;
export type TranscriptProps = Omit<MonoTranscriptProps, "qrDataUrl">;

export interface CertificateDocument {
  serial: string;
  verifyUrl: string;
  certificate: CertificateProps;
  /** Translated copy, added when the learner reads the site in another language. */
  second?: CertificateProps;
  transcript: TranscriptProps | null;
}

export async function fetchCertificateRecord(lookup: string): Promise<CertificateRecord | null> {
  const { data, error } = await supabase.rpc("certificate_document", { lookup });
  if (error || !data || !(data as any).found) return null;
  const r = data as any;
  return {
    ...r,
    skills: Array.isArray(r.skills) ? r.skills.map(String) : [],
    modules: Array.isArray(r.modules) ? r.modules : [],
  } as CertificateRecord;
}

export function verifyUrlFor(serial: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/verify/${serial}`;
}

export function gradeFor(score: number): string {
  return score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "Pass";
}

/** Course skills, or the union of each lesson's skills when the course has none. */
export function certificateSkills(rec: Pick<CertificateRecord, "skills" | "modules">): string[] {
  if (rec.skills.length) return rec.skills.slice(0, 8);
  const out: string[] = [];
  rec.modules.forEach((m) => (Array.isArray(m?.skills) ? m.skills : []).forEach((s: unknown) => {
    const v = String(s).trim();
    if (v && !out.includes(v)) out.push(v);
  }));
  return out.slice(0, 8);
}

/** Transcript rows from the real lessons; falls back to the course skills. */
export function transcriptRows(rec: Pick<CertificateRecord, "skills" | "modules" | "score" | "cert_title">): TranscriptModule[] {
  const grade = gradeFor(rec.score);
  if (rec.modules.length) {
    return rec.modules.slice(0, 8).map((m: any, i: number) => {
      const title = String(m?.title ?? `Module ${i + 1}`);
      const minutes = Number(m?.minutes) || 12;
      return {
        code: `M${String(i + 1).padStart(2, "0")}`,
        title: `Module ${i + 1} · ${title}`,
        subject: String(m?.subject ?? title),
        learned: firstSentence(String(m?.learned ?? "")),
        skills: Array.isArray(m?.skills) ? m.skills.map(String) : [],
        hours: Math.max(1, Math.round((minutes / 60) * 10) / 10),
        grade,
        scorePct: rec.score,
      } as TranscriptModule;
    });
  }
  return rec.skills.slice(0, 8).map((title, i) => ({
    code: `M${String(i + 1).padStart(2, "0")}`,
    title: `Module ${i + 1} · ${title}`,
    subject: title,
    learned: `Applied ${title.toLowerCase()} through lessons, practical exercises and a knowledge check, then passed the ${rec.cert_title} assessment.`,
    hours: 6,
    grade,
    scorePct: rec.score,
  }));
}

/** Keeps each transcript row to one sentence so all lessons fit on one A4 page. */
function firstSentence(text: string): string {
  const t = text.trim();
  const i = t.search(/[.!?](\s|$)/);
  const one = i >= 0 ? t.slice(0, i + 1) : t;
  return one.length > 180 ? one.slice(0, 177).trimEnd() + "…" : one;
}

export function buildCertificateDocument(
  rec: CertificateRecord,
  opts: { lang?: string; translatedTitle?: string } = {},
): CertificateDocument {
  const verifyUrl = verifyUrlFor(rec.serial);
  const base: CertificateProps = {
    recipientName: rec.recipient_name,
    courseTitle: rec.cert_title,
    issueDate: rec.issued_at,
    certificateId: rec.serial,
    verifyUrl,
    skills: certificateSkills(rec),
    description: rec.summary ? firstSentence(rec.summary) : undefined,
    moduleCount: rec.modules.length || undefined,
  };
  const lang = (opts.lang ?? "en") as DocLang;
  const second: CertificateProps | undefined =
    lang !== "en" && CERT_LABELS[lang]
      ? {
          ...base,
          courseTitle: opts.translatedTitle || rec.cert_title,
          labels: CERT_LABELS[lang],
          dir: lang === "ar" ? "rtl" : "ltr",
          locale: DOC_LOCALES[lang],
          footnote: CERT_LABELS[lang].note,
        }
      : undefined;
  const rows = transcriptRows(rec);
  const hours = Math.round(rows.reduce((s, m) => s + (m.hours || 0), 0) * 10) / 10;
  if (rec.modules.length && hours) { base.hours = hours; if (second) second.hours = hours; }
  const transcript: TranscriptProps | null = rows.length
    ? {
        recipientName: rec.recipient_name,
        programmeTitle: rec.cert_title,
        certificateId: rec.serial,
        issueDate: rec.issued_at,
        verifyUrl,
        modules: rows,
        finalGrade: gradeFor(rec.score),
        finalScorePct: rec.score,
        totalHours: Math.round(rows.reduce((s, m) => s + (m.hours || 0), 0) * 10) / 10,
      }
    : null;
  return { serial: rec.serial, verifyUrl, certificate: base, second, transcript };
}
