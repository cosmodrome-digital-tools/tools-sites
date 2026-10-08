# Handoff: roof-pitch-calculator

## What was built
- Tool slug: roof-pitch-calculator
- Tool name (meta.json "title"): Roof Pitch Calculator (benefit: "Pitch to Degrees", so the full title is "Roof Pitch Calculator - Pitch to Degrees | Home & Yard Calcs", exactly 60 characters). Category: Roofing.
- What it calculates, in one sentence: From a measured rise and run, an angle, or the rise over a 12 in run, it gives pitch as x/12, angle in degrees, percent slope, the area multiplier, rafter length per foot of run, and (optionally) sloped roof area from the footprint, plus a 2024 IRC asphalt-shingle slope note.
- Layout / chart style / accent chosen: `split` layout with a `line` chart (the unused pair). **Accent changed on intake (see "Web Dev intake" below):** plum `#7e1f86` on pale plum `#fbf5fb`, ink `#2a1029`, border `#8b5a8e` (builder delivered violet `#6b21a8` / `#f8f4fc` / `#241430` / `#7c5a99`). Amber `#b45309` second chart color, 6px corners, Rockwell slab-serif system font stack (`Rockwell, "Rockwell Nova", "Roboto Slab", "Bookman Old Style", Georgia, serif`; unused by other tools). The main result has a small gable (roof-peak) shape over it. Decorative `assets/hero.svg` (gable roof with a dashed rise/run triangle, under 1 KB, `heroAlt: ""`).
- Contrast (WCAG AA, after the intake change): white on `#7e1f86` = 8.65:1; `#7e1f86` on `#fbf5fb` = 8.06:1; `#2a1029` on `#fbf5fb` = 16.23:1; border `#8b5a8e` on `#fbf5fb` = 4.95:1; slope-note borders `#b45309` on `#fff7ed` = 4.73:1 and `#b91c1c` on `#fef2f2` = 5.91:1.
- Chart: angle in degrees at 1/12 through 12/12 (labels "1" to "12"). It's the same for every input, a visual version of the reference table.
- Unique addition: an always-visible "Roof pitch reference chart: 1/12 to 12/12" H2 table in page.md (angle, percent, multiplier), plus the IRC slope note under the results. A test checks every table row against `logic.js`.
- `ui.js` adds two display helpers (no math): (1) it shows only the fields for the chosen mode (same pattern as paver-patio-calculator); (2) it adds a `<p class="roof-slope-note">` under the results list and fills it with the note text that `logic.js` returns (`slopeNote` / `slopeBand`, returned next to `results`, not as a form output). Without JavaScript all fields show, and `logic.js` validates only the fields for the chosen mode either way.

## Zip and layout quirks
- Zip: `roof-pitch-calculator.zip` in the repo root (`C:\Users\matth_uq2w7e7\OneDrive\Desktop\GrokBot Websites\tools-sites-scaffold\roof-pitch-calculator.zip`).
- Made with PowerShell `Compress-Archive -Path sites/home-project-calcs/tools/roof-pitch-calculator`, so the zip holds a top-level `roof-pitch-calculator/` folder, **not** the full `sites/home-project-calcs/tools/` path. Unzip it into `sites/home-project-calcs/tools/`. Windows PowerShell 5.1 may write backslash separators; use 7-Zip or `Expand-Archive` if `unzip` complains.
- Regenerate the page file: `npm run new-tool -- --site home-project-calcs --tool roof-pitch-calculator --page-only`.

## Sources used
- **2024 International Residential Code, Chapter 9 Roof Assemblies** as published on UpCodes under "GSA Residential Code 2024" (shown as adopting IRC 2024 without amendments), https://up.codes/viewer/general-services-administration/irc-2024/chapter/9/roof-assemblies, accessed 2026-10-07. I read the page text. It supports:
  - R905.2.2: asphalt shingles only on slopes of 2 units vertical in 12 horizontal (17-percent slope) or greater.
  - Table R905.1.1(2): for asphalt shingles on slopes from 2:12 up to 4:12, two layers of underlayment.
  - Also confirms the percent wording used on the page (2/12 = "17-percent", 4/12 = "33-percent").
  - ICC's own 2024 IRC page (codes.iccsafe.org) returned HTTP 403 to my fetch, so I couldn't read it directly; UpCodes is the verified copy.
- **OSHA Fall Prevention Campaign**, https://www.osha.gov/stop-falls, accessed 2026-10-07. Supports the fall-hazard note ("falls are the leading cause of death in construction").
- The pitch, angle, percent, multiplier, and rafter-length formulas are standard right-triangle trigonometry; no outside figure is used.

## Test and build results
Run from the repo root on Windows, Node v22.14.0, on `main` at `df2b8e5` after `git pull`:
- `npm ci`: completed; npm reported existing audit findings in shared dependencies (not touched).
- `npm test`: `Tests 1 failed | 290 passed | 2 skipped (293)`. This tool alone (`npx vitest run tools/roof-pitch-calculator` from the site folder): `Tests 32 passed (32)`.
  - **The 1 failure is expected and not fixable from the tool folder:** `src/titles.test.js > has an approved title for every tool on the site`. That file lists Content & SEO's approved title per tool and doesn't have `roof-pitch-calculator` yet. See "Anything Web Dev must fix on intake".
- `npm run build`: `16 page(s) built` ... `Complete!`. Built `<title>`: `Roof Pitch Calculator - Pitch to Degrees | Home &amp; Yard Calcs`.
- `npm run check`: `checks: 1 site(s), 0 failure(s), 2 warning(s)`. Both warnings are the expected placeholder domain and ads.txt. (No Windows crash; the #4 fix is on main.)
- Browser check (built site via `astro preview`): defaults show 6 / 12, 26.57 degrees, 50%, 1.118, 13.42 in, roof area "–", and the 4/12-or-steeper note. Switching to "Rise over a 12 in run" shows only that field; 3/12 with 1,500 sq ft gives 14.04 degrees, 25%, 1.031, 1,546.2 sq ft, and the amber two-layer underlayment note. Angle 8 degrees gives 1.69/12 and the red below-2/12 note. 36 in over 2 in shows the "steeper than 75 degrees" error and hides the note. The chart draws 12 points. At 375 px phone width there's no horizontal scroll, and the calculator frame starts at 471 px, inside the first screen (812 px).
- Known-answer cases (all hand math, written in the test names):
  1. 6 in over 12 in: 6/12, 26.57 degrees (atan 0.5), 50%, M 1.118 (sqrt 1.25), 13.42 in.
  2. page.md worked example: 7.5 in over 18 in with 1,680 sq ft: 5/12, 22.62 degrees, 41.7%, M 1.083 (5-12-13 triangle, 13/12), 13.00 in, 1,820 sq ft.
  3. 12/12: 45 degrees, 100%, M 1.414 (sqrt 2), 16.97 in.
  4. Angle 30 degrees: 6.93/12 (12 tan 30), 57.7%, M 1.155 (1/cos 30).
  5. 4/12 with 2,000 sq ft: 18.43 degrees, 33.3%, 2,108.2 sq ft. Also 3 in over 8 in = 4.5/12, and the page tip (2,000 sq ft at 6/12 = 2,236 sq ft).
  - Plus: all three modes agree for the same roof, the reference table (and every page.md table row), chart contents, IRC bands at 1.99 / 2 / 3.99 / 4, zero/negative/very large/empty/non-numeric/unknown-mode cases, hidden-field values ignored, comma input, and just-inside/just-outside boundaries for every input.

## Every assumption the calculator makes
- Pitch = 12 x rise / run; from an angle, 12 x tan(angle). Angle = arctan(pitch / 12). Percent = pitch / 12 x 100.
- Area multiplier = sqrt(1 + (pitch/12)^2). Roof area = footprint x multiplier. This is exact for any roof whose planes all share one pitch (gable or hip). Mixed pitches: run each section separately (page says so).
- Footprint means the flat plan area including overhangs. Roof area has no waste and no deductions for openings.
- Rafter length per foot of run = 12 x multiplier, in inches. It's the sloped length per 12 in of level run only (no ridge, birdsmouth, or tail-cut allowances).
- Measurements are taken on straight planes (no sag correction).
- Results are rounded for display: pitch 2 decimals, angle 2, percent 1, multiplier 3, rafter 2, area 1. No purchase quantities, so there's nothing to round up.
- Footprint 0 or blank means "skip roof area" (shows "–").

## Decisions made (choice, source)
- Choice: Show the low-slope shingle note (the brief said to hide it until verified). I verified it against the 2024 IRC text (Web Dev re-read R905.2.2 on UpCodes on 2026-10-07: same wording, including "double underlayment application is required" from 2/12 up to 4/12): below 2/12 = asphalt shingles not allowed (R905.2.2); 2/12 up to but not including 4/12 = two layers of underlayment (Table R905.1.1(2)); 4/12 and steeper = standard underlayment. | Source: [2024 IRC Chapter 9 via UpCodes (GSA Residential Code 2024, adopts IRC 2024 without amendments)](https://up.codes/viewer/general-services-administration/irc-2024/chapter/9/roof-assemblies)
- Choice: Cite the 2024 IRC (the current edition) rather than 2021. The note text and page say "2024 IRC" and tell readers their local edition and amendments may differ. | Source: [2024 IRC Chapter 9 via UpCodes](https://up.codes/viewer/general-services-administration/irc-2024/chapter/9/roof-assemblies)
- Choice: Treat exactly 4/12 as the standard band ("from 2:12 up to 4:12" read as below 4:12, matching how the table pairs it with a separate 4:12-or-greater row), and round pitch to 2 decimals before picking a band so an angle like 18.43 degrees (3.9993/12) counts as 4/12. | Source: [2024 IRC Table R905.1.1(2) via UpCodes](https://up.codes/viewer/general-services-administration/irc-2024/chapter/9/roof-assemblies)
- Choice: Input ranges exactly as the brief: rise 0 to 36 in, run 1 to 24 in, angle 0 to 75 degrees, pitch 0 to 24, footprint 0 to 20,000 sq ft. Defaults: rise-and-run mode, 6 over 12, angle 26.57, pitch 6, footprint 0. | Source: brief section 7 (prompts/BUILD-BRIEFS.md) and standard trigonometry.
- Choice: Reject a rise-and-run pair steeper than 75 degrees (about 44.78/12), the same limit as the angle field, so you can't get a "432/12" result from 36 in over 1 in. The error shows on Rise. | Source: brief's 0 to 75 degree angle range (most sensible consistent limit).
- Choice: Fall-hazard note in the intro, the page's opening section, Assumptions, and FAQ, telling visitors to measure from the attic, a gable end, or plans. | Source: [OSHA Fall Prevention Campaign](https://www.osha.gov/stop-falls)
- Choice: "Rafter length per foot of run" is shown in inches (12 x multiplier), the form framing tables and speed squares use. | Source: standard right-triangle math (hand math in tests).
- Choice: Chart = angle in degrees for 1/12 through 12/12 (static reference), because the brief asks for an always-visible 1/12 to 12/12 pitch chart and the shared line chart shows one series. The full table with percent and multiplier is in page.md. | Source: brief section 9.

## Open questions (decisions for Matthew)
1. **"Send multiplier to Shingle Calculator" link: left out** because the Shingle Calculator isn't built. Planned feature: once `shingle-calculator` exists, add a link that opens it with the pitch/multiplier pre-filled. That needs the Shingle tool to read a URL parameter (and maybe a frame change so a tool can add a link in the results). Want it scheduled with the Shingle build?
2. **Related links:** only `deck-board-calculator` is linked (the only brief link that exists on main). Planned: add `shingle-calculator` and `stair-stringer-calculator` when they're built.
3. **Footprint isn't in a collapsed "Advanced" section.** The brief says collapsed, but the shared frame has no accordion. It's in its own group, "Roof area (optional)". A real collapsible group would be a `packages/layout` change.
4. **Reference table placement:** the 1/12 to 12/12 table is in page.md (always visible, just below the calculator and ad space). Putting it inside the calculator frame would need a frame change. OK where it is?
5. **Chart is static** (the same 12-point angle curve for every input). It could highlight the visitor's own pitch if the shared line chart supported a highlighted point (frame change). Keep as is?
6. **FAQ wording:** People Also Ask wasn't captured, so the FAQ uses the brief's autocomplete questions plus one low-slope shingle question. Please spot-check.

## Anything Web Dev must fix on intake
- **Add the approved title to `sites/home-project-calcs/src/titles.test.js`**, or `npm test` fails "has an approved title for every tool on the site". Generated title: `Roof Pitch Calculator - Pitch to Degrees | Home & Yard Calcs` (60 characters). If Content & SEO wants a different title, set `seoTitle` in meta.json.
- Regenerate the page file with `--page-only` (see above).
- On Windows PowerShell, `npm run new-tool -- --site ... --tool ...` loses the `--` flags (the script gets positional args and crashes). Running `node scripts/scaffold/tool.mjs --site home-project-calcs --tool roof-pitch-calculator` works.

## Web Dev intake (2026-10-07)
- Zip: PowerShell `Compress-Archive` layout (top-level `roof-pitch-calculator\` folder, backslash separators, 8 files). Extracted with Python, `\` mapped to `/`, into `sites/home-project-calcs/tools/roof-pitch-calculator/` only. No files outside the tool folder were in the zip, so nothing was dropped.
- Page regenerated with `npm run new-tool -- --site home-project-calcs --tool roof-pitch-calculator --page-only`.
- **Accent: violet `#6b21a8` -> plum `#7e1f86`.** `#6b21a8` sat CIEDE2000 8.9 from the fence calculator's indigo `#3730a3` (two dark blue-purples on one site). Plum `#7e1f86` is 15.2 from fence, 19.8 from the paint calculator's rose `#be185d` (pair 5), and 22+ from every other accent on main. Changed in `tool.css` and `assets/hero.svg` only (surface `#fbf5fb`, ink `#2a1029`, border `#8b5a8e`, chart palette 4 `#d8a6dc`); the primary-result panel now uses `var(--tool-surface)` instead of a hard-coded hex. Layout/chart kept: split + line is used by no other tool.
- **SEO title:** added `"seoTitle": "Roof Pitch Calculator - Pitch to Degrees"` to `meta.json` and the matching entry `'roof-pitch-calculator': 'Roof Pitch Calculator - Pitch to Degrees | Home & Yard Calcs'` to `src/titles.test.js` (per-tool entry the shared test requires; placed after the retaining-wall line so it doesn't touch the same lines as the parallel paint-calculator PR).
- Site name: none hard-coded in `meta.json`, `page.md`, `ui.js`, or `tool.css`; the title and header come from `site.config.mjs` ("Home & Yard Calcs").
- Related links: only `deck-board-calculator` (on main). No link to the unbuilt Shingle or Stair Stringer calculators.
- **Shingle wiring later:** the "send multiplier to Shingle Calculator" link stays out. Wire it when `shingle-calculator` lands (next pair): add `shingle-calculator` to `relatedTools`, and if the Shingle tool reads a pitch/multiplier URL parameter, add the pre-filled link then.
- Phone width: rendered at 390 px in headless Chrome, `scrollWidth` = viewport width, no element past the right edge (reference table included). No fix needed.
- Math spot checks (all in `logic.test.js`): 6/12 = atan(0.5) = 26.57 degrees, multiplier sqrt(1.25) = 1.118; 12/12 = 45 degrees, 1.414; 4/12 = 18.43 degrees, 1.054; worked example 7.5 in over 18 in = 5/12, 1,680 sq ft x 13/12 = 1,820 sq ft.

## Dependency requests
- none
