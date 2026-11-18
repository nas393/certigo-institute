"""Validate mission files: python3 scripts/check_mission.py content-src/missions/*.json"""
import json, sys
bad = 0
for p in sys.argv[1:]:
    d = json.load(open(p)); c = d["content"]; S = c["steps"]; errs = []
    if not 8 <= len(S) <= 12: errs.append(f"{len(S)} steps")
    for i, s in enumerate(S):
        if s["skill"] not in c["skills"]: errs.append(f"step {i+1}: unknown skill")
        for j, v in enumerate(s["variants"]):
            ch = v["choices"]; pts = [x["p"] for x in ch]
            if pts.count(2) != 1 or len(ch) < 3: errs.append(f"step {i+1}.{j+1}: needs 3+ choices and exactly one best")
            L = [len(x["t"]) for x in ch]; b = pts.index(2) if 2 in pts else 0
            if L[b] == max(L) and max(L) - sorted(L)[-2] > 15: errs.append(f"step {i+1}.{j+1}: best answer is clearly longest")
    rv = d.get("review", {})
    print(("OK  " if not errs else "FIX ") + p.split("/")[-1], f"steps={len(S)} review={rv.get('score_pct')}", "; ".join(errs))
    bad += bool(errs)
sys.exit(1 if bad else 0)
