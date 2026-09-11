-- 1. Roles -------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'learner');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "user roles select own" ON public.user_roles;
CREATE POLICY "user roles select own" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2. Pricing ------------------------------------------------------------
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS price_cents integer NOT NULL DEFAULT 0;
ALTER TABLE public.certificates   ADD COLUMN IF NOT EXISTS price_cents integer NOT NULL DEFAULT 0;

-- 3. Enrollments --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, certification_id)
);

GRANT SELECT, INSERT, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments select own or admin" ON public.enrollments;
CREATE POLICY "enrollments select own or admin" ON public.enrollments
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "enrollments insert own" ON public.enrollments;
CREATE POLICY "enrollments insert own" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments delete own" ON public.enrollments;
CREATE POLICY "enrollments delete own" ON public.enrollments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. Admin visibility ----------------------------------------------------
DROP POLICY IF EXISTS "certificates select admin" ON public.certificates;
CREATE POLICY "certificates select admin" ON public.certificates
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "attempts select admin" ON public.attempts;
CREATE POLICY "attempts select admin" ON public.attempts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "lesson progress select admin" ON public.lesson_progress;
CREATE POLICY "lesson progress select admin" ON public.lesson_progress
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "certifications admin write" ON public.certifications;
CREATE POLICY "certifications admin write" ON public.certifications
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "certifications admin insert" ON public.certifications;
CREATE POLICY "certifications admin insert" ON public.certifications
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "certifications admin delete" ON public.certifications;
CREATE POLICY "certifications admin delete" ON public.certifications
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. Issue certificates with the course price recorded -------------------
CREATE OR REPLACE FUNCTION public.grade_and_issue(_certification_id uuid, _answers jsonb, _recipient_name text)
 RETURNS TABLE(passed boolean, score integer, serial text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid      uuid := auth.uid();
  _cert     public.certifications%ROWTYPE;
  _keys     jsonb;
  _total    integer;
  _correct  integer := 0;
  _score    integer;
  _passed   boolean;
  _serial   text;
  _code     text;
  _i        integer;
  _given    integer;
  _expected integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _recipient_name IS NULL OR length(trim(_recipient_name)) = 0
     OR length(_recipient_name) > 200 THEN
    RAISE EXCEPTION 'Invalid recipient name';
  END IF;

  SELECT * INTO _cert FROM public.certifications WHERE id = _certification_id;
  IF _cert.id IS NULL THEN
    RAISE EXCEPTION 'Certification not found';
  END IF;

  _keys  := _cert.answer_keys;
  _total := COALESCE(jsonb_array_length(_keys), 0);
  IF _total = 0 THEN
    RAISE EXCEPTION 'Certification has no scorable questions';
  END IF;

  FOR _i IN 0 .. _total - 1 LOOP
    BEGIN
      _given    := NULLIF(_answers->>(_i::text), '')::int;
      _expected := (_keys->>_i)::int;
      IF _given IS NOT NULL AND _given = _expected THEN
        _correct := _correct + 1;
      END IF;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END LOOP;

  _score  := round((_correct::numeric / _total) * 100);
  _passed := _score >= _cert.pass_score;

  INSERT INTO public.attempts(user_id, certification_id, score, passed, answers)
  VALUES (_uid, _certification_id, _score, _passed, _answers);

  INSERT INTO public.enrollments(user_id, certification_id)
  VALUES (_uid, _certification_id)
  ON CONFLICT (user_id, certification_id) DO NOTHING;

  IF NOT _passed THEN
    RETURN QUERY SELECT _passed, _score, NULL::text;
    RETURN;
  END IF;

  _code := upper(regexp_replace(_cert.slug, '[^A-Za-z0-9]', '', 'g'));
  IF length(_code) < 4 THEN
    _code := rpad(_code, 4, 'X');
  END IF;
  _code := substr(_code, 1, 4);
  _serial := 'CERT-' || _code || '-' || lpad(((floor(random() * 9000))::int + 1000)::text, 4, '0');

  INSERT INTO public.certificates(serial, user_id, certification_id, recipient_name, score, price_cents)
  VALUES (_serial, _uid, _certification_id, trim(_recipient_name), _score, COALESCE(_cert.price_cents, 0));

  RETURN QUERY SELECT _passed, _score, _serial;
END;
$function$;

-- 6. Verification exposes the recorded fee -------------------------------
DROP FUNCTION IF EXISTS public.verify_certificate(text);
CREATE FUNCTION public.verify_certificate(lookup text)
 RETURNS TABLE(serial text, recipient_name text, issued_at timestamptz, revoked boolean, score integer, cert_title text, issuer_name text, skills text[], price_cents integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT c.serial, c.recipient_name, c.issued_at, c.revoked, c.score,
         cf.title, cf.issuer_name, cf.skills, c.price_cents
  FROM public.certificates c
  JOIN public.certifications cf ON cf.id = c.certification_id
  WHERE c.serial = upper(lookup)
     OR c.id::text = lower(lookup)
  LIMIT 1
$function$;