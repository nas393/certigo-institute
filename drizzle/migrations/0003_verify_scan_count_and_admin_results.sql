CREATE OR REPLACE FUNCTION public.verify_record(lookup text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  c RECORD;
  cf RECORD;
  _hours numeric;
  _attempts int := 0;
  _issuer_count int := 0;
  _scans int := 0;
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

  SELECT count(*) INTO _scans FROM public.verification_events WHERE serial = c.serial;

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
    'issuer_credentials_issued', _issuer_count,
    'scan_count', _scans
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_course_results(_certification_id uuid)
 RETURNS TABLE(user_id uuid, display_name text, attempts integer, best_score integer, passed boolean, serial text, issued_at timestamp with time zone, enrolled_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT u.user_id,
         COALESCE(p.display_name, 'Unnamed learner') AS display_name,
         COALESCE(a.cnt, 0)::int AS attempts,
         COALESCE(a.best, 0)::int AS best_score,
         COALESCE(a.passed, false) AS passed,
         c.serial,
         c.issued_at,
         e.created_at AS enrolled_at
  FROM (
    SELECT DISTINCT user_id FROM public.attempts WHERE certification_id = _certification_id
    UNION
    SELECT DISTINCT user_id FROM public.enrollments WHERE certification_id = _certification_id
  ) u
  LEFT JOIN public.profiles p ON p.user_id = u.user_id
  LEFT JOIN (
    SELECT user_id, count(*) AS cnt, max(score) AS best, bool_or(passed) AS passed
    FROM public.attempts WHERE certification_id = _certification_id GROUP BY user_id
  ) a ON a.user_id = u.user_id
  LEFT JOIN public.certificates c ON c.user_id = u.user_id AND c.certification_id = _certification_id
  LEFT JOIN public.enrollments e ON e.user_id = u.user_id AND e.certification_id = _certification_id
  ORDER BY COALESCE(c.issued_at, e.created_at) DESC NULLS LAST;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_course_overview()
 RETURNS TABLE(certification_id uuid, learners integer, passers integer, certificates integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT cf.id,
    (SELECT count(DISTINCT e.user_id) FROM public.enrollments e WHERE e.certification_id = cf.id)::int,
    (SELECT count(DISTINCT a.user_id) FROM public.attempts a WHERE a.certification_id = cf.id AND a.passed)::int,
    (SELECT count(*) FROM public.certificates c WHERE c.certification_id = cf.id AND c.revoked = false)::int
  FROM public.certifications cf;
END;
$function$;