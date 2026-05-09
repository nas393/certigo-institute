import { createFileRoute } from "@tanstack/react-router";
import { CertificateView, CERT_TEMPLATES } from "@/components/kredo/CertificateView";

export const Route = createFileRoute("/templates")({
  head: () => ({ meta: [{ title: "Templates — CERTIGO." }] }),
  component: TemplatesShowcase,
});

function TemplatesShowcase() {
  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <h1 className="mb-4 text-2xl font-black tracking-tight">CERTIGO. — 10 Certificate Templates</h1>
      <div className="grid grid-cols-5 gap-4">
        {CERT_TEMPLATES.map((t, i) => (
          <div key={t.key} className="rounded bg-white p-2 shadow">
            <div className="mb-1 flex items-baseline justify-between">
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">OPT {i + 1}</div>
              <div className="text-xs font-bold">{t.label}</div>
            </div>
            <CertificateView
              template={t.key}
              orientation="landscape"
              serial="KR-2026-DEMO01"
              recipientName="Amara Okafor"
              courseTopic="Prompt Engineering Fundamentals"
              score={94}
              issuedAt={new Date().toISOString()}
              verifyUrl="https://certigo.app/verify/KR-2026-DEMO01"
            />
            <div className="mt-1 text-[10px] text-neutral-500">{t.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}