"""Quality gate for a helper-written course: lesson pack + db payload."""
import json, sys, collections, re
base = '/tmp/claude-0/-home-claude/693d9ac9-aa9d-5b35-b077-eaba7c4da07e/scratchpad/'
for slug in sys.argv[1:]:
    probs = []
    try:
        pack = json.load(open(f'{base}repos/certigo-institute/src/content/lessons/{slug}.json'))
        db = json.load(open(f'{base}content/{slug}.db.json'))
    except Exception as e:
        print(slug, 'MISSING', e); continue
    wc = [len(b.split()) for b in pack['bodies']]
    sc = [len(s) for s in pack.get('slides', [])]
    if len(wc) != 6: probs.append(f'{len(wc)} lessons')
    probs += [f'L{i+1} {w}w' for i, w in enumerate(wc) if not 1100 <= w <= 1500]
    probs += [f'L{i+1} {s} slides' for i, s in enumerate(sc) if not 6 <= s <= 8]
    need = ['## Learning objectives', '## Key terms', '## Worked example', '## Tool', '## Common mistakes', '## Self-check', '## Practical assignment', '## Summary']
    for i, b in enumerate(pack['bodies']):
        miss = [h for h in need if h not in b]
        if miss: probs.append(f'L{i+1} missing {miss}')
        blk = {k: b.count('::: ' + k) for k in ['terms', 'slides', 'diagram', 'case', 'quiz']}
        lack = [k for k, v in blk.items() if v < (2 if k == 'quiz' else 1)]
        if lack: probs.append(f'L{i+1} lacks blocks {lack}')
        for blkm in re.finditer(r'::: (case|quiz)[^\n]*\n(.*?)\n:::', b, re.S):
            stars = sum(1 for l in blkm.group(2).splitlines() if l.startswith('* '))
            if stars != 1: probs.append(f'L{i+1} {blkm.group(1)} has {stars} correct options')
    qs = db.get('questions', [])
    if len(qs) != 30: probs.append(f'{len(qs)} questions')
    per = collections.Counter(q.get('lesson') for q in qs)
    if any(per.get(l, 0) < 4 for l in range(1, 7)): probs.append(f'per-lesson {dict(per)}')
    bal = collections.Counter(q['a'] for q in qs)
    if bal and (max(bal.values()) > 10 or min(bal.get(k, 0) for k in range(4)) < 5): probs.append(f'answer balance {dict(bal)}')
    if any(len(q['options']) != 4 or len(set(q['options'])) != 4 for q in qs): probs.append('bad options')
    if any(re.search(r'all of the above|none of the above', ' '.join(q['options']), re.I) for q in qs): probs.append('all/none of the above')
    mods = db.get('modules', [])
    if len(mods) != 6: probs.append(f'{len(mods)} modules')
    print(slug, 'OK' if not probs else 'ISSUES', 'words', wc, 'slides', sc, 'answers', dict(sorted(bal.items())), probs)
