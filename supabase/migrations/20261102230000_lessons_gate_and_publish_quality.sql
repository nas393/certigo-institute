-- 1) New courses start hidden.
ALTER TABLE public.certifications ALTER COLUMN published SET DEFAULT false;

-- 2) Quality rules a course must meet before it can be published.
CREATE OR REPLACE FUNCTION public.course_quality_issues(_id uuid)
RETURNS text[] LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE c certifications%ROWTYPE; issues text[] := '{}'; n_mod int; n_q int; n_keys int;
BEGIN
  SELECT * INTO c FROM certifications WHERE id = _id;
  IF c.id IS NULL THEN RETURN ARRAY['course not found']; END IF;
  n_mod := coalesce(jsonb_array_length(c.modules), 0);
  n_q := coalesce(jsonb_array_length(c.questions), 0);
  SELECT count(*) INTO n_keys FROM module_keys WHERE certification_id = c.id;
  IF n_mod < 6 THEN issues := issues || format('needs 6 lessons (has %s)', n_mod); END IF;
  IF n_q < 30 THEN issues := issues || format('needs a bank of 30 exam questions (has %s)', n_q); END IF;
  IF coalesce(jsonb_array_length(c.answer_keys), 0) <> n_q THEN issues := issues || 'exam answer keys do not match questions'; END IF;
  IF n_keys < n_mod THEN issues := issues || format('lesson checks have answers for %s of %s lessons', n_keys, n_mod); END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.questions,'[]')) q WHERE jsonb_array_length(q->'options') <> 4) THEN
    issues := issues || 'every exam question needs 4 options';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.modules,'[]')) m WHERE coalesce(m->>'learned','') = '' OR m->'check' IS NULL) THEN
    issues := issues || 'every lesson needs an outcome and a lesson check';
  END IF;
  IF length(coalesce(c.summary,'')) < 20 THEN issues := issues || 'summary too short'; END IF;
  RETURN issues;
END $$;

CREATE OR REPLACE FUNCTION public.enforce_publish_quality()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE issues text[];
BEGIN
  IF NEW.published AND (TG_OP = 'INSERT' OR NOT OLD.published) THEN
    IF TG_OP = 'INSERT' THEN RAISE EXCEPTION 'Create the course hidden, add its lessons and exam, then publish it.'; END IF;
    issues := public.course_quality_issues(NEW.id);
    IF array_length(issues, 1) > 0 THEN
      RAISE EXCEPTION 'Cannot publish yet: %', array_to_string(issues, '; ');
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER certifications_publish_quality BEFORE INSERT OR UPDATE OF published ON public.certifications
  FOR EACH ROW EXECUTE FUNCTION public.enforce_publish_quality();

-- 3) Lesson progress needed before the exam (lessons with a lesson check must be passed).
CREATE OR REPLACE FUNCTION public.lessons_remaining(_uid uuid, _cert uuid)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM module_keys k
   WHERE k.certification_id = _cert
     AND NOT EXISTS (SELECT 1 FROM lesson_progress p WHERE p.user_id = _uid AND p.certification_id = _cert
                       AND p.module_index = k.module_index AND p.correct)
$$;
REVOKE EXECUTE ON FUNCTION public.lessons_remaining(uuid, uuid), public.course_quality_issues(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.course_quality_issues(uuid) TO authenticated;

-- 4) start_exam: lessons first. The previous function becomes an internal step.
ALTER FUNCTION public.start_exam(uuid) RENAME TO start_exam_core;
REVOKE EXECUTE ON FUNCTION public.start_exam_core(uuid) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.start_exam(_certification_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _left int; _st jsonb;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  _st := public.exam_status(_certification_id);
  IF NOT (_st->>'certified')::boolean AND NOT public.has_role(_uid, 'admin'::public.app_role) THEN
    _left := public.lessons_remaining(_uid, _certification_id);
    IF _left > 0 THEN RETURN jsonb_build_object('status', 'lessons_required', 'remaining', _left); END IF;
  END IF;
  RETURN public.start_exam_core(_certification_id);
END $$;
REVOKE EXECUTE ON FUNCTION public.start_exam(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_exam(uuid) TO authenticated;
