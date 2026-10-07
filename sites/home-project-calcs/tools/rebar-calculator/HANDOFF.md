# Handoff: rebar-calculator

## What was built
- Tool slug: rebar-calculator
- Tool name (meta.json "title"): Rebar Calculator (benefit: "Sticks, Weight, and Ties")
- What it calculates, in one sentence: For a rectangular slab or footing with a square rebar grid, it gives sticks to buy (lap-aware, with waste), a cut list per direction (bar count, run length, sticks), lap splices, purchase weight from CRSI unit weights, linear feet in place, tie points, and a chair estimate.
- Layout / chart style / accent chosen: `stepper` layout (4 steps: size, bar and spacing, advanced sticks/laps, advanced chairs/waste), `line` chart (sticks to buy at 12/16/18/24/36 in spacing), rust accent `#9a3412` on warm off-white `#faf6f2` with a faint grid pattern, square step badges, 2px radius, Trebuchet/system font. New `assets/hero.svg` (decorative rebar grid, under 1 KB, `heroAlt: ""`). Deliberately different from concrete-calculator (split / bar / slate).
- Unique addition: lap-aware cut list in the results, plus a "Bar size and weight reference" table and a stick-length tip in page.md.

## Sources used
- CRSI Product Catalog, Winter 2025 (Concrete Reinforcing Steel Institute), https://members.crsi.org/Common/Uploaded%20files/Promotional_and_Marketing/CRSI_Product_Catalog_2025-Winter.pdf, accessed 2026-10-06. Supports the fixed ASTM A615 unit weights (#3 0.376, #4 0.668, #5 1.043, #6 1.502 lb/ft) and the #3 to #5 nominal diameters.
  - Note: the brief lists this source as verified. The URL responds, but the PDF is over 10 MB and my fetch tool couldn't open it to re-read the table. The values match the standard ASTM A615 table. **Spot-check page/table in the PDF on intake.**
- No other sources. Every other default (spacing, cover, stick length, lap, chair spacing, waste) is a labeled assumption, per the brief's sections 6, 7, and 14.

## Test and build results
Run from the repo root on Windows, Node v22.14.0:
- `npm ci`: `added 250 packages, and audited 257 packages in 28s` (npm reports 3 high-severity audit findings in existing dependencies; not touched, per the no-install rule)
- `npm test`: site suite `Tests 62 passed | 2 skipped (64)`; this tool alone (`npx vitest run sites/home-project-calcs/tools/rebar-calculator`): `Tests 26 passed (26)`; packages and scripts suites all pass (`15 passed`, `8 passed`, node `pass 5 / fail 0`)
- `npm run build`: `9 page(s) built` ... `Complete!`
- `npm run check`: **crashes on Windows before running any checks** (`ERR_UNSUPPORTED_ESM_URL_SCHEME ... Received protocol 'c:'`). Cause: `scripts/checks/run.mjs` line 42 does `await import(cfgPath)` with a raw Windows path. That isn't my code and `scripts/` is off-limits, so I ran a patched copy from a temp folder (same checks; only the root path is fixed and the import uses `pathToFileURL`). Result: `checks: 1 site(s), 0 failure(s), 2 warning(s)`. The 2 warnings are the expected placeholder domain and ads.txt ones. On Linux CI the original script should run fine.
- Browser check (built site via `astro preview`): the worked example (24 x 12 ft) renders exactly the hand-math numbers. At 375 px phone width there's no horizontal scroll, and the form starts at about 546 px, so it's visible on the first screen.
- Known-answer cases (all hand math, written out in `logic.test.js` comments):
  1. Defaults 20 x 20 ft, #4 @ 18 in, 3 in cover, 20 ft sticks, 20 in lap, 48 in chairs, 5%: 14 + 14 bars, 30 sticks, 400.8 lb, 196 ties, 36 chairs.
  2. Worked example in page.md, 24 x 12 ft (other defaults): 9 lengthwise bars (2 sticks per run, 9 laps) and 17 widthwise bars, 29 then 31 sticks, 414.2 lb, 422 linear ft, 153 ties, 28 chairs.
  3. 10 x 10 ft, #3 @ 12 in, 2 in cover, 10 ft sticks, no lap, 0%: 22 sticks, 82.7 lb.
  4. 6 x 4 ft pad, #5 @ 12 in, 0%: short bars share sticks, 4 sticks, 83.4 lb.
  5. 100 x 2 ft footing, #6 @ 12 in, 24 in lap, 0%: 17 + 8 = 25 sticks, 15 laps, 751 lb.
  - Plus: helper tests, a chart test, zero/negative/very large/empty/non-numeric tests, a cover-too-big test, and accept/reject boundaries for all 8 numeric inputs and the bar-size select.

## How the math works (assumptions built into the formula)
- Bars per direction = ceil(span / spacing) + 1, where span = side x 12 - 2 x cover. Rounding up keeps the actual gap from ever being wider than the entered spacing.
- Each bar runs the full span (cover at both ends). There are no hooks, bends, corner bars, or dowels.
- Runs longer than a stick are lap-spliced: sticks per run n = ceil((run - lap) / (stick - lap)). Each run uses n - 1 full sticks plus one leftover piece, and leftover pieces are packed floor(stick / piece) per stick. Offcuts are **not** shared between the two directions, so counts lean slightly high.
- Waste % applies to sticks only, rounded up. Ties and chairs get no waste.
- Weight = sticks to buy x stick length x lb/ft. That's purchase weight, not just the steel left in the slab.
- Tie points = crossings only (lengthwise bars x widthwise bars). Lap splices are reported separately and the page says to tie them too.
- Chairs = a grid at chair spacing across the same usable spans (ceil + 1 each way).

## Open questions (decisions for Matthew)
1. **Unverified defaults shipped as editable inputs with warnings** (brief section 14): spacing 18 in, cover 3 in, stick 20 ft, lap 20 in, chair spacing 48 in, waste 5%. Every help text and the Assumptions section says they're assumptions. Keep these defaults, or do you want a verified source for any of them before launch (for example ACI 318 lap length or a residential slab spacing)?
2. **CRSI PDF spot-check**: please confirm the weights table in the linked PDF. My tool couldn't open the 10 MB file (see Sources).
3. **#6 diameter**: the brief didn't give #6's nominal diameter, so the select label and the page table say "see CRSI table" instead of a number. If you confirm it from the PDF, add it to the select label in meta.json and the table in page.md.
4. **"Advanced" inputs aren't collapsed.** The brief asks for a collapsed accordion. The shared frame has no collapse option, so the advanced inputs are grouped into steps 3 and 4 named "Advanced: ..." (same approach as concrete-calculator). A real collapsible group would be a separate infra change to `packages/layout`.
5. **Single-direction (footing) bars only:** the tool always draws a two-way grid. A footing with only lengthwise bars (no cross bars) isn't a separate mode; those users would read the lengthwise numbers only. Is a "one-way bars" option worth adding later?
6. **FAQ wording**: People Also Ask wasn't captured in the brief, so the FAQ uses its 6 autocomplete questions plus one on stick weight. The answers to "rebar spacing for 4 inch slab", "do you need rebar", "rebar depth", and "bundle count" deliberately don't give a number, because none was verified.
7. **Related tools**: meta.json lists concrete, gravel, and paver-patio. Only concrete-calculator exists right now; the frame shows only that link until the others are built.

## Anything Web Dev must fix on intake
- **Zip layout quirk:** the zip was made with PowerShell `Compress-Archive -Path sites/home-project-calcs/tools/rebar-calculator ...`, so it contains a top-level `rebar-calculator/` folder, **not** the full `sites/home-project-calcs/tools/` path the guide's `zip -r` command would keep. Unzip it into `sites/home-project-calcs/tools/`. (Windows PowerShell 5.1 may also write backslash path separators; if your unzip tool complains, extract with 7-Zip or PowerShell `Expand-Archive`.)
- Regenerate the page file: `npm run new-tool -- --site home-project-calcs --tool rebar-calculator --page-only`. The local `src/pages/rebar-calculator.astro` isn't in the zip.
- Optional infra follow-up (not done here, since it's off-limits): make `scripts/checks/run.mjs` Windows-safe by importing `pathToFileURL(cfgPath).href` instead of `cfgPath`.

## Dependency requests
- none
