
-- Allow public read of profiles for public profile pages
CREATE POLICY "public profiles viewable" ON public.profiles FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "admins manage profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins view all certificates" ON public.certificates FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update certificates" ON public.certificates FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete certificates" ON public.certificates FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins view all courses" ON public.courses FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Allow inserting admin role for self via known unlock (handled in server fn with service role)
-- Add revoked flag
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS revoked boolean NOT NULL DEFAULT false;
