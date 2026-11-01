import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/kredo/Header";
import { Footer } from "@/components/saas/Footer";
import { CheckoutPanel, money, useCheckoutInfo } from "@/components/checkout/Checkout";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — CERTIGO." },
      { name: "description", content: "Lessons are free. Pay only to take a certificate exam: one certificate, or a monthly pass for every exam." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { info, reload } = useCheckoutInfo(null);
  const single = info ? money(info.single_cents, info.currency) : "";
  const pass = info ? money(info.pass_cents, info.currency) : "";
  const days = info?.pass_days ?? 30;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-700">◆ Pricing</div>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter sm:text-5xl">Learn free. Pay to get certified.</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Every lesson is free to read. You pay only when you want to take a certificate exam. Pass it and your verified certificate and transcript are issued straight away.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">One certificate</div>
            <div className="mt-2 text-4xl font-black">{single}</div>
            <p className="mt-2 text-sm text-muted-foreground">For one course. Includes the exam, retakes until you pass, the certificate, the transcript and a public verification page.</p>
            <Link to="/catalog" className="mt-5 inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted">Choose a course</Link>
          </div>
          <div className="rounded-2xl border-2 border-emerald-600/50 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-700">Monthly pass</div>
            <div className="mt-2 text-4xl font-black">{pass}<span className="text-base font-medium text-muted-foreground"> / {days} days</span></div>
            <p className="mt-2 text-sm text-muted-foreground">Every certificate exam is open for {days} days. Take as many as you can pass. It does not renew automatically.</p>
          </div>
        </div>

        {info && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Get the monthly pass</h2>
            {info.access.access && info.access.via === "pass" && info.access.until ? (
              <p className="mt-2 text-sm text-emerald-700">Your pass is active until {new Date(info.access.until).toLocaleDateString()}. Buying again adds {days} days.</p>
            ) : null}
            <div className="mt-3"><CheckoutPanel info={info} showSingle={false} onPaid={() => void reload()} /></div>
          </div>
        )}

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {[
            ["What do I get when I pass?", "A certificate with a unique number, a transcript of the lessons and your result, and a public page anyone can use to check it. You can download the official PDF and add it to LinkedIn."],
            ["What if I fail?", "Your purchase covers retakes until you pass. The second attempt opens 24 hours after the first; later attempts need 7 days between them."],
            ["Do you have promo codes?", "Sometimes. If you have one, enter it at checkout and the discount is applied automatically."],
            ["How do employers check a certificate?", "They scan the QR code or enter the certificate number on the verification page. It shows the holder, the course, the date and whether it is still valid."],
          ].map(([q, a]) => (
            <div key={q}>
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-muted/30 p-6">
          <h2 className="font-semibold">For companies and training teams</h2>
          <p className="mt-1 text-sm text-muted-foreground">Want to certify a team? <Link to="/contact" className="underline underline-offset-4">Contact us</Link> and we'll set it up.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
