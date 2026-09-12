CREATE TABLE IF NOT EXISTS public.verification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial text NOT NULL,
  outcome text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.verification_events TO service_role;
ALTER TABLE public.verification_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.verify_record(lookup text)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  c RECORD;
  cf RECORD;
  _hours numeric;
  _attempts int := 0;
  _issuer_count int := 0;
  _key text := upper(coalesce(lookup, ''));
BEGIN
  SELECT * INTO c FROM public.certificates
   WHERE serial = _key OR id::text = lower(coalesce(lookup, ''))
   LIMIT 1;

  IF c.id IS NULL THEN
    INSERT INTO public.verification_events(serial, outcome) VALUES (coalesce(lookup, ''), 'not_found');
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT * INTO cf FROM public.certifications WHERE id = c.certification_id;

  SELECT COALESCE(SUM(GREATEST(1, COALESCE((m->>'minutes')::numeric, 12))), 0) / 60.0
    INTO _hours
    FROM jsonb_array_elements(COALESCE(cf.modules, '[]'::jsonb)) m;

  SELECT count(*) INTO _attempts FROM public.attempts
   WHERE user_id = c.user_id AND certification_id = c.certification_id;

  SELECT count(*) INTO _issuer_count FROM public.certificates
   WHERE certification_id = c.certification_id AND revoked = false;

  INSERT INTO public.verification_events(serial, outcome)
  VALUES (c.serial, CASE WHEN c.revoked THEN 'revoked' ELSE 'verified' END);

  RETURN jsonb_build_object(
    'found', true,
    'serial', c.serial,
    'recipient_name', c.recipient_name,
    'recipient_id', c.user_id,
    'issued_at', c.issued_at,
    'revoked', c.revoked,
    'score', c.score,
    'cert_title', cf.title,
    'issuer_name', cf.issuer_name,
    'category', cf.category,
    'summary', cf.summary,
    'competencies', to_jsonb(COALESCE(cf.skills, '{}'::text[])),
    'modules', COALESCE(cf.modules, '[]'::jsonb),
    'question_count', COALESCE(cf.question_count, 0),
    'pass_score', COALESCE(cf.pass_score, 70),
    'hours', round(COALESCE(_hours, 0), 1),
    'attempt_count', _attempts,
    'issuer_credentials_issued', _issuer_count
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.verify_record(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_serials(_serials text[])
RETURNS TABLE(input text, found boolean, serial text, status text, recipient_name text, cert_title text, issuer_name text, issued_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT s AS input,
         c.id IS NOT NULL AS found,
         c.serial,
         CASE WHEN c.id IS NULL THEN 'unverified'
              WHEN c.revoked THEN 'revoked'
              ELSE 'active' END AS status,
         c.recipient_name,
         cf.title,
         cf.issuer_name,
         c.issued_at
  FROM unnest(_serials) AS s
  LEFT JOIN public.certificates c ON c.serial = upper(s)
  LEFT JOIN public.certifications cf ON cf.id = c.certification_id;
$$;
GRANT EXECUTE ON FUNCTION public.verify_serials(text[]) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.public_passport(_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'user_id', p.user_id,
    'display_name', p.display_name,
    'headline', p.headline,
    'avatar_url', p.avatar_url,
    'linkedin_url', p.linkedin_url,
    'credentials', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'serial', c.serial,
               'title', cf.title,
               'issuer_name', cf.issuer_name,
               'category', cf.category,
               'issued_at', c.issued_at,
               'score', c.score,
               'revoked', c.revoked,
               'competencies', to_jsonb(COALESCE(cf.skills, '{}'::text[]))
             ) ORDER BY c.issued_at DESC)
      FROM public.certificates c
      JOIN public.certifications cf ON cf.id = c.certification_id
      WHERE c.user_id = p.user_id
    ), '[]'::jsonb)
  )
  FROM public.profiles p
  WHERE p.user_id = _user_id;
$$;
GRANT EXECUTE ON FUNCTION public.public_passport(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.public_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'courses', (SELECT count(*) FROM public.certifications),
    'credentials', (SELECT count(*) FROM public.certificates WHERE revoked = false),
    'holders', (SELECT count(DISTINCT user_id) FROM public.certificates WHERE revoked = false),
    'issuers', (SELECT count(DISTINCT issuer_name) FROM public.certifications),
    'verifications', (SELECT count(*) FROM public.verification_events),
    'verifications_7d', (SELECT count(*) FROM public.verification_events WHERE created_at > now() - interval '7 days')
  );
$$;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;