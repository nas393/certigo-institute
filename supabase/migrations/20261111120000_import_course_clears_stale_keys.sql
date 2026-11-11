-- import_course: validate and load a 6-lesson course; also removes lesson-check keys left over from a longer old version.
CREATE OR REPLACE FUNCTION public.import_course(p jsonb)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _slug text := p->>'slug'; _id uuid; _mods jsonb := p->'modules'; _qs jsonb := p->'questions';
        _clean_mods jsonb; _bank jsonb; _keys jsonb; i int; v_q jsonb; v_m jsonb; _new boolean := false;
BEGIN
  IF _slug IS NULL OR _slug !~ '^[a-z0-9-]{3,80}$' THEN RAISE EXCEPTION 'bad slug'; END IF;
  IF jsonb_typeof(_mods) <> 'array' OR jsonb_array_length(_mods) <> 6 THEN RAISE EXCEPTION 'need exactly 6 modules'; END IF;
  IF jsonb_typeof(_qs) <> 'array' OR jsonb_array_length(_qs) < 30 THEN RAISE EXCEPTION 'need at least 30 questions'; END IF;
  FOR v_q IN SELECT * FROM jsonb_array_elements(_qs) LOOP
    IF jsonb_array_length(v_q->'options') <> 4 OR (v_q->>'a')::int NOT BETWEEN 0 AND 3 OR coalesce(v_q->>'q','') = '' THEN
      RAISE EXCEPTION 'bad question: %', v_q->>'q';
    END IF;
  END LOOP;
  FOR v_m IN SELECT * FROM jsonb_array_elements(_mods) LOOP
    IF coalesce(v_m->>'title','') = '' OR jsonb_array_length(v_m->'check'->'options') <> 4 OR (v_m->'check'->>'a')::int NOT BETWEEN 0 AND 3 THEN
      RAISE EXCEPTION 'bad module: %', v_m->>'title';
    END IF;
  END LOOP;

  SELECT jsonb_agg(jsonb_build_object('title', e->>'title', 'subject', coalesce(e->>'subject',''), 'learned', coalesce(e->>'learned',''),
           'minutes', coalesce((e->>'minutes')::int, 20), 'skills', coalesce(e->'skills','[]'::jsonb),
           'check', jsonb_build_object('q', e->'check'->>'q', 'options', e->'check'->'options')) ORDER BY n)
    INTO _clean_mods FROM jsonb_array_elements(_mods) WITH ORDINALITY t(e, n);
  SELECT jsonb_agg(jsonb_build_object('q', e->>'q', 'options', e->'options') ORDER BY n), jsonb_agg((e->>'a')::int ORDER BY n)
    INTO _bank, _keys FROM jsonb_array_elements(_qs) WITH ORDINALITY t(e, n);

  SELECT id INTO _id FROM certifications WHERE slug = _slug;
  IF _id IS NULL THEN
    _new := true;
    INSERT INTO certifications (slug, title, category, summary, skills, question_count, pass_score, questions, answer_keys, modules, price_cents, published)
    VALUES (_slug, p->>'title', p->>'category', p->>'summary',
            ARRAY(SELECT jsonb_array_elements_text(coalesce(p->'skills','[]'::jsonb))), 15, 70, _bank, _keys, _clean_mods, 5000, false)
    RETURNING id INTO _id;
  ELSE
    UPDATE certifications SET
      questions_history = questions_history || jsonb_build_array(jsonb_build_object('replaced_at', now(), 'questions', questions, 'answer_keys', answer_keys, 'modules', modules)),
      title = coalesce(p->>'title', title), summary = coalesce(p->>'summary', summary),
      skills = CASE WHEN p ? 'skills' THEN ARRAY(SELECT jsonb_array_elements_text(p->'skills')) ELSE skills END,
      questions = _bank, answer_keys = _keys, modules = _clean_mods, question_count = 15, pass_score = 70
    WHERE id = _id;
  END IF;

  FOR i IN 0 .. 5 LOOP
    v_m := _mods->i;
    INSERT INTO module_keys (certification_id, module_index, answer_index, explanation)
    VALUES (_id, i, (v_m->'check'->>'a')::int, coalesce(v_m->'check'->>'explanation', ''))
    ON CONFLICT (certification_id, module_index) DO UPDATE SET answer_index = EXCLUDED.answer_index, explanation = EXCLUDED.explanation;
  END LOOP;
  -- Keys for lessons that no longer exist would block the exam forever.
  DELETE FROM module_keys WHERE certification_id = _id AND module_index > 5;
  RETURN CASE WHEN _new THEN 'created (unpublished): ' ELSE 'updated: ' END || _slug;
END $function$;
