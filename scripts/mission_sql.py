"""Print an upsert statement for one mission file: python3 scripts/mission_sql.py content-src/missions/<slug>.json [publish]
Missions are loaded unpublished unless 'publish' is given. The review block is stored with the mission."""
import json, sys
d = json.load(open(sys.argv[1])); pub = 'true' if 'publish' in sys.argv[2:] else 'false'
c = json.dumps(d['content'], ensure_ascii=False); r = json.dumps(d.get('review', {}), ensure_ascii=False)
assert '$m$' not in c + r
print(f"""INSERT INTO public.missions (certification_id, title, content, review, published, updated_at)
SELECT id, $m${d['title']}$m$, $m${c}$m$::jsonb, $m${r}$m$::jsonb, {pub}, now() FROM public.certifications WHERE slug = '{d['slug']}'
ON CONFLICT (certification_id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, review = EXCLUDED.review,
  published = EXCLUDED.published, updated_at = now()
RETURNING id, published;""")
