-- Certigo Missions: role-play scenarios that must be passed before the certification exam.
-- Additive. Inert until a mission row has published = true.
-- Content shape (missions.content, never exposed directly; only through the functions below):
-- {"role":"...","company":"...","briefing":"...","skills":{"code":"Label"},
--  "steps":[{"skill":"code","variants":[{"text":"situation","choices":[{"t":"choice","p":0|1|2,"f":"consequence"}]}]}]}
-- p: 2 = best, 1 = acceptable, 0 = poor. Score = points / (2 * steps) * 100.

CREATE TABLE IF NOT EXISTS public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id uuid NOT NULL UNIQUE REFERENCES public.certifications(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb NOT NULL,
  pass_score int NOT NULL DEFAULT 70 CHECK (pass_score BETWEEN 1 AND 100),
  published boolean NOT NULL DEFAULT false,
  review jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.missions FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.mission_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  picks int[] NOT NULL,            -- variant chosen per step
  orders jsonb NOT NULL,           -- shown position -> original choice index, per step
  answers jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{"c":orig,"p":points}] per answered step
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  score int,
  passed boolean,
  skills jsonb
);
CREATE INDEX IF NOT EXISTS mission_runs_user_idx ON public.mission_runs(user_id, mission_id, started_at DESC);
ALTER TABLE public.mission_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mission_runs FROM anon, authenticated;
DROP POLICY IF EXISTS mission_runs_own ON public.mission_runs;
CREATE POLICY mission_runs_own ON public.mission_runs FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON public.mission_runs TO authenticated;

ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS mission_score int;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS mission_skills jsonb;

-- Step payload for the player: situation + choices in shuffled order, no points or feedback.
CREATE OR REPLACE FUNCTION public._mission_step(_m public.missions, _r public.mission_runs, _i int)
RETURNS jsonb LANGUAGE sql STABLE SET search_path TO 'public' AS $$
  SELECT jsonb_build_object(
    'n', _i + 1,
    'total', jsonb_array_length(_m.content->'steps'),
    'skill', _m.content->'skills'->>(_m.content->'steps'->_i->>'skill'),
    'text', v->>'text',
    'choices', (SELECT jsonb_agg(v->'choices'->(o.val::int)->>'t' ORDER BY o.pos)
                FROM jsonb_array_elements_text(_r.orders->_i) WITH ORDINALITY AS o(val, pos)))
  FROM (SELECT _m.content->'steps'->_i->'variants'->(_r.picks[_i + 1]) AS v) s
$$;

-- Best passed run of the signed-in user for a certification (null if none).
CREATE OR REPLACE FUNCTION public._mission_best(_uid uuid, _cert uuid)
RETURNS public.mission_runs LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT r.* FROM public.mission_runs r JOIN public.missions m ON m.id = r.mission_id
  WHERE r.user_id = _uid AND m.certification_id = _cert AND r.passed
  ORDER BY r.score DESC, r.finished_at DESC LIMIT 1
$$;

-- Public facts about a course's mission (no answers). Works signed out.
CREATE OR REPLACE FUNCTION public.mission_info(_slug text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _uid uuid := auth.uid(); _m public.missions; _best public.mission_runs; _open uuid; _wait timestamptz;
BEGIN
  SELECT m.* INTO _m FROM public.missions m JOIN public.certifications c ON c.id = m.certification_id
   WHERE c.slug = _slug AND (m.published OR public.has_role(_uid, 'admin'::public.app_role));
  IF _m.id IS NULL THEN RETURN NULL; END IF;
  IF _uid IS NOT NULL THEN
    _best := public._mission_best(_uid, _m.certification_id);
    SELECT id INTO _open FROM public.mission_runs WHERE user_id = _uid AND mission_id = _m.id
      AND finished_at IS NULL AND started_at > now() - interval '24 hours' ORDER BY started_at DESC LIMIT 1;
    SELECT finished_at + interval '1 hour' INTO _wait FROM public.mission_runs WHERE user_id = _uid AND mission_id = _m.id
      AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1;
    IF _best.id IS NOT NULL OR _wait < now() THEN _wait := NULL; END IF;
  END IF;
  RETURN jsonb_build_object('title', _m.title, 'role', _m.content->>'role', 'company', _m.content->>'company',
    'briefing', _m.content->>'briefing', 'steps', jsonb_array_length(_m.content->'steps'),
    'skills', (SELECT jsonb_agg(value) FROM jsonb_each_text(_m.content->'skills')), 'pass_score', _m.pass_score,
    'published', _m.published, 'signed_in', _uid IS NOT NULL, 'resume', _open IS NOT NULL, 'next_allowed_at', _wait,
    'best', CASE WHEN _best.id IS NULL THEN NULL ELSE jsonb_build_object('score', _best.score, 'skills', _best.skills, 'at', _best.finished_at) END);
END $$;

-- Start (or resume) a run. Variants and choice order are picked here, on the server.
CREATE OR REPLACE FUNCTION public.start_mission(_slug text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _uid uuid := auth.uid(); _m public.missions; _r public.mission_runs; _n int; _i int;
  _picks int[] := '{}'; _orders jsonb := '[]'::jsonb; _nv int; _nc int; _wait timestamptz; _passed boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT m.* INTO _m FROM public.missions m JOIN public.certifications c ON c.id = m.certification_id
   WHERE c.slug = _slug AND (m.published OR public.has_role(_uid, 'admin'::public.app_role));
  IF _m.id IS NULL THEN RAISE EXCEPTION 'Mission not found'; END IF;
  SELECT * INTO _r FROM public.mission_runs WHERE user_id = _uid AND mission_id = _m.id
    AND finished_at IS NULL AND started_at > now() - interval '24 hours' ORDER BY started_at DESC LIMIT 1;
  IF _r.id IS NULL THEN
    -- one hour between failed runs; replays after passing are free practice
    _passed := public._mission_best(_uid, _m.certification_id) IS NOT NULL;
    SELECT finished_at + interval '1 hour' INTO _wait FROM public.mission_runs WHERE user_id = _uid AND mission_id = _m.id
      AND finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1;
    IF NOT _passed AND _wait > now() AND NOT public.has_role(_uid, 'admin'::public.app_role) THEN
      RETURN jsonb_build_object('status', 'wait', 'next_allowed_at', _wait);
    END IF;
    _n := jsonb_array_length(_m.content->'steps');
    FOR _i IN 0 .. _n - 1 LOOP
      _nv := jsonb_array_length(_m.content->'steps'->_i->'variants');
      _picks := _picks || floor(random() * _nv)::int;
      _nc := jsonb_array_length(_m.content->'steps'->_i->'variants'->(_picks[_i + 1])->'choices');
      _orders := _orders || jsonb_build_array((SELECT jsonb_agg(g ORDER BY random()) FROM generate_series(0, _nc - 1) g));
    END LOOP;
    INSERT INTO public.mission_runs (user_id, mission_id, picks, orders) VALUES (_uid, _m.id, _picks, _orders) RETURNING * INTO _r;
  END IF;
  RETURN jsonb_build_object('status', 'ok', 'run', _r.id, 'step', public._mission_step(_m, _r, jsonb_array_length(_r.answers)));
END $$;

-- Answer the current step. Answers are final. Returns the consequence and the next step or the result.
CREATE OR REPLACE FUNCTION public.answer_mission_step(_run uuid, _choice int)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _uid uuid := auth.uid(); _r public.mission_runs; _m public.missions; _i int; _n int; _orig int; _c jsonb;
  _pts int; _total int; _score int; _skills jsonb; _passed boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _r FROM public.mission_runs WHERE id = _run AND user_id = _uid FOR UPDATE;
  IF _r.id IS NULL OR _r.finished_at IS NOT NULL THEN RAISE EXCEPTION 'Run not found or already finished'; END IF;
  SELECT * INTO _m FROM public.missions WHERE id = _r.mission_id;
  _i := jsonb_array_length(_r.answers); _n := jsonb_array_length(_m.content->'steps');
  _orig := (_r.orders->_i->>_choice)::int;
  IF _orig IS NULL THEN RAISE EXCEPTION 'Invalid choice'; END IF;
  _c := _m.content->'steps'->_i->'variants'->(_r.picks[_i + 1])->'choices'->_orig;
  _pts := least(greatest(coalesce((_c->>'p')::int, 0), 0), 2);
  _r.answers := _r.answers || jsonb_build_array(jsonb_build_object('c', _orig, 'p', _pts));
  UPDATE public.mission_runs SET answers = _r.answers WHERE id = _r.id;
  IF _i + 1 < _n THEN
    RETURN jsonb_build_object('feedback', _c->>'f', 'points', _pts, 'next', public._mission_step(_m, _r, _i + 1));
  END IF;
  SELECT sum((a->>'p')::int) INTO _total FROM jsonb_array_elements(_r.answers) a;
  _score := round(_total::numeric / (2 * _n) * 100);
  _passed := _score >= _m.pass_score;
  SELECT jsonb_object_agg(lbl, pct) INTO _skills FROM (
    SELECT _m.content->'skills'->>(_m.content->'steps'->(k::int - 1)->>'skill') AS lbl,
           round(sum((a->>'p')::int)::numeric / (2 * count(*)) * 100) AS pct
    FROM jsonb_array_elements(_r.answers) WITH ORDINALITY AS t(a, k) GROUP BY 1) s;
  UPDATE public.mission_runs SET finished_at = now(), score = _score, passed = _passed, skills = _skills WHERE id = _r.id;
  RETURN jsonb_build_object('feedback', _c->>'f', 'points', _pts,
    'result', jsonb_build_object('score', _score, 'passed', _passed, 'pass_score', _m.pass_score, 'skills', _skills));
END $$;

-- Exam gate: a published mission must be passed before the exam (admins and already-certified users skip).
CREATE OR REPLACE FUNCTION public.start_exam(_certification_id uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
    IF EXISTS (SELECT 1 FROM public.missions m WHERE m.certification_id = _certification_id AND m.published)
       AND public._mission_best(_uid, _certification_id) IS NULL THEN
      RETURN jsonb_build_object('status', 'mission_required');
    END IF;
  END IF;
  RETURN public.start_exam_core(_certification_id);
END $function$;

-- Certificates keep the mission result (score + skill profile) of the best passed run.
CREATE OR REPLACE FUNCTION public.submit_exam(_session_id uuid, _answers jsonb, _recipient_name text)
 RETURNS TABLE(passed boolean, score integer, serial text)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid(); _s public.exam_sessions%ROWTYPE; _cert public.certifications%ROWTYPE;
  _total int; _correct int := 0; _k int; _qi int; _given int; _orig int; _score int; _passed boolean;
  _serial text; _orig_answers jsonb := '{}'::jsonb; _mr public.mission_runs;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _recipient_name IS NULL OR length(trim(_recipient_name)) = 0 OR length(_recipient_name) > 200 THEN
    RAISE EXCEPTION 'Invalid recipient name';
  END IF;
  SELECT * INTO _s FROM public.exam_sessions WHERE id = _session_id AND user_id = _uid FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Exam session not found'; END IF;
  IF _s.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'This exam was already submitted'; END IF;
  IF _s.expires_at < now() THEN RAISE EXCEPTION 'This exam session has expired. Start again.'; END IF;
  UPDATE public.exam_sessions SET submitted_at = now() WHERE id = _s.id;
  SELECT * INTO _cert FROM public.certifications WHERE id = _s.certification_id;
  _total := array_length(_s.q_order, 1);
  FOR _k IN 1 .. _total LOOP
    _qi := _s.q_order[_k];
    BEGIN
      _given := NULLIF(_answers->>((_k - 1)::text), '')::int;
      _orig := (_s.opt_orders->(_k - 1)->>_given)::int;
    EXCEPTION WHEN others THEN _orig := NULL; END;
    IF _orig IS NOT NULL THEN
      _orig_answers := _orig_answers || jsonb_build_object(_qi::text, _orig);
      IF _orig = (_cert.answer_keys->>_qi)::int THEN _correct := _correct + 1; END IF;
    END IF;
  END LOOP;
  _score := round((_correct::numeric / _total) * 100);
  _passed := _score >= coalesce(_cert.pass_score, 70);
  INSERT INTO public.attempts (user_id, certification_id, score, passed, answers)
    VALUES (_uid, _cert.id, _score, _passed, _orig_answers);
  INSERT INTO public.enrollments (user_id, certification_id) VALUES (_uid, _cert.id)
    ON CONFLICT (user_id, certification_id) DO NOTHING;
  IF NOT _passed THEN RETURN QUERY SELECT false, _score, NULL::text; RETURN; END IF;
  _mr := public._mission_best(_uid, _cert.id);
  SELECT c.serial INTO _serial FROM public.certificates c
   WHERE c.user_id = _uid AND c.certification_id = _cert.id AND c.revoked = false LIMIT 1;
  IF _serial IS NULL THEN
    _serial := public.issue_certificate_serial(_cert.slug);
    INSERT INTO public.certificates (serial, user_id, certification_id, recipient_name, score, price_cents, mission_score, mission_skills)
      VALUES (_serial, _uid, _cert.id, trim(_recipient_name), _score, coalesce(_cert.price_cents, 0), _mr.score, _mr.skills);
  END IF;
  RETURN QUERY SELECT true, _score, _serial;
END $function$;

REVOKE ALL ON FUNCTION public._mission_step(public.missions, public.mission_runs, int) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._mission_best(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mission_info(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_mission(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.answer_mission_step(uuid, int) TO authenticated;

-- Admin import from the bundled mission files (Admin > Missions > Import).
CREATE OR REPLACE FUNCTION public.admin_upsert_mission(_slug text, _title text, _content jsonb, _review jsonb, _publish boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _cid uuid; _n int; _bad int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'Admin only'; END IF;
  SELECT id INTO _cid FROM public.certifications WHERE slug = _slug;
  IF _cid IS NULL THEN RETURN jsonb_build_object('slug', _slug, 'ok', false, 'error', 'no such course'); END IF;
  _n := jsonb_array_length(_content->'steps');
  SELECT count(*) INTO _bad FROM jsonb_array_elements(_content->'steps') s, jsonb_array_elements(s->'variants') v
   WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(v->'choices') c WHERE (c->>'p')::int = 2)
      OR NOT (_content->'skills') ? (s->>'skill');
  IF _n < 8 OR _bad > 0 THEN RETURN jsonb_build_object('slug', _slug, 'ok', false, 'error', 'invalid mission content'); END IF;
  INSERT INTO public.missions (certification_id, title, content, review, published, updated_at)
  VALUES (_cid, _title, _content, _review, _publish, now())
  ON CONFLICT (certification_id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content,
    review = EXCLUDED.review, published = EXCLUDED.published, updated_at = now();
  RETURN jsonb_build_object('slug', _slug, 'ok', true, 'steps', _n, 'published', _publish);
END $$;
REVOKE ALL ON FUNCTION public.admin_upsert_mission(text, text, jsonb, jsonb, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_upsert_mission(text, text, jsonb, jsonb, boolean) TO authenticated;
