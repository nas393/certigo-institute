
-- 1. Wipe old schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.course_progress CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- 2. profiles
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  headline text,
  avatar_url text,
  linkedin_url text,
  premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 3. certifications (public catalog)
CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  issuer_name text NOT NULL DEFAULT 'CERTIGO.',
  category text NOT NULL,
  summary text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  question_count int NOT NULL DEFAULT 8,
  pass_score int NOT NULL DEFAULT 70,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certifications TO anon;
GRANT SELECT ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certifications public read" ON public.certifications FOR SELECT USING (true);

-- 4. attempts
CREATE TABLE public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  score int NOT NULL,
  passed boolean NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.attempts TO authenticated;
GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts own select" ON public.attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attempts own insert" ON public.attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. certificates
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES public.certifications(id),
  recipient_name text NOT NULL,
  score int NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certificates public verify" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "certificates insert own" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "certificates update own" ON public.certificates FOR UPDATE USING (auth.uid() = user_id);

-- 6. new-user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name',
             NEW.raw_user_meta_data->>'full_name',
             split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Seed certifications
INSERT INTO public.certifications (slug, title, category, summary, skills, questions) VALUES
('product-management-foundations', 'Product Management Foundations', 'Product',
 'Prove you can frame problems, prioritise, and ship outcomes.',
 ARRAY['Discovery','Prioritisation','Roadmapping','Stakeholders','Metrics'],
 '[
   {"q":"Which metric best reflects activation?","options":["MAU","Time-to-first-value","NPS","Churn"],"answer":1},
   {"q":"RICE stands for?","options":["Reach Impact Confidence Effort","Risk Iteration Cost Estimate","Revenue Index Cost Equity","Reach Index Cycle Effort"],"answer":0},
   {"q":"A North Star metric should be?","options":["A vanity number","Tied to user value","A revenue figure only","Set by finance"],"answer":1},
   {"q":"Best tool for opportunity sizing?","options":["Gantt chart","Opportunity tree","Burndown","Kanban"],"answer":1},
   {"q":"MVP primarily exists to?","options":["Ship fast","Validate a hypothesis","Reduce scope","Impress execs"],"answer":1},
   {"q":"Who owns the why?","options":["Engineering","Design","Product","Sales"],"answer":2},
   {"q":"A good user story includes?","options":["Tech stack","Acceptance criteria","Estimates only","Bug list"],"answer":1},
   {"q":"Discovery should happen?","options":["Once a quarter","Continuously","Only at kickoff","After launch"],"answer":1}
 ]'::jsonb),
('prompt-engineering-essentials','Prompt Engineering Essentials','AI',
 'Demonstrate fluency designing prompts and evaluating LLM output.',
 ARRAY['Prompting','Chain-of-thought','RAG','Evals','Guardrails'],
 '[
   {"q":"Few-shot prompting means?","options":["No examples","A handful of examples","Fine-tuning","Tool use"],"answer":1},
   {"q":"RAG addresses?","options":["Latency","Stale knowledge","Tokenisation","UI"],"answer":1},
   {"q":"Temperature 0 yields?","options":["Random","Deterministic","Creative","Faster"],"answer":1},
   {"q":"System prompts are for?","options":["User intent","Model behaviour","Logging","Pricing"],"answer":1},
   {"q":"Best eval for summarisation?","options":["BLEU","Rubric + LLM judge","Click-through","CPU time"],"answer":1},
   {"q":"Chain-of-thought helps with?","options":["Speed","Multi-step reasoning","Costs","Caching"],"answer":1},
   {"q":"Prompt injection mitigation?","options":["Allow everything","Strict input separation","Higher temperature","More tokens"],"answer":1},
   {"q":"Token limits affect?","options":["Latency only","Context window","Pricing only","Embedding size"],"answer":1}
 ]'::jsonb),
('data-literacy','Data Literacy','Data',
 'Read charts critically, choose the right metric, and avoid the common traps.',
 ARRAY['Statistics','Visualisation','SQL basics','Causation'],
 '[
   {"q":"Correlation implies?","options":["Causation","Nothing about causation","Random","Bias"],"answer":1},
   {"q":"Median is preferred when?","options":["Symmetric data","Skewed data","Tiny samples","Constants"],"answer":1},
   {"q":"A/B test needs?","options":["Random assignment","Big budget","Long history","Many variants"],"answer":0},
   {"q":"Cohort analysis groups by?","options":["Color","Shared event time","Country","Plan"],"answer":1},
   {"q":"P-value < 0.05 means?","options":["Truth","Unlikely under H0","Effect is big","Causation"],"answer":1},
   {"q":"Best chart for trend?","options":["Pie","Line","Donut","Treemap"],"answer":1},
   {"q":"SELECT * is bad because?","options":["Slow + unstable","Looks ugly","Not SQL","Forbidden"],"answer":0},
   {"q":"Survivorship bias?","options":["Only winners measured","Random","Sampling","Skew"],"answer":0}
 ]'::jsonb),
('agile-delivery','Agile Delivery','Engineering',
 'Run a focused team with short cycles, clear scope, and honest retros.',
 ARRAY['Scrum','Kanban','Retros','Estimation','Flow'],
 '[
   {"q":"WIP limits aim to?","options":["Increase load","Improve flow","Reduce quality","Hide work"],"answer":1},
   {"q":"Sprint length is typically?","options":["1 day","1-4 weeks","6 months","1 year"],"answer":1},
   {"q":"Retro outcome?","options":["Blame","Action items","Status report","Demo"],"answer":1},
   {"q":"Story points measure?","options":["Hours","Relative effort","Money","Lines of code"],"answer":1},
   {"q":"Definition of Done is?","options":["Optional","Shared agreement","Per dev","Sales-driven"],"answer":1},
   {"q":"Kanban focuses on?","options":["Sprints","Continuous flow","Estimates","Velocity"],"answer":1},
   {"q":"Backlog refinement?","options":["Once","Ongoing","Never","Quarterly"],"answer":1},
   {"q":"Best velocity use?","options":["Compare teams","Forecast same team","Bonuses","Hiring"],"answer":1}
 ]'::jsonb),
('ux-research-methods','UX Research Methods','Design',
 'Pick the right method, talk to users, and avoid leading questions.',
 ARRAY['Interviews','Usability','Surveys','Synthesis'],
 '[
   {"q":"Best for attitudes at scale?","options":["Interview","Survey","Diary","A/B"],"answer":1},
   {"q":"Usability test ideal n?","options":["1","5-8","50","500"],"answer":1},
   {"q":"Leading question?","options":["Open","Loaded with assumption","Closed","Short"],"answer":1},
   {"q":"Best for behaviour?","options":["Survey","Observation","Focus group","Poll"],"answer":1},
   {"q":"Affinity diagrams?","options":["Estimate cost","Cluster insights","Plan sprint","Pitch idea"],"answer":1},
   {"q":"JTBD focuses on?","options":["Persona","Job context","Demographics","Funnels"],"answer":1},
   {"q":"Recruit screener purpose?","options":["Sales","Match criteria","Hire","Pay"],"answer":1},
   {"q":"Insight vs observation?","options":["Same","Insight = meaning","Observation > insight","Neither"],"answer":1}
 ]'::jsonb),
('cloud-fundamentals','Cloud Fundamentals','Engineering',
 'Understand core cloud building blocks and the shared responsibility model.',
 ARRAY['IaaS/PaaS/SaaS','Networking','Identity','Cost'],
 '[
   {"q":"S3 / Blob storage is?","options":["Block","Object","File","Tape"],"answer":1},
   {"q":"IAM least privilege?","options":["Give all","Minimum needed","Per env","Per CEO"],"answer":1},
   {"q":"Region vs AZ?","options":["Same","Region groups AZs","AZ groups regions","Both VMs"],"answer":1},
   {"q":"Serverless implies?","options":["No servers","No server management","Free","Slower"],"answer":1},
   {"q":"VPC provides?","options":["Storage","Isolated network","DNS only","Email"],"answer":1},
   {"q":"Shared responsibility means?","options":["All cloud","All you","Split between you and provider","DevOps only"],"answer":2},
   {"q":"Spot instances?","options":["Premium","Cheaper, interruptible","Reserved","Free"],"answer":1},
   {"q":"CDN reduces?","options":["Storage","Latency","Costs only","Bandwidth always"],"answer":1}
 ]'::jsonb);
