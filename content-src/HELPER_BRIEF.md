# CERTIGO course-writing brief (follow exactly)

CERTIGO is an online certificate platform for working professionals, mainly in Angola (Luanda) and Portuguese-speaking Africa. Courses are written in clear, plain English (B2 level). Lessons are free; learners pay to sit the exam. The owner rejected an earlier version because it was "basic and not related": generic advice, no real concepts, not tied to the learner's workplace. Your course must TEACH: named concepts and methods, step-by-step procedures, real workplace examples, tools, and an exam that tests exactly what the lessons teach.

Gold-standard sample (match its structure, depth and tone): `/tmp/claude-0/-home-claude/693d9ac9-aa9d-5b35-b077-eaba7c4da07e/scratchpad/content/pmf-lesson1-v2.txt`

## Course shape
- Exactly 6 lessons. Each lesson body 1,150–1,400 words (count them).
- Each lesson has 6–8 slides that summarise it.
- Lesson time: 20 minutes each (reading + slides + exercise).

## Lesson body structure (use these headings, "## " prefix, each heading on its own line followed by a blank line)
1. `## Learning objectives` – "By the end of this lesson you will be able to:" + 3–4 bullets starting with a verb (explain, calculate, apply, choose…).
2. `## Key terms` – 4–6 bullets "Term: definition".
3. 2–4 numbered teaching sections (`## 1. …`) that teach real, named concepts, models, standards or methods (e.g. SMART, EOQ, ABC analysis, Kraljic matrix, hierarchy of controls, Incoterms® 2020). Explain how to apply each one, with steps. Include a small calculation where the topic allows (e.g. safety stock, reorder point, landed cost).
4. `## Worked example: …` – a realistic case set in an Angolan workplace (e.g. a food distributor in Luanda, a construction site in Benguela, a logistics company at Lobito port). Generic company descriptions only; never name real companies or people. Amounts in kwanzas (Kz) or USD.
5. `## Tool: …` – a checklist or fill-in template, as "- " bullets.
6. `## Common mistakes` – 3–5 bullets.
7. `## Self-check` – 3 questions, each followed by "(Answer: …)".
8. `## Practical assignment` – one task the learner can do at work this week.
9. `## Summary` – 3 bullets.

Formatting rules for the body: paragraphs separated by a blank line; bullets as lines starting "- " in their own block (no blank lines between bullets of one list); no bold/italics/markdown links; no tables.

## Accuracy rules (critical)
- Only use concepts, frameworks, standards and facts you are certain are real and correctly attributed. Name the originator only if certain (e.g. "Kraljic (1983)"). If unsure, describe the method without attribution.
- Never invent statistics, studies, laws, rates, prices, company names or quotes. Prefer timeless method over figures that change.
- Do not claim CERTIGO is accredited or equivalent to any professional certification.
- Angola-specific legal or tax figures: only if verified from an official or professional source via web search, and list them in your report as "needs expert review".

## Source file format (write to `/tmp/claude-0/-home-claude/693d9ac9-aa9d-5b35-b077-eaba7c4da07e/scratchpad/content/<slug>.txt`)
```
=== 20
SLIDE Slide title | point one; point two; point three | key point (optional)
SLIDE ...
BODY
## Learning objectives
...
=== 20
SLIDE ...
BODY
...
```
One `=== 20` block per lesson (6 blocks). Slide points are separated by ";" so do not use ";" inside a point. Do not use "|" anywhere except as the slide separator.

Then build and check the lesson pack:
`python3 /tmp/claude-0/-home-claude/693d9ac9-aa9d-5b35-b077-eaba7c4da07e/scratchpad/content/build_pack.py <txt path> <slug> /tmp/claude-0/-home-claude/693d9ac9-aa9d-5b35-b077-eaba7c4da07e/scratchpad/repos/certigo-institute/src/content/lessons/<slug>.json`
It prints word counts and slide counts per lesson. Fix and rebuild until every lesson is 1,150–1,400 words and has 6–8 slides.

## Database payload (write to `/tmp/claude-0/-home-claude/693d9ac9-aa9d-5b35-b077-eaba7c4da07e/scratchpad/content/<slug>.db.json`)
```json
{
  "slug": "...", "title": "...", "category": "...", "summary": "one sentence, max 20 words",
  "skills": ["4 to 6 short skill names"],
  "modules": [
    {"title": "lesson title", "subject": "short topic line", "learned": "one sentence: what the learner can do after this lesson",
     "minutes": 20, "skills": ["2-3 skills"],
     "check": {"q": "scenario question on this lesson", "options": ["A","B","C","D"], "a": 1, "explanation": "why the answer is right, 1-2 sentences"}}
  ],
  "questions": [
    {"lesson": 1, "q": "...", "options": ["...","...","...","..."], "a": 0}
  ]
}
```
- modules: exactly 6, in lesson order, titles identical to the lessons.
- questions: exactly 30, five per lesson, testing that lesson's objectives. Mostly short workplace scenarios ("A warehouse supervisor notices… What should she do first?"), some definitions or calculations. Exactly one clearly correct answer; three plausible wrong answers of similar length; no "all/none of the above"; do not repeat the self-check questions word for word. Spread correct answers evenly: about 7–8 each of a = 0, 1, 2, 3.
- Validate the JSON (e.g. `python3 -c "import json;json.load(open(path))"`) and check those counts with a short script.

## Import into the database
Use the Supabase tool `execute_sql` on project `yatkrfwgwubcrlnnpooc` with exactly one statement:
`select public.import_course($cj$<the full JSON from your .db.json>$cj$::jsonb);`
This is the ONLY database action you may take. Do not run any other SQL, migrations or writes. If the tool is unavailable or the call fails, do not try alternatives; say so in your report.

## Final report (max 120 words)
slug · word counts · slide counts · import result · the named frameworks/standards you used · anything that needs expert review.

## UPDATE (mandatory): interactive learning blocks inside every lesson
The owner wants learners to actually LEARN inside each lesson, not just read statements. Every lesson body must mix text with these interactive blocks (the site renders them as slides, diagrams, case decisions, quizzes and flip cards). Each block starts with a line `::: type ...` and ends with a line `:::`, separated from other content by blank lines. Inside blocks, no blank lines.

Required in EVERY lesson (minimum):
- 1 `::: terms` block replacing the bullet list under `## Key terms` (keep the heading).
- 1 `::: slides` block of 3–5 slides placed inside a teaching section to walk through a method step by step.
- 1 `::: diagram` block (steps, matrix, pyramid or cycle) visualising the main model or process.
- 1 `::: case` block: an interactive decision scenario set in an Angolan workplace (can be the worked example or an extra one), with 3–4 choices and feedback for each.
- 2 `::: quiz` blocks placed after teaching sections (quick checks with feedback; different from exam questions).
- Optional: `::: tip | Title` callouts.
The `## Self-check` section may stay as is. Keep total body 1,150–1,500 words including blocks.

Exact syntax:
```
::: terms
Hazard: anything with the potential to cause harm
Risk: the likelihood that harm occurs, combined with its severity
:::

::: slides
SLIDE Step 1: Identify hazards | Walk the area; Talk to workers; Check past incidents | Look before you assess
SLIDE Step 2: ... | ...; ... | ...
:::

::: diagram steps | The procurement process
Identify need: define what is required and why
Specify: write a clear specification
Source: find and compare suppliers
Order: issue the purchase order
Receive and pay: three-way match before payment
:::

::: diagram matrix | Kraljic matrix | Supply risk (low → high) | Profit impact (low → high)
Leverage: high impact, low risk – use competition
Strategic: high impact, high risk – build partnerships
Non-critical: low impact, low risk – simplify and automate
Bottleneck: low impact, high risk – secure supply
:::
(matrix: exactly 4 lines in this order: top-left, top-right, bottom-left, bottom-right; top row = high value on the vertical axis)

::: diagram pyramid | Hierarchy of controls
Elimination: remove the hazard completely
Substitution: replace with something less hazardous
Engineering controls: isolate people from the hazard
Administrative controls: change the way people work
PPE: protect the worker with equipment
:::
(pyramid: first line = top = most effective)

::: diagram cycle | Plan-Do-Check-Act
Plan: set objectives and plan changes
Do: carry out the plan
Check: measure results
Act: standardise or adjust
:::

::: case | Late delivery at the Viana warehouse
A short situation (2–4 sentences) with names and numbers.
? What should Paulo do first?
- An option that is wrong || Feedback explaining why not
* The best option || Feedback explaining why it is best
- Another wrong option || Feedback
:::

::: quiz
? A question on what was just taught
- Wrong answer || Why it is wrong
* Correct answer || Why it is right
- Wrong answer || Why it is wrong
:::

::: tip | Practical tip
One or two sentences.
:::
```
Rules: exactly one `*` (correct) option per case/quiz; use `||` to separate option text from feedback; do not use `|` or `;` inside slide points; do not use `||` anywhere else. Rebuild with build_pack.py after editing. If you already wrote your lessons, revise them now to add these blocks before importing; if you already imported, re-import after revising.
