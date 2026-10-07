# Handoff: paint-calculator

## What was built

- Tool slug: paint-calculator
- Tool name (meta.json "title"): Paint Calculator
- What it calculates, in one sentence: Gallons of interior wall paint for one rectangular room after doors and windows, with a 5-gallon / 1-gallon / quart shopping mix, plus separate ceiling-paint and primer amounts to buy. (Intake change: walls and ceiling were one total in the first pass.)
- Layout: stacked
- Chart style: donut (gallons to buy by product: wall paint, ceiling paint, primer). Zero slices are left off the chart. (Intake change: the first pass charted the container mix, which is a single solid ring at the defaults.)
- Accent: #be185d rose, white button text. Surface #fff1f2, ink #3b0618. WCAG AA: white on #be185d is 6.04:1; ink on the blush surface is 15.60:1.
- Category: Painting and Interiors
- SEO title (Content & SEO, 56 characters): Paint Calculator - Gallons for Walls | Home & Yard Calcs (meta.json seoTitle; benefit set to match)
- The site name is not written in this folder. The frame adds it from site.config.mjs.

## Zip path and layout quirks

- Zip path: paint-calculator.zip at the repo root.
- Entries use forward slashes and keep the repo path: sites/home-project-calcs/tools/paint-calculator/...
- Compress-Archive on this Windows PC stores only the leaf folder and uses backslashes. That layout was not left in the zip. The archive was rewritten so Web Dev can unzip it and land on the repo path. No node_modules and no .DS_Store.
- The generated page sites/home-project-calcs/src/pages/paint-calculator.astro is local only. It is not in the zip. Regenerate with npm run new-tool -- --site home-project-calcs --tool paint-calculator --page-only.

## Sources used

- Sherwin-Williams SuperPaint Interior Latex Flat product data sheet, A86 series (08/2026). https://www.sherwin-williams.com/document/PDS/en/035777040461/ accessed 2026-10-07. Supports 350–400 sq ft per gallon at 4 mils wet / 1.4 mils dry, two coats on drywall, primer for a big color change, ventilation wording, and the lead-dust warning that points to epa.gov/lead.
- JELD-WEN press release, Birkdale molded interior door (July 9, 2018). https://www.corporate.jeld-wen.com/newsroom/press-releases/2018/07-09-2018-145812945 accessed 2026-10-07. Supports 6 ft 8 in as a listed interior door height.
- JELD-WEN Builders Vinyl double-hung architectural design manual (February 2025). https://cmd-jeld-wen.s3.us-east-2.amazonaws.com/assets/documents/1703687380.pdf accessed 2026-10-07. Book code BLVDH3660 is a double-hung with a 35.5 in by 59.5 in frame (nominal 36 by 60).
- NIST Handbook 130 (2020), Uniform Packaging and Labeling Regulation. https://www.nist.gov/system/files/documents/2019/12/17/2020-NIST-HB130-Final.pdf accessed 2026-10-07. Supports the US gallon of 231 cubic inches and the liquid quart as a legal liquid measure. The mix treats 1 quart as 1/4 gallon.
- US EPA Lead page. https://www.epa.gov/lead accessed 2026-10-07. Supports the note that this page is not a lead-paint guide, including lead-based paint hazards in pre-1978 homes.
- Added at intake: Sherwin-Williams Premium Wall & Wood Interior Latex Primer B28W08111 PDS (8/2023). https://paintdocs.com/docs/webPDF.jsp?SITEID=ECOMEDES&doctype=PDS&lang=2&prodno=B28W08111 accessed 2026-10-07. 400 sq ft per gallon at 4 mils wet; the drywall primer the SuperPaint sheet names.
- Added at intake: Sherwin-Williams Paint Calculator and FAQs. https://www.sherwin-williams.com/en-us/color/color-tools/paint-calculator accessed 2026-10-07. Ceilings are figured in its Custom Calculation, separate from walls; a gallon typically covers 350–400 sq ft.
- Added at intake: Consumer Reports, 5 Ways to Save Money on a Paint Job at Home (2017). https://www.consumerreports.org/paints/save-money-on-a-paint-job-at-home/ accessed 2026-10-07. Larger containers cost less per gallon (a 5-gallon container is usually cheaper than five 1-gallon cans).

## Assumptions (every one)

- One rectangular room. Four walls. No alcoves, closets, or sloped ceilings.
- US feet and square feet only. No prices.
- Length 4–50 ft (default 12), width 4–50 ft (default 12), wall height 7–12 ft (default 8).
- Ceiling defaults to included. Ceiling area is length times width. It is its own buy (ceiling paint), at the same coverage and coats as the walls, and never changes the wall paint or wall cans. Turn it off for walls only.
- Doors default to 1 (0–10, whole number). Each door defaults to 20 sq ft (allowed 10–40).
- Windows default to 2 (0–20, whole number). Each window defaults to 15 sq ft (allowed 4–40).
- Openings are subtracted from the walls only. If they add up to more than the walls, the form shows an error instead of a negative area.
- Coats default to 2 (whole number, 1–3).
- Product defaults to Sherwin-Williams SuperPaint Flat at 350 sq ft/gal. The other listed choice is the same sheet's high end, 400. Custom uses the coverage box (200–450). Other brands are not built in.
- While a SuperPaint choice is selected, the coverage box is ignored. The shared form cannot hide that box or copy the preset into it.
- Primer defaults to off. On adds one primer coat over walls plus ceiling (if included) at the same coverage rate as the paint. Primer is a separate "to buy" line, not added into the wall cans. It is a donut slice when on.
- No extra waste percent. Using 350 instead of 400 is the allowance (about 14 percent more paint than the high end).
- Purchase counts round up to the next quart (0.25 gal), then split into 5-gallon buckets, 1-gallon cans, and quarts. Four quarts become one gallon. Twenty quarts become one 5-gallon bucket. A leftover of 3 quarts is bought as one more gallon, and five 1-gallon cans become one bucket (intake change). Ceiling paint and primer use the same rounding and are shown as gallons to buy. The on-screen gallons are rounded to hundredths for reading. The cans use the exact number.
- Areas display to the nearest tenth. Container counts are whole numbers.
- Porous, textured, masonry, and exterior surfaces are outside the cited rate. The sheet does not give a porosity multiplier, so none is applied.
- A big color change is handled by the primer switch, matching the sheet's advice. This is not a lead-paint guide. Ventilation follows the sheet: open windows and doors or otherwise bring in fresh air. Readers confirm the rate on the can they buy.

## Decisions made (choice, source)

- Coverage: default 350 sq ft/gal, with 400 as the other preset and Custom 200–450 for any other can. Source: [Sherwin-Williams SuperPaint Interior Latex Flat PDS, A86, 08/2026](https://www.sherwin-williams.com/document/PDS/en/035777040461/) (350–400 sq ft/gal at 4 mils wet); [Sherwin-Williams Paint Calculator FAQ](https://www.sherwin-williams.com/en-us/color/color-tools/paint-calculator) (a gallon typically covers 350–400 sq ft). The low end is the default so the buy is the generous end of the range.
- Coats: default 2, range 1–3. Source: same SuperPaint PDS (drywall: self-prime with 2 coats, or 1 primer + 2 finish coats).
- Waste: no separate waste percent. Source: same PDS range. Using 350 instead of 400 already plans about 14% more paint than the high end, and rounding up to whole containers adds more; another 5% would double-count.
- Door deduction: 20 sq ft each (36 in × 80 in), editable 10–40. Source: [JELD-WEN Birkdale press release](https://www.corporate.jeld-wen.com/newsroom/press-releases/2018/07-09-2018-145812945) (6 ft 8 in interior door height) with the common 3-0 width; 3 × 6.67 ft = 20 sq ft.
- Window deduction: 15 sq ft each (nominal 36 in × 60 in), editable 4–40. Source: [JELD-WEN Builders Vinyl double-hung manual, Feb 2025](https://cmd-jeld-wen.s3.us-east-2.amazonaws.com/assets/documents/1703687380.pdf), BLVDH3660, 35.5 × 59.5 in frame (about 14.7 sq ft).
- Walls and ceiling are separate buys (intake change). The ceiling gets its own "Ceiling paint to buy" line and never goes into the wall-color cans; same coverage and coats as the walls. Source: [Sherwin-Williams Paint Calculator](https://www.sherwin-williams.com/en-us/color/color-tools/paint-calculator) figures ceilings separately in its Custom Calculation; ceilings are usually a different product (ceiling white) from the wall color, so one combined total over-buys the wall color.
- Ceiling included by default. Source: the paint brief; leaving it off under-plans the job when the ceiling is being painted. Turning it off only removes the ceiling line.
- Primer: one coat over walls + ceiling (when included), at the same coverage rate as the finish paint, as a separate buy. Source: SuperPaint PDS (primer for drastic color change; 1 primer + 2 coats on drywall) and the primer it names, [Sherwin-Williams Premium Wall & Wood Primer PDS](https://paintdocs.com/docs/webPDF.jsp?SITEID=ECOMEDES&doctype=PDS&lang=2&prodno=B28W08111) (400 sq ft/gal at 4 mils wet). Using the finish rate (350 by default) never plans less primer than that sheet's rate.
- Rounding: round up to the next quart, largest containers first (4 qt = 1 gal, 20 qt = one 5-gal bucket); 3 leftover quarts are bought as one more gallon, and five 1-gallon cans become one bucket (intake change). Source: [NIST Handbook 130 (2020)](https://www.nist.gov/system/files/documents/2019/12/17/2020-NIST-HB130-Final.pdf) for the US gallon and liquid quart; [Consumer Reports](https://www.consumerreports.org/paints/save-money-on-a-paint-job-at-home/) (larger containers cost less per gallon). Three quarts hold less than a gallon and cost more per gallon, so nobody should be told to buy them.
- Products: both cited SuperPaint ends (350, 400) plus Custom; Behr and Benjamin Moore are not built in because their rates were not checked. Source: SuperPaint PDS. Custom is how other cans are entered.

## Test and build results

Builder (Windows, Node 22.23.2): paint tests 23 passed; full npm test failed only on the missing titles.test.js entry; build and check passed.

Web Dev intake rerun (box, Node v22.23.3, worktree off main df2b8e5), after the intake changes below:

- Paint calculator tests: logic.test.js, 27 passed. Known answers are hand math: the 12×12×8 worked example (walls 1.91 gal → two 1-gallon cans; ceiling 0.82 gal → 1 gallon); 10×10×8 walls only at 400, 1 coat (0.8 → 1 gallon); 12×12 at 400 with primer (walls 1.67 → 2 gal via the 3-quart rule; ceiling 1 gal; primer 1.25 gal); 20×24×12 walls (6.03 → one 5-gal + 1 gal + 1 qt); 20×20×10 walls (4.57 → 4 gal + 3 qt → one 5-gal bucket); all six page-table rows.
- Full npm test, npm run build, npm run check: see the PR body for counts.

## Intake changes by Web Dev

- Walls and ceiling split into separate buys (logic, outputs, donut, page copy, tests). Donut now shows gallons to buy by product.
- 3-quart rule and 5-cans-to-bucket rule added to the container mix.
- Primer now covers walls + ceiling and is shown rounded as gallons to buy.
- seoTitle set to Content & SEO's "Paint Calculator - Gallons for Walls"; benefit matched; titles.test.js entry added by Web Dev.
- Shorter Product option labels (the long ones were cut off at 390 px) and shorter wall-can output labels.
- Three sources added (SW primer PDS, SW paint calculator, Consumer Reports).
- Look kept: rose #be185d, stacked + donut is a combination no other tool on main uses (paver is stacked + bar; deck split + donut; fence and retaining wall stepper + donut).

## Open questions

Product, UX, or scope only. Nothing here blocks the page.

- The coverage box stays visible when SuperPaint is selected, and the calculator ignores it until Product is Custom. The shared form cannot hide the box or fill it when the dropdown changes. Say if you would rather have the typed number always win, including when SuperPaint is selected.
- The shared form has number and select only, so Include ceiling and Include primer are Yes/No dropdowns, not switches. It also has no accordion, so Opening sizes and primer is a visible dashed group, not a collapsed panel. That is a frame limit, not a data question.
- Planned related links, not wired because those tools are not on main: drywall-calculator, flooring-calculator. No outdoor tool is linked in their place.

## What Web Dev must fix on intake

- Done at intake: added 'paint-calculator': 'Paint Calculator - Gallons for Walls | Home & Yard Calcs' to EXPECTED in src/titles.test.js (Content & SEO's approved title, not the builder's "Gallons and Can Mix" draft).
- Done at intake: regenerated src/pages/paint-calculator.astro with --page-only.
- Later: when drywall-calculator and flooring-calculator are on main, add them to relatedTools in meta.json. relatedTools stays empty until then (no tool on main is a good match).
- A collapsed "advanced" group and a real on/off switch would need a frame change. This tool does not fake either one.

## Dependency requests

none
