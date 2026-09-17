-- Discount preview only needs to be callable by signed-in learners (buying requires sign-in).
REVOKE EXECUTE ON FUNCTION public.preview_discount(text, uuid) FROM anon;

-- Belt-and-braces: exam answer keys stay unreadable through the Data API.
REVOKE SELECT (answer_keys) ON public.certifications FROM anon, authenticated;