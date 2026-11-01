-- CERTIGO spec step 2: publishing, exam rules, serials, certificate data, promo limits, bulk verify.
-- Non-destructive: adds columns/tables/functions; existing rows are kept.

-- 1. Catalogue publishing (Q3, Q17). User-created courses stay hidden until an admin approves them.
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
GRANT SELECT (published) ON public.certifications TO anon, authenticated;
ALTER POLICY "certifications public read" ON public.certifications USING (
  published
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.certification_id = certifications.id AND e.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.certificates c WHERE c.certification_id = certifications.id AND c.user_id = auth.uid())
);

-- 3. Unique, permanent CERT-XXXX-0000 serials with collision retry (Q8).
CREATE INDEX IF NOT EXISTS certificates_user_cert_idx ON public.certificates (user_id, certification_id);
CREATE OR REPLACE FUNCTION public.issue_certificate_serial(_slug text)
RETURNS text LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _code text; _s text; _tries int := 0;
BEGIN
  _code := substr(rpad(upper(regexp_replace(coalesce(_slug, ''), '[^A-Za-z0-9]', '', 'g')), 4, 'X'), 1, 4);
  LOOP
    _s := 'CERT-' || _code || '-' || lpad((floor(random() * 9000)::int + 1000)::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.certificates WHERE serial = _s);
    _tries := _tries + 1;
    IF _tries > 200 THEN RAISE EXCEPTION 'Could not allocate a certificate serial'; END IF;
  END LOOP;
  RETURN _s;
END $$;

-- 4. Exam sessions: server-side shuffled questions/options (F8) and retake rules (Q16).
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  q_order int[] NOT NULL,
  opt_orders jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '3 hours',
  submitted_at timestamptz
);
CREATE INDEX IF NOT EXISTS exam_sessions_user_cert_idx ON public.exam_sessions (user_id, certification_id);
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.exam_sessions FROM anon, authenticated;

-- First attempt free; second after 24 hours; every further attempt after 7 days.
CREATE OR REPLACE FUNCTION public.exam_next_allowed_at(_uid uuid, _cert uuid)
RETURNS timestamptz LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN n = 0 THEN NULL
              WHEN n = 1 THEN last + interval '24 hours'
              ELSE last + interval '7 days' END
    FROM (SELECT count(*) AS n, max(created_at) AS last FROM public.attempts
           WHERE user_id = _uid AND certification_id = _cert) a
$$;

CREATE OR REPLACE FUNCTION public.exam_status(_certification_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _serial text; _n int; _next timestamptz;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT serial INTO _serial FROM public.certificates
   WHERE user_id = _uid AND certification_id = _certification_id AND revoked = false
   ORDER BY issued_at LIMIT 1;
  SELECT count(*) INTO _n FROM public.attempts WHERE user_id = _uid AND certification_id = _certification_id;
  _next := public.exam_next_allowed_at(_uid, _certification_id);
  RETURN jsonb_build_object(
    'certified', _serial IS NOT NULL, 'serial', _serial, 'attempts', _n,
    'next_allowed_at', CASE WHEN _next > now() THEN _next END);
END $$;

CREATE OR REPLACE FUNCTION public.start_exam(_certification_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid(); _cert public.certifications%ROWTYPE; _st jsonb;
  _s public.exam_sessions%ROWTYPE; _n int; _order int[]; _opts jsonb := '[]'::jsonb;
  _qi int; _len int; _items jsonb := '[]'::jsonb; _k int; _perm jsonb; _o jsonb;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _cert FROM public.certifications WHERE id = _certification_id;
  IF _cert.id IS NULL OR NOT (_cert.published OR public.has_role(_uid, 'admin'::public.app_role)
      OR EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = _uid AND certification_id = _cert.id)) THEN
    RAISE EXCEPTION 'Certification not found';
  END IF;
  _st := public.exam_status(_certification_id);
  IF (_st->>'certified')::boolean THEN
    RETURN jsonb_build_object('status', 'certified', 'serial', _st->>'serial');
  END IF;
  IF _st->>'next_allowed_at' IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'wait', 'next_allowed_at', _st->>'next_allowed_at', 'attempts', _st->'attempts');
  END IF;

  -- Reuse an open session so a page refresh doesn't reshuffle or burn an attempt.
  SELECT * INTO _s FROM public.exam_sessions
   WHERE user_id = _uid AND certification_id = _cert.id AND submitted_at IS NULL AND expires_at > now()
   ORDER BY created_at DESC LIMIT 1;
  IF _s.id IS NULL THEN
    _n := coalesce(jsonb_array_length(_cert.questions), 0);
    IF _n = 0 THEN RAISE EXCEPTION 'Certification has no exam questions'; END IF;
    SELECT array_agg(i ORDER BY random()) INTO _order FROM generate_series(0, _n - 1) i;
    FOREACH _qi IN ARRAY _order LOOP
      _len := coalesce(jsonb_array_length(_cert.questions->_qi->'options'), 0);
      SELECT coalesce(jsonb_agg(j ORDER BY random()), '[]'::jsonb) INTO _perm FROM generate_series(0, _len - 1) j;
      _opts := _opts || jsonb_build_array(_perm);
    END LOOP;
    INSERT INTO public.exam_sessions (user_id, certification_id, q_order, opt_orders)
      VALUES (_uid, _cert.id, _order, _opts) RETURNING * INTO _s;
  END IF;

  FOR _k IN 1 .. array_length(_s.q_order, 1) LOOP
    _qi := _s.q_order[_k];
    SELECT coalesce(jsonb_agg(jsonb_build_object('j', (p.v)::int, 'text', _cert.questions->_qi->'options'->((p.v)::int)) ORDER BY p.ord), '[]'::jsonb)
      INTO _o FROM jsonb_array_elements_text(_s.opt_orders->(_k - 1)) WITH ORDINALITY AS p(v, ord);
    _items := _items || jsonb_build_array(jsonb_build_object('i', _qi, 'q', _cert.questions->_qi->'q', 'options', _o));
  END LOOP;
  RETURN jsonb_build_object('status', 'ok', 'session_id', _s.id, 'expires_at', _s.expires_at, 'items', _items);
END $$;

-- _answers maps displayed question position ("0", "1", ...) to the displayed option position.
CREATE OR REPLACE FUNCTION public.submit_exam(_session_id uuid, _answers jsonb, _recipient_name text)
RETURNS TABLE(passed boolean, score integer, serial text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid(); _s public.exam_sessions%ROWTYPE; _cert public.certifications%ROWTYPE;
  _total int; _correct int := 0; _k int; _qi int; _given int; _orig int; _score int; _passed boolean;
  _serial text; _orig_answers jsonb := '{}'::jsonb;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _recipient_name IS NULL OR length(trim(_recipient_name)) = 0 OR length(_recipient_name) > 200 THEN
    RAISE EXCEPTION 'Invalid recipient name';
  END IF;
  SELECT * INTO _s FROM public.exam_sessions WHERE id = _session_id AND user_id = _uid FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Exam session not found'; END IF;
  IF _s.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'This exam was already submitted'; END IF;
  IF _s.expires_at < now() THEN RAISE EXCEPTION 'This exam session has expired. Start again.'; END IF;
  UPDATE public.exam_sessions SET submitted_at = now() WHERE id = _s.id;

  SELECT * INTO _cert FROM public.certifications WHERE id = _s.certification_id;
  _total := array_length(_s.q_order, 1);
  FOR _k IN 1 .. _total LOOP
    _qi := _s.q_order[_k];
    BEGIN
      _given := NULLIF(_answers->>((_k - 1)::text), '')::int;
      _orig := (_s.opt_orders->(_k - 1)->>_given)::int;
    EXCEPTION WHEN others THEN _orig := NULL; END;
    IF _orig IS NOT NULL THEN
      _orig_answers := _orig_answers || jsonb_build_object(_qi::text, _orig);
      IF _orig = (_cert.answer_keys->>_qi)::int THEN _correct := _correct + 1; END IF;
    END IF;
  END LOOP;

  _score := round((_correct::numeric / _total) * 100);
  _passed := _score >= coalesce(_cert.pass_score, 70);
  INSERT INTO public.attempts (user_id, certification_id, score, passed, answers)
    VALUES (_uid, _cert.id, _score, _passed, _orig_answers);
  INSERT INTO public.enrollments (user_id, certification_id) VALUES (_uid, _cert.id)
    ON CONFLICT (user_id, certification_id) DO NOTHING;

  IF NOT _passed THEN RETURN QUERY SELECT false, _score, NULL::text; RETURN; END IF;

  SELECT c.serial INTO _serial FROM public.certificates c
   WHERE c.user_id = _uid AND c.certification_id = _cert.id AND c.revoked = false LIMIT 1;
  IF _serial IS NULL THEN
    _serial := public.issue_certificate_serial(_cert.slug);
    INSERT INTO public.certificates (serial, user_id, certification_id, recipient_name, score, price_cents)
      VALUES (_serial, _uid, _cert.id, trim(_recipient_name), _score, coalesce(_cert.price_cents, 0));
  END IF;
  RETURN QUERY SELECT true, _score, _serial;
END $$;

-- 5. One read-only record used to render every certificate (screen, print, PDF). No scan logging.
CREATE OR REPLACE FUNCTION public.certificate_document(lookup text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.certificates%ROWTYPE; cf public.certifications%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.certificates
   WHERE serial = upper(coalesce(lookup, '')) OR id::text = lower(coalesce(lookup, '')) LIMIT 1;
  IF c.id IS NULL THEN RETURN jsonb_build_object('found', false); END IF;
  SELECT * INTO cf FROM public.certifications WHERE id = c.certification_id;
  RETURN jsonb_build_object(
    'found', true, 'id', c.id, 'serial', c.serial, 'recipient_name', c.recipient_name, 'recipient_id', c.user_id,
    'issued_at', c.issued_at, 'revoked', c.revoked, 'score', c.score,
    'cert_title', cf.title, 'slug', cf.slug, 'issuer_name', cf.issuer_name, 'summary', cf.summary,
    'skills', to_jsonb(coalesce(cf.skills, '{}'::text[])), 'modules', coalesce(cf.modules, '[]'::jsonb),
    'pass_score', coalesce(cf.pass_score, 70));
END $$;

-- 6. Discount codes: one redemption per account, and limited code checks (Q13, fix 18).
CREATE TABLE IF NOT EXISTS public.discount_redemptions (
  code_id uuid NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (code_id, user_id)
);
CREATE TABLE IF NOT EXISTS public.discount_checks (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS discount_checks_user_time_idx ON public.discount_checks (user_id, created_at);
ALTER TABLE public.discount_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_checks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.discount_redemptions, public.discount_checks FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.preview_discount(_code text, _certification_id uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE d public.discount_codes%ROWTYPE; base integer; _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('valid', false, 'reason', 'Sign in to use a code'); END IF;
  IF (SELECT count(*) FROM public.discount_checks WHERE user_id = _uid AND created_at > now() - interval '10 minutes') >= 10 THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Too many attempts. Try again in a few minutes.');
  END IF;
  INSERT INTO public.discount_checks (user_id) VALUES (_uid);

  SELECT price_cents INTO base FROM public.certifications WHERE id = _certification_id;
  IF base IS NULL THEN RETURN jsonb_build_object('valid', false, 'reason', 'Course not found'); END IF;
  SELECT * INTO d FROM public.discount_codes WHERE code = upper(trim(coalesce(_code, ''))) LIMIT 1;
  IF d.id IS NULL THEN RETURN jsonb_build_object('valid', false, 'reason', 'That code does not exist'); END IF;
  IF NOT d.active THEN RETURN jsonb_build_object('valid', false, 'reason', 'That code is no longer active'); END IF;
  IF d.expires_at IS NOT NULL AND d.expires_at < now() THEN RETURN jsonb_build_object('valid', false, 'reason', 'That code has expired'); END IF;
  IF d.max_redemptions IS NOT NULL AND d.redemptions >= d.max_redemptions THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'That code has been fully redeemed');
  END IF;
  IF d.certification_id IS NOT NULL AND d.certification_id <> _certification_id THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'That code does not apply to this course');
  END IF;
  IF EXISTS (SELECT 1 FROM public.discount_redemptions WHERE code_id = d.id AND user_id = _uid) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'You have already used this code');
  END IF;
  RETURN jsonb_build_object('valid', true, 'code', d.code, 'percent_off', d.percent_off, 'price_cents', base,
    'final_cents', GREATEST(0, round(base * (100 - d.percent_off) / 100.0)::int));
END $$;

-- 7. Bulk verification for approved organisations only (F3); single verification stays public.
CREATE OR REPLACE FUNCTION public.verify_serials(_serials text[])
RETURNS TABLE(input text, found boolean, serial text, status text, recipient_name text, cert_title text, issuer_name text, issued_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL OR NOT (public.has_role(_uid, 'admin'::public.app_role) OR public.has_role(_uid, 'verifier'::public.app_role)) THEN
    RAISE EXCEPTION 'Bulk verification is available to approved organisations. Contact CERTIGO for access.' USING ERRCODE = '42501';
  END IF;
  IF coalesce(array_length(_serials, 1), 0) > 200 THEN RAISE EXCEPTION 'Check at most 200 references at a time'; END IF;
  INSERT INTO public.verification_events (serial, outcome)
  SELECT upper(s), CASE WHEN c.id IS NULL THEN 'not_found' WHEN c.revoked THEN 'revoked' ELSE 'verified' END
    FROM unnest(_serials) AS s LEFT JOIN public.certificates c ON c.serial = upper(s);
  RETURN QUERY
  SELECT s, c.id IS NOT NULL, c.serial,
         CASE WHEN c.id IS NULL THEN 'unverified' WHEN c.revoked THEN 'revoked' ELSE 'active' END,
         c.recipient_name, cf.title, cf.issuer_name, c.issued_at
    FROM unnest(_serials) AS s
    LEFT JOIN public.certificates c ON c.serial = upper(s)
    LEFT JOIN public.certifications cf ON cf.id = c.certification_id;
END $$;

-- 8. Permissions.
REVOKE EXECUTE ON FUNCTION public.issue_certificate_serial(text), public.exam_next_allowed_at(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grade_and_issue(uuid, jsonb, text) FROM PUBLIC, anon, authenticated;  -- replaced by start_exam/submit_exam
REVOKE EXECUTE ON FUNCTION public.exam_status(uuid), public.start_exam(uuid), public.submit_exam(uuid, jsonb, text),
  public.preview_discount(text, uuid), public.verify_serials(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.exam_status(uuid), public.start_exam(uuid), public.submit_exam(uuid, jsonb, text),
  public.preview_discount(text, uuid), public.verify_serials(text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.certificate_document(text) TO anon, authenticated;
