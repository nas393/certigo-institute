"""Turns a lesson source file (=== minutes / SLIDE title | p; p; p | takeaway / BODY ...) into a lesson pack JSON."""
import json, sys
src, slug, out = sys.argv[1], sys.argv[2], sys.argv[3]
lessons = [l for l in open(src, encoding='utf-8').read().split('=== ') if l.strip()]
pack = {"slug": slug, "minutes": [], "bodies": [], "slides": []}
for l in lessons:
    head, rest = l.split('\n', 1)
    slides_part, body = rest.split('BODY\n', 1)
    slides = []
    for line in slides_part.strip().splitlines():
        if not line.startswith('SLIDE '): continue
        t, pts, *tk = [x.strip() for x in line[6:].split('|')]
        slides.append({"title": t, "points": [p.strip() for p in pts.split(';') if p.strip()], **({"takeaway": tk[0]} if tk and tk[0] else {})})
    pack["minutes"].append(int(head.strip()))
    pack["bodies"].append(body.strip())
    pack["slides"].append(slides)
json.dump(pack, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(slug, [len(b.split()) for b in pack["bodies"]], [len(s) for s in pack["slides"]])
