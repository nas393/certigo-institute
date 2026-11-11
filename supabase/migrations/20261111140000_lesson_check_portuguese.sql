-- Portuguese explanations for lesson checks (still private: only sent after a correct answer).
ALTER TABLE public.module_keys ADD COLUMN IF NOT EXISTS explanation_pt text;

CREATE OR REPLACE FUNCTION public.grade_lesson_check(_certification_id uuid, _module_index integer, _choice integer, _lang text)
 RETURNS TABLE(correct boolean, correct_index integer, explanation text)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE k RECORD; is_correct boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT mk.answer_index, mk.explanation, mk.explanation_pt INTO k FROM public.module_keys mk
   WHERE mk.certification_id = _certification_id AND mk.module_index = _module_index;
  IF NOT FOUND THEN RAISE EXCEPTION 'No knowledge check for this lesson'; END IF;
  is_correct := (k.answer_index = _choice);
  INSERT INTO public.lesson_progress (user_id, certification_id, module_index, correct)
  VALUES (auth.uid(), _certification_id, _module_index, is_correct)
  ON CONFLICT (user_id, certification_id, module_index)
  DO UPDATE SET correct = public.lesson_progress.correct OR EXCLUDED.correct, created_at = now();
  RETURN QUERY SELECT is_correct, NULL::integer,
    CASE WHEN NOT is_correct THEN NULL WHEN _lang = 'pt' AND coalesce(k.explanation_pt, '') <> '' THEN k.explanation_pt ELSE k.explanation END;
END $function$;
REVOKE EXECUTE ON FUNCTION public.grade_lesson_check(uuid, integer, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grade_lesson_check(uuid, integer, integer, text) TO authenticated;
