-- CERTIGO standalone (off Lovable).
-- Only admins create or edit courses: remove the learner-owned course policies
-- that backed the removed "Generate it" feature.
DROP POLICY IF EXISTS "certifications insert own" ON public.certifications;
DROP POLICY IF EXISTS "certifications update own" ON public.certifications;

-- Users may edit their own display fields only; premium can't be self-granted.
REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT INSERT (user_id, display_name, headline, avatar_url, linkedin_url) ON public.profiles TO authenticated;
GRANT UPDATE (user_id, display_name, headline, avatar_url, linkedin_url, updated_at) ON public.profiles TO authenticated;
