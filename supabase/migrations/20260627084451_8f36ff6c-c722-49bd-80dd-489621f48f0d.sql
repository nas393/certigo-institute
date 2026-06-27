
-- 1) Move correct answers into a private column and strip them from public questions
ALTER TABLE public.certifications
  ADD COLUMN IF NOT EXISTS answer_keys jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.certifications
SET
  answer_keys = COALESCE((
    SELECT jsonb_agg(COALESCE((q->>'answer')::int, 0))
    FROM jsonb_array_elements(questions) q
  ), '[]'::jsonb),
  questions = COALESCE((
    SELECT jsonb_agg(q - 'answer')
    FROM jsonb_array_elements(questions) q
  ), '[]'::jsonb)
WHERE jsonb_typeof(questions) = 'array';

-- 2) Tighten certificates RLS
DROP POLICY IF EXISTS "certificates public verify" ON public.certificates;
DROP POLICY IF EXISTS "certificates insert own" ON public.certificates;

CREATE POLICY "certificates select own"
ON public.certificates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "certificates insert own validated"
ON public.certificates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.attempts a
    WHERE a.user_id = auth.uid()
      AND a.certification_id = certificates.certification_id
      AND a.passed = true
      AND a.score >= certificates.score
  )
);

-- 3) Public verification RPC — safe, single-record lookup
CREATE OR REPLACE FUNCTION public.verify_certificate(lookup text)
RETURNS TABLE (
  serial         text,
  recipient_name text,
  issued_at      timestamptz,
  revoked        boolean,
  score          integer,
  cert_title     text,
  issuer_name    text,
  skills         text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.serial, c.recipient_name, c.issued_at, c.revoked, c.score,
         cf.title, cf.issuer_name, cf.skills
  FROM public.certificates c
  JOIN public.certifications cf ON cf.id = c.certification_id
  WHERE c.serial = upper(lookup)
     OR c.id::text = lower(lookup)
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- 4) Sample serial (for the public verification playground)
CREATE OR REPLACE FUNCTION public.sample_certificate_serial()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT serial
  FROM public.certificates
  WHERE revoked = false
  ORDER BY issued_at DESC
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.sample_certificate_serial() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sample_certificate_serial() TO anon, authenticated;

-- 5) Server-side grading + certificate issuance (atomic, validated)
CREATE OR REPLACE FUNCTION public.grade_and_issue(
  _certification_id uuid,
  _answers          jsonb,
  _recipient_name   text
)
RETURNS TABLE (passed boolean, score integer, serial text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      -- malformed answer for this index: count as wrong
      NULL;
    END;
  END LOOP;

  _score  := round((_correct::numeric / _total) * 100);
  _passed := _score >= _cert.pass_score;

  INSERT INTO public.attempts(user_id, certification_id, score, passed, answers)
  VALUES (_uid, _certification_id, _score, _passed, _answers);

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

  INSERT INTO public.certificates(serial, user_id, certification_id, recipient_name, score)
  VALUES (_serial, _uid, _certification_id, trim(_recipient_name), _score);

  RETURN QUERY SELECT _passed, _score, _serial;
END;
$$;

REVOKE ALL ON FUNCTION public.grade_and_issue(uuid, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grade_and_issue(uuid, jsonb, text) TO authenticated;
