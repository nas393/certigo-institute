-- Snapshot taken on staging before the Batch 13 grading change (2026-11-03).
CREATE TABLE IF NOT EXISTS public.backup_20261103_batch13_modules AS
  SELECT id, slug, modules, now() AS backed_up_at FROM public.certifications
  WHERE id IN ('87a50063-c8ca-4d6f-8660-9e0c93e09c95','a0d1f9b3-a6cc-4df7-9d97-7f989ff915bb','b939e24c-806a-4925-901e-226d0fc6d146','bfb94e91-b45b-49a0-9a74-2ae77bcc7b60',
               'cad9b6ec-2941-4190-ba50-ef012794581f','cd329e2e-7fb4-4e94-8e55-737dfc29bf3f','d6b6a1f2-09e9-4911-8cd9-4977b7ba740a','e10e373f-cc9e-4f77-b766-e2c57d3c9d3a');
CREATE TABLE IF NOT EXISTS public.backup_20261103_module_keys AS SELECT k.*, now() AS backed_up_at FROM public.module_keys k;
CREATE TABLE IF NOT EXISTS public.backup_20261103_grade_fn AS
  SELECT pg_get_functiondef('public.grade_lesson_check(uuid,integer,integer)'::regprocedure) AS definition, now() AS backed_up_at;
ALTER TABLE public.backup_20261103_batch13_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_20261103_module_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_20261103_grade_fn ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.backup_20261103_batch13_modules, public.backup_20261103_module_keys, public.backup_20261103_grade_fn FROM anon, authenticated;
