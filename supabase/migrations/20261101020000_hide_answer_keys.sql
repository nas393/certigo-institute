-- Exam answer keys were readable by anyone through the public catalogue policy.
-- Grading runs in SECURITY DEFINER functions, so browsers never need this column.
REVOKE SELECT ON public.certifications FROM anon, authenticated;
GRANT SELECT (id, slug, title, issuer_name, category, summary, skills, question_count, pass_score, questions, created_at, created_by, modules, price_cents)
  ON public.certifications TO anon, authenticated;
