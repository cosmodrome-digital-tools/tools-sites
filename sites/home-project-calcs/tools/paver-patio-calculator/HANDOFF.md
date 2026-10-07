# Handoff: paver-patio-calculator

## What was built
- Tool slug: paver-patio-calculator
- Tool name (meta.json "title"): Paver Patio Calculator (benefit: "Pavers, Base Gravel, and Sand")
- What it calculates, in one sentence: For a rectangular, round, or known-area patio, walkway, or driveway, it gives pavers to buy (joint-aware, with waste, rounded up), compacted base in cu yd and tons at an ICPI Tech Spec 2 depth set by use and soil, bedding sand in cu ft and cu yd, and edge restraint in linear ft.
- Layout / chart style / accent chosen: `stacked` layout (4 groups: Patio size, Paver size, Base depth (ICPI), Advanced), `bar` chart (base tons at each distinct ICPI depth option: 4 in, 6 in, and each plus the poor-soil extra), moss-green accent `#3f5a1e` on warm sand `#f5f2e8`, clay-brown second chart color, 10px "paver" corners, a running-bond brick strip across the top of the frame, Gill Sans/Calibri system font stack. New decorative `assets/hero.svg` (paver/sand/base cross-section, 1.2 KB, `heroAlt: ""`). Picked to differ from concrete (split/bar/slate), rebar (stepper/line/rust), and gravel on main (split/bar/teal).
- Unique addition: use and soil selector that sets the ICPI base depth and outputs base tons plus bedding sand together. `page.md` has an "ICPI base depth recipe" H2 table (with tons per 100 sq ft) and a real-world hauling tip, and the FAQ includes a pavers-per-square-foot table for 8 common sizes.
- `ui.js` adds one display helper (no math): it shows only the size fields for the chosen shape, and the "Extra base for poor soil" field only when poor soil is chosen. `logic.js` validates only the fields that apply, so the form still works without JavaScript.

## Sources used
- **ICPI Tech Spec 2: Construction of Interlocking Concrete Pavements, revised February 2020** (Interlocking Concrete Pavement Institute), https://www.orco.com/wp-content/uploads/2020/05/ICPI_Tech_Spec_2_Feb_20.pdf, accessed 2026-10-06. **I re-read the PDF text myself.** It supports:
  - "Sidewalks, patios and pedestrian areas should have a minimum base thickness (after compaction) of 4 in. ... over well-drained soils. Residential driveways on well-drained soils should be at least 6 in." and "In colder climates, continually wet or weak soils will require that bases be at least 2 to 4 in. ... thicker."
  - Bedding sand "screeded to an uncompacted nominal 1 in. (25 mm) thickness."
  - Joint widths "between 1/16 and 3/16 in." This is used in the joint-width help text. The brief's 1/8 in default falls inside it.
  - The document does **not** give a distance for extending the base past the paver edge, so the tool leaves that out.
- **CMHA resource page PAV-TEC-010** (Concrete Masonry & Hardscapes Association, ICPI's successor), https://www.cmha.org/resource/pav-tec-010/, accessed 2026-10-06. Listed because the brief names it. **Heads-up:** this page is a *different* bulletin ("Application Guide for Interlocking Concrete Pavements", 2022). Its figures are ranges (walks 4 to 6 in, driveways 6 to 8 in, sand 1 to 1-1/2 in). They're consistent with Tech Spec 2's minimums but not identical. The tool and page cite Tech Spec 2 for every number. See open question 2.
- Base density 1.40 tons/cu yd and 5% paver waste have **no source**. They're labeled assumptions, as the brief says.

## Test and build results
Run from the repo root on Windows, Node v22.14.0:
- `npm ci`: `added 250 packages, and audited 257 packages in 36s` (npm reports existing audit findings in shared dependencies; not touched)
- `npm test`: site suite `Tests 93 passed | 2 skipped (95)`. This tool alone (`npx vitest run tools/paver-patio-calculator` from the site folder): `Tests 31 passed (31)`. Packages `15 passed` and `8 passed`, scripts node tests `5 / fail 0`.
- `npm run build`: `10 page(s) built` ... `Complete!`
- `npm run check`: the repo's own script **crashes on Windows** (`ERR_UNSUPPORTED_ESM_URL_SCHEME`). That's the known issue, already fixed on `main` in #4, and `scripts/` is off-limits. I ran `main`'s fixed version of `scripts/checks/run.mjs` from a temp folder, pointed at this repo: `checks: 1 site(s), 0 failure(s), 2 warning(s)`. The 2 warnings are the expected placeholder domain and ads.txt.
- Browser check (built site via `astro preview`): default inputs render exactly the worked-example numbers (650 pavers, 2.49 t, 1.78 cu yd, 12 cu ft, 0.44 cu yd, 48 ft). Switching shape and soil shows and hides the right fields. Driveway + poor soil gives 8 in / 3.56 cu yd / 4.98 t. At 375 px phone width there's no horizontal scroll, and the form starts at about 540 px, inside the first screen (812 px).
- Known-answer cases (all hand math, written out in `logic.test.js`):
  1. Worked example: 12 x 12 ft, 4 x 8 in, 1/8 in joints, patio, well-drained, 1 in sand, 1.40, 5%: 650 pavers (618.7 before waste), 4 in base, 1.78 cu yd, 2.49 t, 12 cu ft sand, 48 ft edge.
  2. 20 x 10 ft driveway, poor soil +3 in, 10%: 946 pavers, 9 in, 5.56 cu yd, 7.78 t, 16.7 cu ft sand, 60 ft edge.
  3. 10 ft circle, 6 x 6 in, no joint: 78.5 sq ft, 4.00/sq ft, 330 pavers, 0.97 cu yd, 1.36 t, 31.4 ft edge.
  4. 4 x 8 in with no joint = 4.5 per sq ft (144 / 32). Also checked: the whole pavers-per-sq-ft table in page.md, the driveway variant in the worked example (8 in, 3.56 cu yd, 4.98 t), and the base-recipe table (1.73 / 2.59 / 3.46 / 4.32 t per 100 sq ft).
  5. Known area 200 sq ft with edge left blank: 903 pavers, 3.46 t, edge restraint shows "–".
  - Plus: ICPI preset tests, chart tests, zero/negative/very large/empty/non-numeric/unknown-select tests, shape-specific validation, and accept/reject boundaries for all 12 numeric inputs.

## Every assumption the calculator makes
- Pavers per sq ft = 144 / ((L + joint) x (W + joint)). One joint width is added to each paver dimension. Paver sizes are the nominal face size from the label.
- Waste % applies to pavers only, then the total is rounded up to a whole paver. Base, sand, and edge restraint get no waste.
- Base depth = 4 in (patio/walkway) or 6 in (driveway), plus the 2 to 4 in extra only when "Cold climate, wet, or weak soil" is picked. The presets are fixed from ICPI. Visitors can adjust only the extra depth.
- Base volume = paved area x depth. It's the **compacted, in-place** volume: no compaction/loose-volume factor (none verified), and no base extension past the edges (not verified). The page tells visitors to give the supplier the compacted depth and area.
- Tons = cu yd x density (default 1.40, **unverified**, editable 1.0 to 2.0, help text says to get the supplier's figure).
- Bedding sand = area x depth (default 1 in, ICPI nominal, editable 0.5 to 2 in). Joint/polymeric sand isn't estimated (product-specific; the FAQ says to use the bag's coverage).
- Edge restraint = full perimeter (rectangle 2(L+W), circle πD). In "I know the square feet" mode it's the optional edge length the visitor types, or "–" if blank. The page says to subtract sides against a house or slab.
- Chart: when soil is well-drained, the chart still shows a +2 in "poor soil" option (4, 6, 8 in) for comparison.

## Open questions (decisions for Matthew)
1. **Unverified defaults shipped as editable inputs with warnings** (brief section 14): base density 1.40 t/cu yd and paver waste 5%. Both help texts and the Assumptions section say they're estimates. Keep them, or find a supplier/manufacturer source before launch?
2. **CMHA link**: the second source is a different CMHA bulletin with range figures (walks 4 to 6 in, driveways 6 to 8 in, sand 1 to 1-1/2 in). Keep it as a "successor org" reference, swap it for CMHA's current version of Tech Spec 2 if one exists, or drop it? The page text cites only Tech Spec 2. Also, the Tech Spec 2 PDF is hosted on a distributor's site (orco.com), not ICPI/CMHA itself.
3. **Inputs I added that the brief's table didn't list** (needed for the brief's own shape options): `diameter` (1 to 100 ft) for Circle, `area` (1 to 10,000 sq ft) for "Enter sq ft", and an optional `perimeter` (1 to 2,000 ft) so known-area users can still get edge restraint. Ranges are my choice. OK?
4. **No free "custom base depth" override.** The brief's section 8 says "user can override depths", but its input table has none, so only the 2 to 4 in poor-soil extra is adjustable. Want a custom-depth field added?
5. **"Advanced" inputs aren't collapsed.** The shared frame has no accordion, so they're in a group titled "Advanced: joints, sand, density, waste" (same approach as concrete and rebar). A real collapsible group would be an infra change to `packages/layout`.
6. **FAQ wording**: People Also Ask wasn't captured, so the FAQ uses the brief's 6 autocomplete questions. The polymeric sand answer deliberately gives no number.
7. **Related tools**: meta.json lists gravel, retaining-wall-block, concrete, and mulch (the brief's order). Locally only concrete links, because this checkout is behind `main` (see below). Gravel will link once on `main`; the other two once built.

## Anything Web Dev must fix on intake
- **Built on the old branch, not `main`.** The instructions said `git checkout main && git pull`, but this clone only tracked `chore/monorepo-scaffold` (since deleted on GitHub after PR #1 merged). I fetched `main`, but checking it out was blocked: Matthew's untracked local `concrete-calculator/` and `rebar-calculator/` folders (and their `.astro` pages) collide with the merged versions, and the local concrete copy differs from main's. I left them alone for Matthew to sort out. The tool folder doesn't depend on anything that changed between the branches, but **run the tests and build again on `main` at intake**.
- **Zip layout quirk:** made with PowerShell `Compress-Archive -Path sites/home-project-calcs/tools/paver-patio-calculator ...`, so the zip holds a top-level `paver-patio-calculator/` folder, **not** the full `sites/home-project-calcs/tools/` path. Unzip it into `sites/home-project-calcs/tools/`. Windows PowerShell 5.1 may write backslash path separators; if unzip complains, use 7-Zip or `Expand-Archive`.
- Regenerate the page file: `npm run new-tool -- --site home-project-calcs --tool paver-patio-calculator --page-only`. The local `src/pages/paver-patio-calculator.astro` isn't in the zip.

## Dependency requests
- none
