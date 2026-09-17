-- Discount codes
CREATE TABLE public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  percent_off integer NOT NULL DEFAULT 10,
  certification_id uuid REFERENCES public.certifications(id) ON DELETE CASCADE,
  max_redemptions integer,
  redemptions integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  note text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT discount_codes_percent_range CHECK (percent_off BETWEEN 1 AND 100),
  CONSTRAINT discount_codes_code_format CHECK (code = upper(code) AND length(code) BETWEEN 3 AND 32)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discount_codes TO authenticated;
GRANT ALL ON public.discount_codes TO service_role;

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discount codes admin read" ON public.discount_codes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "discount codes admin insert" ON public.discount_codes
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "discount codes admin update" ON public.discount_codes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "discount codes admin delete" ON public.discount_codes
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Public, safe code lookup: never lists codes, only checks one against one course.
CREATE OR REPLACE FUNCTION public.preview_discount(_code text, _certification_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d public.discount_codes%ROWTYPE;
  base integer;
BEGIN
  SELECT price_cents INTO base FROM public.certifications WHERE id = _certification_id;
  IF base IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Course not found');
  END IF;

  SELECT * INTO d FROM public.discount_codes
   WHERE code = upper(trim(coalesce(_code, '')))
   LIMIT 1;

  IF d.id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'That code does not exist');
  END IF;
  IF NOT d.active THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'That code is no longer active');
  END IF;
  IF d.expires_at IS NOT NULL AND d.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'That code has expired');
  END IF;
  IF d.max_redemptions IS NOT NULL AND d.redemptions >= d.max_redemptions THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'That code has been fully redeemed');
  END IF;
  IF d.certification_id IS NOT NULL AND d.certification_id <> _certification_id THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'That code does not apply to this course');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'code', d.code,
    'percent_off', d.percent_off,
    'price_cents', base,
    'final_cents', GREATEST(0, round(base * (100 - d.percent_off) / 100.0)::int)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.preview_discount(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.preview_discount(text, uuid) TO anon, authenticated;

-- Admin: bulk price update across a category (or every course when _category is null)
CREATE OR REPLACE FUNCTION public.admin_bulk_set_price(_category text, _price_cents integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _price_cents IS NULL OR _price_cents < 0 OR _price_cents > 10000000 THEN
    RAISE EXCEPTION 'Invalid price';
  END IF;

  UPDATE public.certifications
     SET price_cents = _price_cents
   WHERE _category IS NULL OR category = _category;

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_bulk_set_price(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_bulk_set_price(text, integer) TO authenticated;

-- Admin: revoke / restore an issued credential
CREATE OR REPLACE FUNCTION public.admin_set_certificate_revoked(_serial text, _revoked boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.certificates
     SET revoked = coalesce(_revoked, false)
   WHERE serial = upper(trim(coalesce(_serial, '')));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credential not found';
  END IF;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_certificate_revoked(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_certificate_revoked(text, boolean) TO authenticated;

-- Admin: platform-wide snapshot
CREATE OR REPLACE FUNCTION public.admin_overview_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN jsonb_build_object(
    'courses', (SELECT count(*) FROM public.certifications),
    'learners', (SELECT count(DISTINCT user_id) FROM public.enrollments),
    'enrollments', (SELECT count(*) FROM public.enrollments),
    'attempts', (SELECT count(*) FROM public.attempts),
    'certificates', (SELECT count(*) FROM public.certificates WHERE revoked = false),
    'revoked', (SELECT count(*) FROM public.certificates WHERE revoked),
    'verifications', (SELECT count(*) FROM public.verification_events),
    'active_codes', (SELECT count(*) FROM public.discount_codes WHERE active),
    'avg_price_cents', (SELECT coalesce(round(avg(price_cents))::int, 0) FROM public.certifications)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_overview_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_overview_stats() TO authenticated;