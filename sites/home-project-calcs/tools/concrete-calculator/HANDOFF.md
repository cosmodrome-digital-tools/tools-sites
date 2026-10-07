# Handoff: concrete-calculator

## What was built
- Tool slug: concrete-calculator
- Tool name (meta.json "title"): Concrete Calculator (benefit: "Bags and Cubic Yards")
- What it calculates, in one sentence: Cubic feet and cubic yards of concrete (before and after a waste allowance) and the number of 40/50/60/80/90 lb premix bags to buy, for a rectangular slab/footing or a round column (Sonotube), using each manufacturer's data-sheet bag yield.
- Layout / chart style / accent chosen: `split` layout; `bar` chart (bags at 4/5/6/8 in thickness for the user's slab footprint, or at 8/12/16/24 in diameter for the user's column height; each bar label shows the bag count); "poured concrete" look: slate accent #334155 with white text, cool grey surface #eceef1, 4px corners, primary result shown as a dark slate bar. New hero.svg (bag + slab), decorative (`heroAlt: ""`).
- Unique addition: brand-yield comparison table (all three mixes, every size, bags per cubic yard) plus a common-slab-sizes table (4×4 to 24×24 at 4 in) so "how much concrete for a 12×12 slab" style queries are answered on one page.
- Inputs (brief section 7): shape (slab/column), quantity 1–50 (whole number), length 0.1–200 ft, width 0.1–200 ft, thickness 2–24 in, diameter 4–48 in, height 6–120 in, mix (Quikrete 1101 / Sakrete High-Strength / Quikrete Fast-Setting 1004), bag size 40/50/60/80/90 lb, waste 0–25 % (default 5).
- ui.js: beyond `bindCalculator`, it hides the size fieldset that doesn't apply to the chosen shape and disables bag sizes the chosen mix isn't sold in (switching to the closest sold size). The size list is imported from logic.js; no math in ui.js. logic.js also rejects a size/brand mismatch with a message on the Bag size field, so results stay correct without JavaScript-side filtering.

## Sources used
All three PDFs were opened and read on 2026-10-06; the yields in logic.js match them exactly.
- QUIKRETE Concrete Mix, Product No. 1101 data sheet: https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf (accessed 2026-10-06). Supports the yields 40 lb 0.30, 50 lb 0.375, 60 lb 0.45, 80 lb 0.60, 90 lb 0.675 cu ft (90 lb "regional availability"), and "2 in or more" pour thickness.
- Sakrete High-Strength Concrete Mix TDS: https://www.sakrete.com/wp-content/uploads/2024/01/Sakrete-High-Strength-Concrete-Mix-TDS.pdf (accessed 2026-10-06). Supports the yields 40 lb 0.30, 60 lb 0.45, 80 lb 0.6, 90 lb 0.66 cu ft; "2\"+" applications; "minimum of 4\" of concrete" for flatwork (used in the thickness help text).
- QUIKRETE Fast-Setting Concrete Mix, Product No. 1004 data sheet: https://www.quikrete.com/pdfs/data_sheet-fast%20setting%20concrete%20mix%201004-50.pdf (accessed 2026-10-06). Supports the yields 50 lb 0.375, 60 lb 0.45 cu ft (US sizes; the Canada-only 25/30 kg bags are left out), and "2 in or thicker".
- Formulas (L × W × T/12, π r² h, ÷ 27, round up) are standard geometry and unit conversion and use the shared calculator-core helpers.

## Test and build results
Run from the repo root on Windows, Node 22.14.0:
- `npm ci`: added 250 packages, audited 257 packages (npm reports 3 high-severity vulnerabilities in existing dependencies; nothing was installed or changed)
- `npm test`: all suites pass. Site suite: 2 files, 36 passed, 2 skipped (the skips are the _template scaffold guard). This tool: **29 passed (29)** in `logic.test.js`.
- `npm run build`: 8 page(s) built, `Complete!`
- `npm run check`: on Windows the script crashes before checking anything (`ERR_UNSUPPORTED_ESM_URL_SCHEME`; see Open questions). A copy kept outside the repo, with that single import made Windows-safe, reports `checks: 1 site(s), 0 failure(s), 2 warning(s)`. The 2 warnings are the expected placeholder domain and ads.txt ones.
- Known-answer cases (all hand math using the data-sheet yields):
  - 10 × 10 ft × 4 in, Quikrete 80 lb, 5 % waste: 33.33 cu ft → × 1.05 = 35.00 cu ft → ÷ 0.60 = 58.33 → **59 bags**, 1.23 / 1.30 cu yd, 4,720 lb (page.md worked example)
  - Same slab with 0 % waste: 55.56 → **56 bags**
  - 9 × 9 ft × 4 in = 27 cu ft = 1 cu yd: Quikrete 90 lb **40** (exact, no float bump), Sakrete 90 lb **41** (40.91), 80 lb **45**, Fast-Setting 50 lb **72**; with 5 % waste, 80 lb **48** (FAQ)
  - 12 in Sonotube × 36 in, 5 % waste: π × 0.5² × 3 = 2.356 cu ft → 2.474 → ÷ 0.6 = 4.12 → **5 bags**
  - 12 in Sonotube × 48 in, 0 % waste: 3.14 cu ft → 5.24 → **6 bags** (FAQ)
  - 12 × 12 ft × 4 in, 5 % waste: 50.4 cu ft → **84** × 80 lb / **112** × 60 lb (FAQ and sizes table)
  - Edge cases: zero, negative, very large, empty, non-numeric, fractional quantity, unknown shape/brand/size, brand/size mismatch, and both sides of every input's min/max limits.
- Also checked in a browser (local `astro preview` of the build): defaults show 59 bags; switching shape swaps the fieldsets; Fast-Setting disables 40/80/90 lb and moves to 60 lb; bad input shows a field error. At 375 px phone width the calculator starts above the fold and the page doesn't scroll sideways (wide tables scroll inside their own box).

## Open questions
- **Waste default (5 %)**: per the brief, there's no primary source for it. It's labeled on the page as "our starting estimate, not a manufacturer figure". Owner to confirm.
- **Frame limits**, to go to infra rather than workarounds:
  1. No collapsible "Advanced" accordion. Waste sits in its own last fieldset titled "Advanced: waste allowance" instead.
  2. No built-in conditional fields or per-option filtering. Handled in ui.js as described above. If the frame gains a `showWhen` option, ui.js could go back to the template.
  3. Results can only show numbers, not tables, so the per-brand "bags per yard for every size" table lives in page.md (static) rather than in the results area.
  4. The chart has no visible caption (`chartTitle` is only an aria-label), so bar labels include the bag count (e.g. `4" · 59`) and page.md explains the chart.
- **`npm run check` on Windows**: `scripts/checks/run.mjs` line 42 does `await import(cfgPath)` with a plain `C:\...` path, which Node rejects on Windows. `await import(pathToFileURL(cfgPath).href)` fixes it. CI on Linux is unaffected. Not changed (scripts/ is off-limits).
- **Internal links**: `relatedTools` lists rebar-calculator, fence-calculator, paver-patio-calculator, and gravel-calculator. They appear automatically once those tools exist. The page copy names the Fence Calculator for fence posts but doesn't hyperlink it yet, to avoid a 404. Add the link when that tool ships. The copy says the Fence Calculator "handles post-hole concrete", per the brief's overlap rule.
- **Left off as unverified (per brief section 14)**: bags per pallet and ready-mix truck capacity. The page says these aren't covered.
- **Thickness minimum**: resolved — raised to 2 in (data-sheet minimum). 1 in is rejected.
- **People Also Ask**: per the brief, FAQ questions come from the autocomplete list. PAA was not spot-checked in a browser.
- "Sonotube" is a trademark used generically, as in the brief.

## Dependency requests
None.
