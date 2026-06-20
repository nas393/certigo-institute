
# CERTIGO. — Solo Professional Rebuild

Wipe the institution / bulk surface and rebuild around one person: discover a cert → quiz → issue → verify → add to LinkedIn. Keep the monochrome Helvetica Grid template and emerald accent, drop everything else.

## 1. Data reset (Lovable Cloud)

Single migration:
- `DROP TABLE` (cascade): `certificates`, `course_progress`, `courses`, `profiles`, `user_roles`. Drop `app_role` enum and `has_role`, `handle_new_user` functions + trigger.
- Recreate clean:
  - `profiles(user_id pk, display_name, headline, avatar_url, linkedin_url, premium bool, created_at)`
  - `certifications(id, slug uniq, title, issuer_name='CERTIGO.', category, summary, skills text[], question_count, pass_score, created_at)` — public catalog, anon SELECT.
  - `attempts(id, user_id, certification_id, score, passed, answers jsonb, created_at)` — own rows only.
  - `certificates(id, serial uniq, user_id, certification_id, recipient_name, score, issued_at, revoked bool)` — owner write, public SELECT for verification.
- GRANTs per spec, RLS on, `handle_new_user` recreates profile only (no roles).
- Seed 6 starter certifications (Product Management Foundations, Prompt Engineering, Data Literacy, Agile Delivery, UX Research, Cloud Fundamentals) with 8 MCQ questions each stored in a `questions` jsonb column on `certifications`.

## 2. Routes (delete everything else under `src/routes/` except `__root.tsx`, auth, `_authenticated/route.tsx`)

```
/                          recommender-first landing + Verification Playground + LinkedIn-share teaser
/catalog                   browse 6 certifications
/c/$slug                   certification detail + "Start exam" CTA
/auth                      email + Google sign-in
/_authenticated/exam/$slug timed MCQ runner
/_authenticated/issued/$serial  post-issue success: Digital Badge | Official Print toggle, LinkedIn button, Download PDF
/certificate/$serial       public Helvetica Grid cert (Digital / Print toggle, PDF, LinkedIn)
/verify/$serial            public verification page (resolves QR target)
/transcript/$serial        public A4 transcript + PDF
/_authenticated/dashboard  my certificates list
```

Remove: `/admin`, `/options`, `/templates`, `/styles`, `/settings`, `/profile` language stuff, pilot CTA section, registry feed, institution copy.

## 3. Recommender-first landing

Single hero question: "What do you do?" → 4 chip answers (PM, Engineer, Designer, Data). Picking one animates a recommended cert card in (one of the seeded certs) with "Start in 10 minutes" CTA → `/c/$slug`. Below: Verification Playground (paste a serial, animated scan → green "CERTIGO. SECURED" card resolving to real record via public SELECT). Footer: LinkedIn share teaser screenshot.

## 4. Issue + share

On exam pass: insert `certificate` row, redirect to `/issued/$serial`. Page has:
- Digital Badge view (compact share card, default)
- Official Print view (Helvetica Grid A4 landscape)
- `Download PDF` button → `cert-{serial}.pdf` (A4 landscape via jsPDF, includes QR to `${origin}/verify/${serial}` and serial string)
- `Add to LinkedIn` button → real URL builder

LinkedIn URL builder (`src/lib/linkedin.ts`):
```
https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME
  &name=<certTitle>
  &organizationName=<issuerName>
  &issueYear=<YYYY>&issueMonth=<M>
  &certUrl=<verifyUrl>
  &certId=<serial>
```
Opens with `target="_blank" rel="noopener"`.

## 5. Automated tests

`src/lib/__tests__/*.test.ts` (vitest, jsdom):
1. `linkedin.test.ts` — given fixture cert metadata, builder produces exact URL with all 6 params correctly encoded; assert `new URL(...)` parses and host is `www.linkedin.com`.
2. `verify.test.ts` — mocks supabase client; `resolveCertificate(serial)` returns the same record the QR encodes; `serial` formatter renders exactly `CERTIGO. CERT-CODE-NNNN`.
3. `pdf.test.ts` — calls `buildCertificatePdf(cert)`; asserts returned `Uint8Array` starts with `%PDF`, jsPDF instance is `landscape` `a4`, embedded text contains serial, and a QR `data:image/png` was drawn (spy on `addImage`). Calling twice with same cert produces same serial + same verify URL (idempotent).

Playwright shell script `tests/e2e/issue-and-download.mjs` (run on demand, not in CI by default): boots dev server, signs in via Supabase session env, navigates to a seeded `/issued/<serial>`, clicks Download PDF, asserts the downloaded file is A4 landscape PDF.

## 6. Dev-mode runtime banner

`<CertChecksBanner cert={cert} />` on `/certificate/$serial` and `/issued/$serial`, only when `import.meta.env.DEV`. Three rows with green/red dot:
- QR resolves to verify URL of same serial
- Serial renders as `CERTIGO. CERT-CODE-NNNN`
- LinkedIn URL parses and contains all required params

## 7. Design

Keep Helvetica Grid + emerald `#10B981` period. Solo-pro voice: "Your next credential, issued in 10 minutes." No "institutions", no "pilot", no "bulk". Minimalist geometric C+check logo stays.

## Technical notes

- jsPDF + qrcode already installed (transcript-pdf.ts) — reuse for cert PDF.
- Vitest already in package.json; add `jsdom` if missing.
- All server reads via existing `@/integrations/supabase/client` (public) or `requireSupabaseAuth` for issuance.
- Issuance via `createServerFn` with `requireSupabaseAuth` to compute serial + insert.

## Out of scope (explicit)

- Bulk issuance, admin console, institution onboarding, pilot program, registry feed, multi-language, settings page.
- Migration of old certificate data — full wipe, as confirmed.
