# Handoff: deck-board-calculator

## What was built

- Tool slug: `deck-board-calculator`
- Tool name: Deck Board Calculator
- What it calculates: Boards, joists, and face screws for a rectangular deck, plus a joist-spacing warning against 2021 IRC Table R507.7 (wood) or the 2026 Trex span chart (composite).
- Layout: `split`
- Chart: `donut` (layout boards vs extra boards from waste and rounding)
- Accent: indigo `#2c2a72` on surface `#f3f2fb`, display font Candara. Chosen so it is not the concrete slate split/bar, rebar rust stepper/line, gravel teal split/bar, mulch stepper/line, paver moss stacked/bar, or retaining-wall donut/stepper. Not a brown wood theme.

## Sources used

1. ICC, 2021 International Residential Code, Section R507.7 and Table R507.7
   - URL: https://codes.iccsafe.org/s/IRC2021P2/chapter-5-floors/IRC2021P2-Pt03-Ch05-SecR507.7
   - Accessed: 2026-10-07
   - Supports: wood joist-spacing cells (1-1/4 inch wood: perpendicular 12/16, diagonal 8/12; 2 inch wood: perpendicular 24/24, diagonal 18/24). Footnote a: diagonal means at most 45 degrees from perpendicular. Footnote c: two joists is a single span, three or more is a multiple span. Wood decking is attached with at least two 8d threaded nails or two No. 8 screws at each supporting member. Plastic composite follows the manufacturer, not this table.
   - How it was read: the live ICC page is a script app and did not return the table body on a direct fetch. The table text, including footnotes a, b, and c, was read from the indexed excerpt of that same URL. It matches the brief's table.

2. Trex, 2026 Trex Decking Installation Guide (PDF, about 20 MB)
   - URL: https://nationaldecking.com/wp-content/uploads/2026/08/2026-Trex-Decking-Installation-Guide.pdf
   - Accessed: 2026-10-07 (downloaded and text-extracted)
   - Supports, from the text layer of that PDF:
     - Width-to-width gap minimum 3/16 inch at every temperature. Heavily wooded areas: 3/8 inch recommended. Gap should not exceed 1/2 inch.
     - End-to-end gap: 1/8 inch above 40°F, 3/16 inch below 40°F. Abutting a solid object: 1/4 inch above 40°F, 1/2 inch below 40°F.
     - "Trex requires the use of two screws per joist." Also: "Always use two screws per joist or stair stringer."
     - "Trex decking must span at least three joists."
     - Maximum perpendicular overhang is 3/4 inch. The tool does not check overhang.
     - At 45 degrees, maximum joist spanning is 4 inches less than the chart span. At 30 degrees, maximum joist spanning is half the chart span.
     - Span chart (on center), walking surface: 16 inches for the common 1x6 products at 100 psf, and for Lineage 1x4 at 100 psf; 16 inches for Transcend and Select 2x6 at 200 psf; 24 inches for Transcend and Select 2x6 at 100 psf, Transcend 1x6 and Lineage 1x6 at 91 psf, and Select 1x6 at 75 psf. The guide also says a 16 inch span is recommended for a stiffer surface. Stair-tread rows (9, 12, or 16 inches by product) are not used.
     - Some commercial jobs need 100 psf or more. The chart does not say "commercial = 12 inches."

The brief's Island County deck-handout URL returned HTTP 404 on 2026-10-07, so it is not cited: https://www.islandcountywa.gov/DocumentCenter/View/7831/2021-IRC-Island-County-Deck-Handout

## Test and build results

Run from the repo root. Node and npm were not on PATH; commands used `C:\Users\matth_uq2w7e7\OneDrive\Desktop\GrokBot Websites\nodejs` (Node v22.23.2, npm 10.9.8).

- `npm ci`: exit 0. "added 250 packages, and audited 257 packages in 50s." npm also printed 3 high severity vulnerabilities. `npm audit fix` was not run, because that would change the lockfile.
- `npm test`: exit 0. Site workspace: 169 passed, 2 skipped (the template guard). This tool: 18 passed. calculator-core 15 passed, seo 8 passed, `scripts/**/*.test.mjs` 5 passed.
- `npm run build`: exit 0. Ended with "Complete!" Static build includes `/deck-board-calculator/index.html`.
- `npm run check`: exit 0. "checks: 1 site(s), 0 failure(s), 2 warning(s)". Both warnings are the expected placeholder domain (`contact@todo-domain.example`) and ads.txt with no real publisher ID.

Known-answer cases are hand math in `logic.test.js`, not a third-party calculator:

- 12×12 starting values: 26 rows, 29 boards, 464 ft, 10 joists, 520 screws, 3.61 per sq ft, spacing limit 16, warning 0. This is the worked example.
- 8×10 with 16 ft sticks: 22 rows, 13 boards, because one stick covers two 8 ft rows, then 10 percent waste.
- 10×12 and 12×16 common-size rows in the page table.
- 20 ft run on 12 ft sticks: 8 ft remainder, 4 ft offcut, no reuse, 52 boards, 884 screws.
- 18 ft run on 12 ft sticks: 6 ft offcut shared, 26 boards, 544 screws.
- 24 ft run on 12 ft sticks: two exact sticks, one joint, 52 boards, 1040 screws.
- 45 degree composite, 0 percent waste: 36 rows, 19 boards, 324 screws, limit 12 (16 minus 4), warning 1.
- IRC cells for 5/4 and 2x, single and multiple, perpendicular and diagonal.
- Composite 24 inch chart at 45 degrees allows 20 inches. Composite single span warns even when the spacing is inside the chart.

Edge cases cover zero, negative, very large, empty, non-numeric, each numeric boundary just inside and just outside, invalid selects, and a combined error object.

The built HTML shows the split/donut frame, the form, the page sections, both sources, and a related link to Concrete Calculator only. There is no browser tool in this session, so the form was not clicked through in a browser. Calculation behavior is covered by the unit tests.

## Assumptions

Every assumption, and why:

1. The deck is one rectangle. The brief is a rectangular deck. Curves, picture frames, and breaker boards are out.
2. Deck length is the side the joists are spaced along. Deck width is the length of each joist. Perpendicular boards run along the length and are counted across the width. For diagonal, length and width are the two outside sides. This matches the brief's "width is perpendicular to the board run" for the perpendicular case, and it gives the user two sides to measure for 45 degree boards.
3. Joist count is `ceiling(length in inches / spacing) + 1`, so there is a joist at both ends. A partial last bay is included. Beams, the ledger, posts, and extra framing under a butt joint are not added. The brief asks for a joist count, not a full framing package.
4. The side gap is between boards only. The last board has no gap after it. Formula: `ceiling((covered inches + gap) / (board width + gap))`.
5. A stock board that is longer than the run is cut into whole rows (`floor(stock / run)`). A longer run is spliced. If the offcut is at least as long as the leftover piece, two rows share it. Otherwise every row buys a full extra stick. This avoids buying one 16 ft stick per 8 ft row, and it avoids pretending a 4 ft offcut can fill an 8 ft remainder.
6. Waste starts at 10 percent because the brief says 10 and no guide printed a waste percent. It is applied after the geometric count, then the purchase count rounds up once. Diagonal help text says to raise it, because that count assumes offcuts can be used. Waste is not auto-raised when the user picks diagonal.
7. Diagonal means 45 degrees, the maximum in IRC footnote a, and the angle in the Trex "4 inches less" sentence. Row count uses `(length + width) / √2`. Board footage uses deck area divided by the board-plus-gap pitch. Screws use that footage divided by `spacing × √2`. Diagonal butt-joint screws are not added.
8. Board width starts at 5.5 inches because the brief calls that typical. The 2026 Trex span section names 1x6, 1x4, and 2x6 and does not print a 5.5 inch face. The field is editable from 3 to 8 inches, and the page says to measure the board.
9. Side gap starts at 0.1875 inch (3/16) from the Trex guide, for every temperature. The allowed range is the brief's 0.0625 to 0.5 inch, so a wood job can enter a smaller gap. Composite under 3/16 sets "Side gap under 3/16 in" to 1. The Trex "do not exceed 1/2 inch" line is the top of the range.
10. End gaps are not subtracted. They are small next to a board run, and they change with temperature. The page lists the Trex end-gap table so the reader can leave those gaps while cutting. Overhang is not checked. The Trex maximum perpendicular overhang is 3/4 inch, stated as a limit, not applied to the length.
11. Screws per joist start at 2, from the Trex "two screws per joist" line and from IRC R507.7's two fasteners for wood. The range is the brief's 1 to 3, whole numbers only. 1 is allowed and labeled as below those guides. Hidden-clip counts are not estimated. The brief lists them as unverified.
12. Composite spacing uses a chart span of 16 or 24 inches, not one number for every product. 16 is the default because that is the 100 psf span for the common 1x6 boards and the guide's stiff-surface recommendation. At 45 degrees the limit is that span minus 4 inches (12 or 20). The 30 degree "half the chart" rule is explained and not applied, because the direction control is perpendicular or 45 degrees.
13. Commercial decks are not switched to 12 inches. The brief said the Trex guide uses 12 inches commercial. The 2026 chart text that was extracted does not say that. It ties span to product and psf, and it says some commercial work needs 100 psf or more. The common 1x6 row at 100 psf is 16 inches. Shipping 12 inches as a commercial fact would contradict the guide that was read.
14. Wood limits are the 2021 table only. 5/4 selects the 1-1/4 inch row. 2x selects the 2 inch row. Those are nominal names. Actual 5/4 decking is often about 1 inch thick, and a 2x is 1.5 inches thick. The page says so. The 2024 table was not checked, per the brief.
15. Board support is a choice: multiple span (default) or single span. IRC footnote c is about each board, not the deck. Inside 4 to 40 feet and 12/16/24 inch spacing, the deck always has at least three joists (a 4 foot side at 24 inches has three). The default matches a board that crosses those joists. Single span is there so a board cut onto only two joists can use the single-span column. Composite plus single span always warns, because Trex requires three joists. That warning can be 1 while inches over the limit are 0.
16. A spacing equal to the limit passes. Inches over the limit are 0 in that case.
17. Stair-tread spans from the Trex chart are not used. Stairs belong on the stair-stringer tool.
18. No prices. US units only. Purchase counts round up. Screws per square foot are rounded to hundredths with the shared `round` helper.
19. The shared frame cannot collapse Advanced, cannot hide the Trex chart span on a wood job, cannot show the words Pass and Warning, and has no reset button. Advanced is a visible group. The warning is the number 1 or 0, with the limit and the inches over it beside it.

## Open questions

For Matthew:

- Confirm the commercial decision. The brief said 12 inch commercial spacing. The 2026 chart that was read does not. This tool does not use 12 inches for commercial. Add a use switch only if you still want that number, and say which source it should follow.
- The Island County handout URL in the brief is a 404. The IRC citation is the ICC 2021 page. Say if you want a different public copy of the table.
- Two inputs were added beyond the brief's input table: Trex chart span (16 or 24) and board support (multiple or single). Defaults keep the brief's starting case (16 inch chart, multiple span, perpendicular composite, limit 16). Remove either one if the form should match the brief's table exactly. Without chart span, a 2x6 product that the guide lists at 24 inches would always be judged against 16. Without board support, the single-span IRC column never runs, because these deck sizes always have at least three joists.
- Add a 30 degree choice? The Trex guide sets that angle to half the chart span. This tool only has perpendicular and 45 degrees.
- Is the diagonal shopping count (area divided by board-plus-gap, offcuts assumed usable, then the waste percent) the rule you want? A stricter count, one stick per diagonal row, buys many more boards.
- Should choosing the 24 inch chart span show an extra note when the product row is the 91 psf or 75 psf line, not the 100 psf 2x6 line? Today the page explains those ratings, and 24 inch spacing on a 24 inch chart passes.
- 2024 IRC Table R507.7 was not opened. If the cells moved, the wood limits need an update.
- Actual face width by Trex product line is still an editable assumption at 5.5 inches.
- Hidden-fastener pieces per square foot are still omitted.

Frame limits, for a later infra change if you want them:

- No accordion, so the Advanced group (screws and waste) stays open.
- Results are numbers only, so the spacing check is 1 or 0 rather than the words Pass and Warning.
- No reset control.
- Related links render only for tool folders that exist. Stair Stringer and Fence are in `relatedTools` and will appear after those tools exist. Concrete Calculator is the link that renders today.

## Web Dev intake

- Unzip so the files land at `sites/home-project-calcs/tools/deck-board-calculator/`. The zip keeps that repo path and uses forward slashes. It does not contain `node_modules`, and it does not contain `src/pages/deck-board-calculator.astro`.
- Regenerate the page with `npm run new-tool -- --site home-project-calcs --tool deck-board-calculator --page-only`. A local page file was created so this workspace could build. Do not treat that file as part of the handoff.
- No package install, no lockfile edit, no shared-package edit.
- `npm run check` on this machine passed with the two expected placeholder warnings and no failures. The older Windows `ERR_UNSUPPORTED_ESM_URL_SCHEME` crash did not reproduce on current main.

## Zip layout

`deck-board-calculator.zip` from the repo root. Entry names:

```
sites/home-project-calcs/tools/deck-board-calculator/HANDOFF.md
sites/home-project-calcs/tools/deck-board-calculator/logic.js
sites/home-project-calcs/tools/deck-board-calculator/logic.test.js
sites/home-project-calcs/tools/deck-board-calculator/meta.json
sites/home-project-calcs/tools/deck-board-calculator/page.md
sites/home-project-calcs/tools/deck-board-calculator/tool.css
sites/home-project-calcs/tools/deck-board-calculator/ui.js
sites/home-project-calcs/tools/deck-board-calculator/assets/hero.svg
```

## Dependency requests

none
