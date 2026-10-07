# Handoff: mulch-calculator

## What was built
- Tool slug: mulch-calculator
- Tool name (meta.json "title"): Mulch Calculator
- What it calculates, in one sentence: Cubic feet, cubic yards, and bags of mulch for a rectangle, a circle, a typed area, or a tree ring, with a top-up that subtracts mulch already in the bed.
- Layout / chart style / accent chosen: stepper layout, line chart, leaf-and-bark accent `#3c4f2f` on a warm paper surface (`#f3eee3`), 14px corners, Palatino display font. The line chart is bags for this mulched area at 2, 3, and 4 inches on bare soil.

## Sources used
- University of Illinois Extension, Proper Mulching Techniques (Sarah Vogel and Jenny Lee, modified March 2024) — https://extension.illinois.edu/sites/default/files/proper_mulching_techniques_infosheet.pdf — accessed 2026-10-06. Supports the 2 to 4 inch depth, composted material at 2 to 3 inches, coarse mulch at 3 to 4 inches, keeping mulch at least 4 inches off the trunk, the warning against mulch piled on the bark, and the note that a 3-foot radius ring is the maximum for most trees. It also lists weed control as a benefit of mulch. It does not give a bag size, a waste percent, or a promise of a weed-free bed.
- NIST Handbook 44 (2026), Appendix C: General Tables of Units of Measurement — https://www.nist.gov/document/2026-nist-handbook-44-appendix-c — accessed 2026-10-06. Supports only the unit facts used in the volume math: 1 foot = 12 inches, and 27 cubic feet = 1 cubic yard. It does not support a mulch depth or a bag size.

## Test and build results
- `npm ci`: added 250 packages, and audited 257 packages in 47s. npm also printed a pre-existing "3 high severity vulnerabilities" notice. No packages were added or updated.
- `npm test`: pass. This tool: 32 tests passed in `tools/mulch-calculator/logic.test.js` (known answers, shape cases, edge cases, and the scaffold guard). Site workspace total: 76 passed, 2 skipped (the template guard). calculator-core 15 passed, seo 8 passed, scaffold script tests 5 passed.
- `npm run build`: `Complete!` — 9 pages built, including `/mulch-calculator/`.
- `npm run check`: the repo script crashes on this Windows machine before it prints results (`ERR_UNSUPPORTED_ESM_URL_SCHEME` while importing `site.config.mjs` by a `C:\` path). `scripts/` was not changed. The same checks, run from a temporary copy that imports the config with a `file://` URL, finished with 0 failures and the two expected warnings: placeholder domain (`contact@todo-domain.example`) and `ads.txt` with no real publisher ID.
- Known-answer cases (hand math, checked in `logic.test.js`):
  - 20 ft × 10 ft × 3 in, existing 0, 2 cu ft bags → 50 cu ft, 1.85 cu yd, 25 bags. This is the worked example. Chart: 17, 25, 34 bags at 2, 3, and 4 inches.
  - Same bed with 2 in already there → 16.67 cu ft, 0.62 cu yd, 9 bags. The chart stays 17, 25, 34.
  - 54 sq ft × 6 in = 27 cu ft = 1 cu yd. At a 2 cu ft bag, bags to buy = 14 and bags in one yard = 13.5. At a 3 cu ft bag, bags to buy = 9 exactly.
  - Circle, diameter 10 ft × 3 in, 2 cu ft bags → area 78.5 sq ft, 19.63 cu ft, 0.73 cu yd, 10 bags.
  - Tree ring, 6 ft across, 0.33 ft clearance, 3 in, 2 cu ft bags → mulched area 27.9 sq ft, 0.3 sq ft left clear, 6.98 cu ft, 0.26 cu yd, 4 bags.
  - 1.5 cu ft bags on the opening bed → 34 bags, 18 bags in one yard.
  - The 100 / 200 / 300 sq ft table at 2, 3, and 4 inches matches `page.md`.
- Page check in headless Edge (built page): the opening form showed 25 bags and 1.85 cu yd. Switching to Tree ring showed 4 bags, 27.9 sq ft, and 0.3 sq ft left clear. A top-up to 2 inches existing showed 9 bags. Existing depth 4 against a wanted depth of 3 showed the "removing mulch" error and cleared the chart. A 10 ft circle with Width left empty showed 10 bags and 78.5 sq ft. Enter sq ft with Area emptied showed "Enter area." Desktop (1280×900) and phone (390×844) screenshots showed the form starting under a short intro.

## Zip path and layout
- Zip path: `mulch-calculator.zip` at the repo root.
- `Compress-Archive -Path sites/home-project-calcs/tools/mulch-calculator` stores only the leaf folder (`mulch-calculator\...`) and uses backslashes. That is not the layout in `docs/BUILDING-TOOLS.md`.
- The delivered zip was rebuilt so every entry uses the repo path and forward slashes: `sites/home-project-calcs/tools/mulch-calculator/<file>`.
- The zip does not include `src/pages/mulch-calculator.astro`, `node_modules`, or anything outside the tool folder. Web Dev regenerates the page with `npm run new-tool -- --site home-project-calcs --tool mulch-calculator --page-only`.

## Assumptions (each one, and why)
- Rectangle is the starting shape. Most beds are rectangles, and the brief says so.
- A circle uses the Length / diameter box as the diameter. The brief gives one field for "Length / diameter," and the form cannot change a label when the shape changes.
- Enter sq ft has its own Area box, 1 to 20,000 sq ft. The brief's shape list includes "Enter sq ft," but the input table has no square-foot field. Length cannot change its unit from ft to sq ft, so a separate box was added. 20,000 is the same cap as a 200 ft by 100 ft rectangle.
- Length / diameter is 1 to 200 ft. Width is 1 to 100 ft. Outer diameter is 2 to 30 ft. Those ranges are the brief's ranges.
- Boxes the current shape does not use stay on the form and are skipped, even if they contain a bad value. The shared frame cannot hide fields.
- Depth starts at 3 inches and allows 1 to 6. Three inches is the middle of the Illinois Extension 2 to 4 inch range. The box is wider than 2 to 4 so a product label outside that range still calculates. The sheet says composted material is 2 to 3 inches and coarse mulch is 3 to 4 inches. The brief said "fine-textured" for the 2 to 3 inch band. The sheet says "composted materials," so the page uses the sheet's words.
- Existing depth starts at 0 (a new layer on bare soil) and allows 0 to 6 inches. Top-up mode subtracts it from Depth. That is the brief's top-up. If the two depths match, the bag count is 0, which matches the sheet's advice to rake rather than add more when enough mulch is already there. If existing depth is higher than the depth you want, the form shows an error, because that would mean removing mulch.
- No waste percent was added. The brief's input table does not list one, and the Illinois sheet does not give an overage. Bags already round up to the next whole bag. The shared site note says 5 percent when no manufacturer figure exists. That 5 percent was left out so it would not be shipped as a mulch fact. See Open questions.
- Bag size starts at 2 cubic feet and allows 0.5 to 3. The brief says 2 cu ft shows up in search questions and is unverified against bag labels, so the number is editable and the help text says to read the bag.
- Bags to buy always round up to a whole bag. An exact whole number stays. Cubic yards are shown to the nearest hundredth and are not rounded up to a whole yard. Bags in one yard is 27 divided by the bag size and is not rounded up, so a 2 cu ft bag shows 13.5, not 14.
- Trunk clearance starts at 0.33 ft (3.96 inches) and allows 0.25 to 1 ft, which is the brief's default and range. The sheet says at least 4 inches off the trunk. 0.33 ft is just under 4 inches, and 0.25 ft is 3 inches. The page tells the reader to type 0.34 or more for a full 4 inch gap. Clearance must stay smaller than the outer radius, or the ring has no area. See Open questions.
- Outer diameter starts at 6 ft. That is a 3-foot radius, which the sheet calls the maximum ring for most trees. The box still allows up to 30 ft because that is the brief's range. The page says a wider ring is a quantity, not advice to go past 3 feet of radius.
- The chart always uses bare soil at 2, 3, and 4 inches for the mulched area and the chosen bag size. It does not subtract existing depth. A tree ring's chart uses the ring after the gap is removed. The printed table on the page is the same comparison for 100, 200, and 300 sq ft with a 2 cu ft bag.
- Results are material counts only. There is no price.
- The page is not a fire-clearance calculator and not a playground-surface calculator. The brief says to keep those out.

## Open questions
- Bag sizes (2 cu ft, and the 0.5 to 3 range) are still unverified against retailer labels. Say if you want the default changed after you check a bag, or if you want a short list of common sizes instead of a typed number.
- Shared site rule: add a 5 percent waste box when no manufacturer figure exists. This brief's input table does not include waste, and the Illinois sheet does not give one. I did not add it. Say if you want a waste box, and what default and range to use.
- Trunk clearance allows 0.25 ft, which is under the sheet's 4 inch line, because that is the brief's range and the brief's own default of 0.33 ft is also just under 4 inches. Say if the floor and the default should move to 0.34 ft so the tool refuses a gap under 4 inches.
- Enter sq ft uses a new Area box (1 to 20,000). Say if you want a different cap.
- Order yards are not rounded up. Bags are. Say if bulk orders should round up to the next tenth or the next whole yard.
- Related tools are listed as `gravel-calculator`, `paver-patio-calculator`, and `retaining-wall-block-calculator`. On this machine only Gravel Calculator has a folder, so the built page links only that one. The other two links appear after those folders exist.
- The shared form has no accordion and no Reset button. Advanced stays open as the last step. Reloading the page restores the defaults.
- `npm run check` needs a `file://` import on Windows. That is a shared-script issue. CI on Linux should not hit it. Do not patch `scripts/` as part of this tool.

## Anything Web Dev must fix on intake
- Unzip so the folder lands at `sites/home-project-calcs/tools/mulch-calculator/`. Regenerate `src/pages/mulch-calculator.astro` with `--page-only`. The astro file is not in the zip.
- Placeholder domain and `ads.txt` warnings are expected. They are not mulch-calculator defects.
- No code change is required for the Windows `npm run check` crash. Leave `scripts/` alone.

## Dependency requests
none
