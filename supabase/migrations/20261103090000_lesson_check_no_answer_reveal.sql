-- Batch 13 security fix (grading part of the supplied staging package only).
-- grade_lesson_check never reveals the right answer: correct_index is always NULL (column kept so the
-- signature stays compatible without a DROP), and the explanation is only returned after a correct answer.
-- Content of the 8 Batch 13 courses was NOT changed (owner decision 2026-11-03).
-- Backups taken first: backup_20261103_batch13_modules, backup_20261103_module_keys, backup_20261103_grade_fn.
CREATE OR REPLACE FUNCTION public.grade_lesson_check(_certification_id uuid, _module_index integer, _choice integer)
RETURNS TABLE(correct boolean, correct_index integer, explanation text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE k RECORD; is_correct boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT mk.answer_index, mk.explanation INTO k FROM public.module_keys mk
   WHERE mk.certification_id = _certification_id AND mk.module_index = _module_index;
  IF NOT FOUND THEN RAISE EXCEPTION 'No knowledge check for this lesson'; END IF;
  is_correct := (k.answer_index = _choice);
  INSERT INTO public.lesson_progress (user_id, certification_id, module_index, correct)
  VALUES (auth.uid(), _certification_id, _module_index, is_correct)
  ON CONFLICT (user_id, certification_id, module_index)
  DO UPDATE SET correct = public.lesson_progress.correct OR EXCLUDED.correct, created_at = now();
  RETURN QUERY SELECT is_correct, NULL::integer, CASE WHEN is_correct THEN k.explanation ELSE NULL END;
END $$;
REVOKE EXECUTE ON FUNCTION public.grade_lesson_check(uuid, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grade_lesson_check(uuid, integer, integer) TO authenticated;

-- Defence in depth: browser roles get no table access to private lesson-check answers (RLS already returns 0 rows).
REVOKE ALL ON public.module_keys FROM anon, authenticated;

-- start_exam: check the course is visible to this user before anything else (hidden courses reveal nothing).
CREATE OR REPLACE FUNCTION public.start_exam(_certification_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _left int; _st jsonb; _ok boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT (c.published OR public.has_role(_uid, 'admin'::public.app_role)
          OR EXISTS (SELECT 1 FROM enrollments e WHERE e.user_id = _uid AND e.certification_id = c.id))
    INTO _ok FROM certifications c WHERE c.id = _certification_id;
  IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'Certification not found'; END IF;
  _st := public.exam_status(_certification_id);
  IF NOT (_st->>'certified')::boolean AND NOT public.has_role(_uid, 'admin'::public.app_role) THEN
    _left := public.lessons_remaining(_uid, _certification_id);
    IF _left > 0 THEN RETURN jsonb_build_object('status', 'lessons_required', 'remaining', _left); END IF;
  END IF;
  RETURN public.start_exam_core(_certification_id);
END $$;
REVOKE EXECUTE ON FUNCTION public.start_exam(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_exam(uuid) TO authenticated;
