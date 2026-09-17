-- 1. Exam answer keys must never be readable by clients (column-level privileges)
REVOKE SELECT, INSERT, UPDATE ON public.certifications FROM anon;
REVOKE SELECT, INSERT, UPDATE ON public.certifications FROM authenticated;

GRANT SELECT (id, slug, title, issuer_name, category, summary, skills, question_count, pass_score, questions, created_at, created_by, modules, price_cents)
  ON public.certifications TO anon, authenticated;
GRANT INSERT (id, slug, title, issuer_name, category, summary, skills, question_count, pass_score, questions, created_at, created_by, modules, price_cents)
  ON public.certifications TO authenticated;
GRANT UPDATE (slug, title, issuer_name, category, summary, skills, question_count, pass_score, questions, created_by, modules, price_cents)
  ON public.certifications TO authenticated;
GRANT DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;

-- 2. Attempts may only be created by the secure grading routine, never by clients
REVOKE INSERT, UPDATE, DELETE ON public.attempts FROM anon, authenticated;
GRANT SELECT ON public.attempts TO authenticated;
GRANT ALL ON public.attempts TO service_role;

-- 3. Certificates are immutable from the client side
REVOKE INSERT, UPDATE, DELETE ON public.certificates FROM anon, authenticated;
GRANT SELECT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

-- 4. SECURITY DEFINER functions: default deny, then grant only where needed
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_course_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_course_results(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grade_and_issue(uuid, jsonb, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.grade_lesson_check(uuid, integer, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_record(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_serials(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_passport(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sample_certificate_serial() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_course_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_course_results(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grade_and_issue(uuid, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grade_lesson_check(uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_record(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_serials(text[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_passport(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sample_certificate_serial() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;