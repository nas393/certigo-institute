-- 1. Attempts: only the server-side grading function may write attempts
DROP POLICY IF EXISTS "attempts own insert" ON public.attempts;
REVOKE INSERT ON public.attempts FROM authenticated;
REVOKE INSERT ON public.attempts FROM anon;

-- 2. Certificates: issuance and mutation only via grade_and_issue (SECURITY DEFINER)
DROP POLICY IF EXISTS "certificates insert own validated" ON public.certificates;
DROP POLICY IF EXISTS "certificates update own" ON public.certificates;
REVOKE INSERT, UPDATE ON public.certificates FROM authenticated;
REVOKE INSERT, UPDATE ON public.certificates FROM anon;

-- 3. Certifications: hide exam answer keys from API roles (column-level grants)
REVOKE SELECT ON public.certifications FROM anon;
REVOKE SELECT ON public.certifications FROM authenticated;
GRANT SELECT (
  id, slug, title, issuer_name, category, summary, skills,
  question_count, pass_score, questions, created_at, created_by, modules, price_cents
) ON public.certifications TO anon;
GRANT SELECT (
  id, slug, title, issuer_name, category, summary, skills,
  question_count, pass_score, questions, created_at, created_by, modules, price_cents
) ON public.certifications TO authenticated;

-- 4. Tighten EXECUTE on SECURITY DEFINER functions that should not be public
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grade_and_issue(uuid, jsonb, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.grade_lesson_check(uuid, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_course_overview() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_course_results(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;