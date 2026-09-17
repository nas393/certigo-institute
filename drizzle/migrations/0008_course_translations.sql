CREATE TABLE public.course_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  lang TEXT NOT NULL CHECK (lang IN ('fr','es','pt','ar')),
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (certification_id, lang)
);

GRANT SELECT ON public.course_translations TO anon;
GRANT SELECT ON public.course_translations TO authenticated;
GRANT ALL ON public.course_translations TO service_role;

ALTER TABLE public.course_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Translations are public to read"
ON public.course_translations FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX course_translations_lookup ON public.course_translations (certification_id, lang);