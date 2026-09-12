CREATE OR REPLACE FUNCTION public.admin_course_results(_certification_id uuid)
 RETURNS TABLE(user_id uuid, display_name text, attempts integer, best_score integer, passed boolean, serial text, issued_at timestamp with time zone, enrolled_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT u.uid,
         COALESCE(p.display_name, 'Unnamed learner'),
         COALESCE(a.cnt, 0)::int,
         COALESCE(a.best, 0)::int,
         COALESCE(a.pass_any, false),
         c.serial,
         c.issued_at,
         e.created_at
  FROM (
    SELECT DISTINCT at.user_id AS uid FROM public.attempts at WHERE at.certification_id = _certification_id
    UNION
    SELECT DISTINCT en.user_id AS uid FROM public.enrollments en WHERE en.certification_id = _certification_id
  ) u
  LEFT JOIN public.profiles p ON p.user_id = u.uid
  LEFT JOIN (
    SELECT at.user_id AS uid, count(*) AS cnt, max(at.score) AS best, bool_or(at.passed) AS pass_any
    FROM public.attempts at WHERE at.certification_id = _certification_id GROUP BY at.user_id
  ) a ON a.uid = u.uid
  LEFT JOIN public.certificates c ON c.user_id = u.uid AND c.certification_id = _certification_id
  LEFT JOIN public.enrollments e ON e.user_id = u.uid AND e.certification_id = _certification_id
  ORDER BY COALESCE(c.issued_at, e.created_at) DESC NULLS LAST;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_course_overview()
 RETURNS TABLE(certification_id uuid, learners integer, passers integer, certificates integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
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