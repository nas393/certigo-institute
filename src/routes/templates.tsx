import { createFileRoute } from "@tanstack/react-router";
import { CertificateView, CERT_TEMPLATES } from "@/components/kredo/CertificateView";

export const Route = createFileRoute("/templates")({
  head: () => ({ meta: [{ title: "Templates — Certigo" }] }),
  component: TemplatesShowcase,
});

function TemplatesShowcase() {
  return (
    <div className="min-h-screen bg-neutral-100 p-10">
      <h1 className="mb-8 text-3xl font-black tracking-tight">Certigo — 10 Certificate Templates</h1>
      <div className="grid grid-cols-2 gap-8">
        {CERT_TEMPLATES.map((t, i) => (
          <div key={t.key} className="rounded-md bg-white p-4 shadow-md">
            <div className="mb-3 flex items-baseline justify-between">
              <div className="text-sm font-mono uppercase tracking-widest text-neutral-500">Option {i + 1}</div>
              <div className="text-lg font-bold">{t.label}</div>
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
            <div className="mt-2 text-xs text-neutral-500">{t.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}