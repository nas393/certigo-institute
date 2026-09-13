-- 1) Stop public/authenticated reads of the exam answer keys column.
-- Table-level SELECT covers all columns, so replace it with an explicit
-- column list that excludes answer_keys. The SECURITY DEFINER grading
-- functions run as the function owner and keep full access.
REVOKE SELECT ON public.certifications FROM anon, authenticated;
GRANT SELECT (id, slug, title, issuer_name, category, summary, skills,
              question_count, pass_score, questions, created_at,
              created_by, modules, price_cents)
  ON public.certifications TO anon, authenticated;

-- 2) handle_new_user is a trigger function only; no role should call it
-- directly through the API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- 3) sample_certificate_serial exposes a real certificate serial to anyone;
-- it is not needed by any client. Restrict it to the service role.
REVOKE EXECUTE ON FUNCTION public.sample_certificate_serial() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sample_certificate_serial() TO service_role;

-- 4) Administrative overview functions must only run for signed-in users;
-- they already re-check the admin role internally.
REVOKE EXECUTE ON FUNCTION public.admin_course_overview() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.admin_course_results(uuid) FROM public, anon;

-- 5) Grading functions must never be callable anonymously; they re-check
-- auth.uid() internally as well.
REVOKE EXECUTE ON FUNCTION public.grade_and_issue(uuid, jsonb, text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.grade_lesson_check(uuid, integer, integer) FROM public, anon;