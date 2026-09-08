-- Additive: course authoring + lesson modules + knowledge checks

ALTER TABLE public.certifications
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS modules jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE POLICY "certifications insert own" ON public.certifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "certifications update own" ON public.certifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

GRANT INSERT, UPDATE ON public.certifications TO authenticated;

-- Private answer keys for per-lesson knowledge checks (no anon/authenticated grants)
CREATE TABLE IF NOT EXISTS public.module_keys (
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  module_index integer NOT NULL,
  answer_index integer NOT NULL,
  explanation text NOT NULL DEFAULT '',
  PRIMARY KEY (certification_id, module_index)
);
GRANT ALL ON public.module_keys TO service_role;
ALTER TABLE public.module_keys ENABLE ROW LEVEL SECURITY;

-- Per-user lesson progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  module_index integer NOT NULL,
  correct boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, certification_id, module_index)
);
GRANT SELECT, INSERT, UPDATE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson progress select own" ON public.lesson_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "lesson progress insert own" ON public.lesson_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lesson progress update own" ON public.lesson_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Grade one lesson knowledge check and record progress
CREATE OR REPLACE FUNCTION public.grade_lesson_check(
  _certification_id uuid,
  _module_index integer,
  _choice integer
) RETURNS TABLE(correct boolean, correct_index integer, explanation text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  k RECORD;
  is_correct boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT mk.answer_index, mk.explanation INTO k
  FROM public.module_keys mk
  WHERE mk.certification_id = _certification_id AND mk.module_index = _module_index;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No knowledge check for this lesson';
  END IF;

  is_correct := (k.answer_index = _choice);

  INSERT INTO public.lesson_progress (user_id, certification_id, module_index, correct)
  VALUES (auth.uid(), _certification_id, _module_index, is_correct)
  ON CONFLICT (user_id, certification_id, module_index)
  DO UPDATE SET correct = public.lesson_progress.correct OR EXCLUDED.correct,
                created_at = now();

  RETURN QUERY SELECT is_correct, k.answer_index, k.explanation;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grade_lesson_check(uuid, integer, integer) TO authenticated;
