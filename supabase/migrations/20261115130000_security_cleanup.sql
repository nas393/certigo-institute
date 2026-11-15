-- HQ security cleanup 2026-11-15. Reversible; nothing deleted.
-- 1. Old Lovable no-op trigger function: pin search_path (advisor 0011).
ALTER FUNCTION kredo_old.handle_new_user() SET search_path = '';

-- 2. Admin RPCs: anonymous visitors never need them (they already refuse non-admins inside).
REVOKE EXECUTE ON FUNCTION public.admin_bulk_set_price(text, integer)            FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_course_overview()                         FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_course_results(uuid)                      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_overview_stats()                          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_certificate_revoked(text, boolean)    FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_bulk_set_price(text, integer)            TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.admin_course_overview()                         TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.admin_course_results(uuid)                      TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.admin_overview_stats()                          TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.admin_set_certificate_revoked(text, boolean)    TO authenticated, service_role;

-- 3. Trigger-only functions must not be callable over the API (triggers still fire).
REVOKE EXECUTE ON FUNCTION public.handle_new_user()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_publish_quality() FROM PUBLIC, anon, authenticated;

-- 4. Nov 3 backup tables: move out of the API-exposed public schema instead of dropping.
CREATE SCHEMA IF NOT EXISTS archive;
REVOKE ALL ON SCHEMA archive FROM PUBLIC, anon, authenticated;
ALTER TABLE public.backup_20261103_batch13_modules SET SCHEMA archive;
ALTER TABLE public.backup_20261103_grade_fn        SET SCHEMA archive;
ALTER TABLE public.backup_20261103_module_keys     SET SCHEMA archive;
