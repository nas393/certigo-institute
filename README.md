# Kredo Verified Credentials

Role: Act as a senior full-stack product engineer + world-class SaaS designer. Build a production-grade web app called Kredo.

One-line pitch: Kredo is the fastest way to create credentials employers can verify instantly. Users type a skill → AI generates a full course → user studies & passes a quiz → user receives a QR-verified certificate stored permanently in their account.

Tagline (must appear in hero and final CTA):

From knowledge to verified proof — instantly.

1. Tech Stack (non-negotiable)

Framework: TanStack Start v1 + React 19 + Vite 7

Routing: File-based under src/routes/ (flat dot-separated). Root layout = src/routes/__root.tsx.

Styling: Tailwind v4 via src/styles.css with oklch semantic tokens (no hardcoded colors in components)

UI primitives: shadcn/ui

Backend: Lovable Cloud (Supabase under the hood) — database, auth, storage, edge logic via createServerFn

AI: Lovable AI Gateway — default model google/gemini-2.5-flash (no API keys required)

PDF: client-side generation with jspdf + qrcode

Auth: email/password + Google OAuth via lovable.auth.signInWithOAuth("google"). Email confirmation ON.

i18n: lightweight context (src/lib/i18n.tsx) with EN/FR/ES/AR. RTL support for AR.

2. Design System

Aesthetic: Apple-level minimal, editorial, brutalist-confident. High whitespace, oversized type, monospace micro-labels (◆, —, ✓), single saturated accent.

Tokens (src/styles.css, oklch):

--background: near-white warm paper

--foreground: near-black ink

--primary: deep saturated indigo/violet accent (single bold color)

--primary-foreground: white

--card, --muted, --border: subtle warm grays

Add --gradient-primary, --shadow-elegant

Typography: display = bold geometric sans (e.g. system black), body = clean sans. Tracking-tighter on headings (-0.02em+). Mono font for micro-labels and IDs.

Rules: never use raw text-white/bg-black — only semantic tokens. Every color customizable via tokens.

3. Database Schema (Lovable Cloud / Supabase)

Create via migration:

-- Roles (separate table — never on profiles)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  level TEXT,
  duration TEXT,
  language TEXT DEFAULT 'en',
  outline JSONB NOT NULL,        -- modules/lessons/quiz from AI
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  exam_score INT,
  current_lesson INT DEFAULT 0,
  UNIQUE(user_id, course_id)
);

CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  recipient_name TEXT NOT NULL,
  course_topic TEXT NOT NULL,
  score INT,
  serial TEXT UNIQUE NOT NULL,    -- e.g. KR-2026-XXXXXX
  issued_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)      -- one cert per user per course
);

RLS: enable on every table. Users can SELECT/INSERT/UPDATE only their own rows (auth.uid() = user_id). certificates SELECT also allowed publicly by id for verification page (separate policy USING (true) on SELECT only — adjust if you want to gate).

Security definer function has_role(_user_id uuid, _role app_role) for admin checks.

4. Server Functions (src/server/*.functions.ts)

generateCourse({ topic, level, duration, language }) — calls Lovable AI Gateway, structured JSON outline (modules → lessons + final 5–10 question quiz), saves to courses, returns { id }.

getCourse({ id }) — fetches course + user's progress.

saveProgress({ courseId, currentLesson }) — upserts course_progress.

submitExam({ courseId, answers }) — grades, saves score, marks completed if ≥70%.

issueCertificate({ courseId, recipientName }) — idempotent; reuses existing cert if present, else creates with generated serial.

getMyCertificateForCourse({ courseId }) — returns { cert, completed }.

listMyCertificates() — for dashboard.

getCertificateById({ id }) — public verify endpoint.

All wrapped in createServerFn with Zod input validation. Server-only DB code in *.server.ts files.

5. Routes & Pages

RoutePurpose/Marketing homepage (see §6)/authEmail + Google login/signup/dashboardMy courses (in-progress + completed) and "Certificates" section with Preview/Download buttons/course/$idLesson viewer + quiz + inline Certificate Center below content once completed/certificate/$idFull-page printable certificate view/verifyPaste a serial/ID to verify/verify/$idPublic verification page (shows cert + ✓ Verified by Kredo)/unlockPremium upsell page/profileEdit display name, avatar, language/archivePast generated courses

Course page must:

Persist start/progress/completion to DB so refresh/device switch never resets.

After exam pass, render an InlineCertificatePreview directly below content (no scroll hunt).

Show Certificate Center with: Preview, Download PDF (one click), Regenerate Certificate (recreates if missing), Copy verification link.

If course already completed (from DB), skip exam lock — show certificate immediately.

Dashboard must: dedicated Certificates section listing all earned certs with working Preview/Download.

6. Marketing Homepage (src/routes/index.tsx)

Sections in order:

Hero — ◆ CREDENTIAL INFRASTRUCTURE eyebrow, H1 "From knowledge to verified proof. Instantly.", subhead, primary CTA "Generate your first course & certificate →", secondary "View demo certificate". Below: animated certificate mock with QR.

Trust bar — 4 pills (QR-verified, Tamper-proof, Built for Employers, Global-ready) + 3 stats (12,400+ certs, 38 countries, 84,000+ scans).

How it works — 4 steps grid (Enter skill → AI builds course → Learn & pass quiz → Earn verified cert).

Demo certificate — split layout, explains QR + ledger, "Verify this certificate →".

Who it's for — Job seekers / Coaches & creators / Companies & HR.

Why Kredo exists — dark inverted section, manifesto copy.

Viral sharing — LinkedIn one-click, public profile kredo.app/u/name, shareable links.

Pricing — Starter (Free, 1 watermarked cert), Pro $19/mo (highlighted, unlimited, no branding, LinkedIn), Business $29/seat (bulk, admin).

Testimonials — 3 quotes from Lagos / Nairobi / Cape Town.

Final CTA — H2 "Start creating verified credentials today.", inline topic input + Generate button, "No credit card · 1 free certificate".

Repeat key message throughout: "Kredo is the fastest way to create credentials employers can verify instantly."

7. Certificate PDF

Client-side via jspdf. A4 landscape. Layout:

KREDO. wordmark top-left, serial KR-YYYY-XXXXXX top-right

"CERTIFICATE OF COMPLETION" eyebrow

Recipient name in huge display type

"For successfully completing {course topic}" with score & date

QR code bottom-right linking to /verify/{id}

Director signature line bottom-left

Subtle background ring/watermark

One-click Download triggers doc.save(\kredo-${serial}.pdf`)`.

8. Acceptance Criteria

✅ Refresh on /course/$id after completion never re-locks the user

✅ Certificate persists forever; available from course page AND dashboard

✅ Preview + Download buttons work in both locations

✅ Regenerate Certificate recreates record/PDF if missing

✅ Public /verify/$id page works without login

✅ All DB access protected by RLS

✅ Google OAuth + email auth both work

✅ Mobile-first, fast, Apple-level polish

✅ Every color/spacing comes from src/styles.css tokens

✅ SEO: unique <title> & meta per route, single H1, semantic HTML, JSON-LD on /verify/$id

Build it bold, build it minimal, build it trustworthy.

Want me to save this as a markdown file in /mnt/documents/ for easy download?

Kredo — Full Rebuild Prompt

Below is a complete, self-contained prompt you can paste into a fresh Lovable project to rebuild this app from scratch.

PRO

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://certigo-institute.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/19e2de17-6e78-44b8-a483-68d726c27e43).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
