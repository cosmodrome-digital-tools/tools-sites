# Handoff: gravel-calculator

## What was built
- Tool slug: gravel-calculator
- Tool name (meta.json "title"): Gravel Calculator
- What it calculates, in one sentence: Cubic feet, cubic yards, and US short tons of gravel for a rectangle, circle, or known area, with an optional base-plus-surface driveway and an editable tons-per-yard.
- Layout / chart style / accent chosen: split layout, bar chart, slate accent `#1f4e5f` on a cool gray surface (`#eef3f4`), sharp 2px corners, Cambria/Georgia display font.

## Sources used
- NIST Handbook 44 (2026), Appendix C: General Tables of Units of Measurement — https://www.nist.gov/document/2026-nist-handbook-44-appendix-c — accessed 2026-10-06. Supports only the unit facts: 12 inches = 1 foot, 27 cubic feet = 1 cubic yard, and an unmodified "ton" is the 2,000-pound short ton. It does not support the 1.40 density or the 4 inch / 2 inch depths. Those stay labeled as editable estimates.

## Test and build results
- `npm ci`: added 250 packages, and audited 257 packages in 53s. (npm also printed a pre-existing "3 high severity vulnerabilities" notice. No packages were added or updated.)
- `npm test`: pass. This tool: 37 tests passed in `tools/gravel-calculator/logic.test.js` (11 known-answer cases, mode/shape cases, edge cases, and the scaffold guard). Site workspace total: 44 passed, 2 skipped (the template guard). calculator-core 15 passed, seo 8 passed, scaffold script tests 5 passed.
- `npm run build`: `Complete!` — 8 pages built, including `/gravel-calculator/`.
- `npm run check`: the repo script crashes on this Windows machine before it prints results (`ERR_UNSUPPORTED_ESM_URL_SCHEME` while importing `site.config.mjs` by a `C:\` path). `scripts/` is off limits, so that file was not changed. The same checks, run from a temporary copy that imports the config with a `file://` URL, finished with 0 failures and the two expected warnings: placeholder domain (`contact@todo-domain.example`) and `ads.txt` with no real publisher ID.
- Known-answer cases (hand math, checked in `logic.test.js`):
  - 50 ft × 12 ft × 4 in, 10% allowance, 1.40 tons/yd³ → 220 cu ft, 8.15 cu yd, 11.41 tons; order 8.2 cu yd and 11.5 tons. This is the worked example.
  - 9 ft × 12 ft × 12 in, 0% allowance, 1.40 → 4 cu yd and 5.6 tons exactly.
  - 27 sq ft × 12 in, density 1, 0% → 1 cu yd and 1 ton exactly.
  - Circle, diameter 10 ft × 12 in, density 1, 0% → area 25π sq ft, shown as 78.5 sq ft, 2.91 cu yd, order 3.
  - Layered 50 × 12, base 4 in at 1.40 and surface 2 in at 1.60, 0% → 10.37 base tons + 5.93 surface tons = 16.3 tons.
  - 12.5 × 8 × 6 in, 5%, 1.35 → 2.625 tons, shown as 2.63, order 2.7 tons.
  - Comparison-table rows (10×20, 12×30, 12×50, 20×40, 24×40, and layered 12×50 at 4 in + 2 in) match the table in `page.md`.

## Open questions
- Density 1.40 tons/yd³ and the 4 inch / 2 inch depths are unverified placeholders from the brief. No DOT or extension source was cited for them. Confirm or replace before treating them as guidance.
- Surface density is its own input (default 1.40, used only in layered mode). The brief's input table listed one density; the unique-addition line said each layer has its own density. Say if you want a single shared density instead.
- "Enter sq ft" has its own Area box (1 to 50,000 sq ft). The input table did not list that box. Length and width cannot change their unit label, so a separate square-foot field was the workable approach.
- Density source is a two-choice menu (Estimate / Supplier figure), not a free-text note. The shared form only allows number and select inputs, and the results list can only show numbers, so the words of a supplier note cannot appear in the results. The choice does not change the math.
- Compaction / waste and Density source sit in an "Advanced" group, but the shared frame has no accordion, so that group stays open.
- Surface depth and surface density stay visible in single-layer mode. The frame cannot hide them. Single-layer math ignores them, including bad values in those two boxes.
- Order lines round up to the next tenth of a ton and the next tenth of a cubic yard. Say if orders should round up to the next whole ton or whole yard instead.
- Related tools are wired (`paver-patio-calculator`, `retaining-wall-block-calculator`, `concrete-calculator`, `mulch-calculator`). Links appear only after those tools exist.
- The shared form has no Reset button. Reloading the page restores the defaults.
- `npm run check` needs a `file://` import on Windows. That is a shared-script issue, not a gravel-calculator issue.

## Dependency requests
none
