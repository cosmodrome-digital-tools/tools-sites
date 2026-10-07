# Handoff: fence-calculator

## What was built
- Tool slug: fence-calculator
- Tool name (meta.json "title"): Fence Calculator (benefit: "Posts, Pickets, and Post Concrete")
- What it calculates, in one sentence: Posts, rails, and pickets for one wood fence line with gates, plus the hole size, bags per post, total bags of post-setting concrete, and gravel for every post using Quikrete's 3x-wide, 1/3-deep hole rule with a frost-depth field.
- Layout / chart style / accent chosen: **stepper** layout (5 steps: Fence line, Posts, Pickets, Post concrete, Advanced), **donut** chart (first tool on the site to use it), deep indigo accent `#3730a3` on a cool lavender-grey surface `#f3f3f9`, square corners, Franklin Gothic / Arial Narrow display font. Step badges are shaped like dog-ear picket tops on a fence-line rule. The results show four indigo shopping-list tiles (posts, rails, pickets, bags) in a 2x2 grid, then three labeled groups: Fence layout, Each post hole, Totals and post check. The donut splits one post hole into concrete, gravel base, and buried post (cu ft). The new hero SVG shows a post in a concrete-filled hole on gravel with dog-ear pickets (decorative, `heroAlt: ""`).
- Existing looks avoided: concrete split/bar/slate, rebar stepper/line/rust, gravel split/bar/teal, mulch stepper/line/bark green, paver stacked/bar/moss. Stepper is shared with rebar and mulch (only 3 layouts exist), but the donut chart, indigo palette, square picket badges, and tile results make it look different.

## Sources used
- QUIKRETE "Setting Posts" project guide — https://www.quikrete.com/pdfs/projects/settingposts.pdf — accessed 2026-10-06 (per the brief). Supports: hole diameter = 3 × post width; 1/3 of the post's overall length buried; 6 in gravel base. **Caveat:** I downloaded the PDF on 2026-10-07 but its text is embedded as encoded glyphs and I could not read it, so I am relying on the brief's "verified" summary. Please eyeball the PDF to confirm the 1/3 is of overall length (not of above-ground height) and the 6 in gravel figure. It is a manufacturer project method, not a building code; the page says so.
- QUIKRETE Fast-Setting Concrete Mix No. 1004 data sheet — https://www.quikrete.com/pdfs/data_sheet-fast%20setting%20concrete%20mix%201004-50.pdf — accessed 2026-10-06. Supports: 50 lb = 0.375 cu ft, 60 lb = 0.45 cu ft. Same PDF-text caveat; the values match the brief and the already-merged Concrete Calculator.
- QUIKRETE Concrete Mix No. 1101 data sheet — https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf — accessed 2026-10-06. Supports: 80 lb = 0.60 cu ft (the brief says "see Concrete brief"; the value matches the merged Concrete Calculator's `BRANDS.quikrete1101`).
- No source is cited for: 8 ft post spacing, 5% picket waste, 4x4 = 3.5 in / 6x6 = 5.5 in actual, 5.5 in picket width, or the 811 note. All are labeled on the page as rules of thumb / our estimates / standard sizes not re-checked, per the brief's unverified list.

## Test and build results
Run from the repo root on Windows, Node 22.14.0:
- `npm ci`: `added 250 packages, and audited 257 packages in 37s` (plus the pre-existing "3 high severity vulnerabilities" notice; nothing was installed or changed).
- `npm test` (rerun 2026-10-07 after the 9 ft default change): all pass. This tool: **28 passed** in `tools/fence-calculator/logic.test.js`. Site workspace: 190 passed, 2 skipped (template guard). calculator-core 15 passed, seo 8 passed, scaffold script tests 5 pass / 0 fail.
- `npm run build` (rerun after the change): `13 page(s) built` … `[build] Complete!`, including `/fence-calculator/index.html`.
- `npm run check`: `checks: 1 site(s), 0 failure(s), 2 warning(s)`. The two warnings are the expected placeholder contact email and ads.txt publisher ID. (On this machine the check script ran without the Windows import crash earlier tools hit.)
- Known-answer cases (all hand math, written out in the test file):
  1. **Worked example / defaults:** 100 ft, 6 ft tall, 8 ft spacing, 4x4 × 9 ft posts, one 4 ft gate, 5.5 in pickets + 0.5 in gap, 3 rails, 5% waste, no frost, 50 lb Fast-Setting → run 96 ft, 12 sections, **14 posts, 36 rails, 202 pickets (192 before waste), 58 bags**; hole 10.5 in × 42 in; 1.549 cu ft and 4.13 bags per post; 21.68 cu ft concrete; 4.21 cu ft gravel; 6 ft above ground; shortest post 9 ft.
  1b. Same fence with an 8 ft post (the brief's original default) → hole 38 in, 1.377 cu ft and 3.67 bags per post, 52 bags, 5.33 ft above ground.
  2. 60 ft, 6x6 × 10 ft, 6 ft spacing, no gates, 2 rails, 80 lb Concrete Mix, 3.5 in pickets no gap, 0% waste → 11 posts, 20 rails, 206 pickets, hole 16.5 × 46 in, 4.249 cu ft and 7.08 bags per post, 78 bags.
  3. 8 ft post, frost depth 36 in, 60 lb Fast-Setting → hole 42 in, 1.549 cu ft per post, 21.68 cu ft, 49 bags, 5 ft above ground.
  4. Frost 72 in, 8 ft fence → shortest post 14 ft.
  5. Board-on-board, 1 in overlap (gap −1) → 256 pickets before waste, 269 with 5%.
  6. 50 ft with two 4 ft gates → 42 ft run, 6 sections, 7 ft actual spacing, 9 posts.
  7. The page.md length table rows (50/100/150/200 ft) and the donut values/labels.
  - Edge cases: zero, negative, very large, empty, non-numeric, unknown select values, fractional gates, gates wider than the fence, overlap ≥ half the picket width, the largest allowed job, and just-inside / just-outside both limits of every numeric input.
- Browser check (built site via `astro preview`, in-app browser, done before the 9 ft change; layout and CSS are unchanged since): defaults showed 14 / 36 / 202 / 52 with the old 8 ft post; 30 gates shows "Number of gates must be 10 or less."; gap −3 shows "Picket gap must be at least -2."; at 375 px wide there is no sideways scroll and the form starts about 490 px down, above the fold; the step badges, result tiles, group labels, and donut render as intended.

## Zip path and layout
- Zip path: `fence-calculator.zip` at the repo root.
- Every entry uses the repo path with forward slashes: `sites/home-project-calcs/tools/fence-calculator/<file>`, i.e.
  - `sites/home-project-calcs/tools/fence-calculator/HANDOFF.md`
  - `sites/home-project-calcs/tools/fence-calculator/logic.js`
  - `sites/home-project-calcs/tools/fence-calculator/logic.test.js`
  - `sites/home-project-calcs/tools/fence-calculator/meta.json`
  - `sites/home-project-calcs/tools/fence-calculator/page.md`
  - `sites/home-project-calcs/tools/fence-calculator/tool.css`
  - `sites/home-project-calcs/tools/fence-calculator/ui.js` (unchanged from the template)
  - `sites/home-project-calcs/tools/fence-calculator/assets/hero.svg`
- Not included: `src/pages/fence-calculator.astro`, `node_modules`, package files, or anything outside the tool folder. Web Dev regenerates the page with `npm run new-tool -- --site home-project-calcs --tool fence-calculator --page-only`.

## Assumptions (each one, and why)
- **One continuous fence line.** Sections = run ÷ spacing rounded up; posts = sections + 1 + gates. Corners and separate runs are not modeled (the frame has no per-side input); the page tells readers how to handle them by hand.
- **Each gate adds exactly one post** (brief: "extra posts at openings"). Checked: one gate in the middle or at the end of a 96 ft run at 8 ft spacing both give 14 posts with this formula.
- **Gate openings are subtracted from the run** (brief) and **no pickets or rails are counted for the gates themselves.** Many gates are bought pre-built; see Open questions.
- **Rails = sections × rails per section,** one rail per section per row, each about as long as the actual post spacing. No waste on rails (the brief lists none).
- **Pickets are continuous along the run** (face-mounted, posts don't interrupt) and count = run in inches ÷ (picket width + gap), rounded up, then × (1 + waste%), rounded up.
- **Board-on-board as a negative gap.** The brief asks for this but its table range is 0–2 in. I widened the range to **−2 to +2 in** so the documented negative gap works, and added a rule that the overlap must be less than half the picket width (otherwise front-row pickets would touch). With overlap *o* on each edge, each picket covers width − *o*, which is exactly the board-on-board count. Flagged below.
- **Post widths 3.5 in (4x4) and 5.5 in (6x6)** — standard dressed sizes, labeled "not re-checked" per the brief.
- **Hole diameter = 3 × post width; post buried 1/3 of its overall length; 6 in gravel below** (Quikrete guide via the brief). Fixed, not user-editable, per brief section 8.
- **Frost depth:** buried depth = the larger of (post length ÷ 3) and the frost depth, so the bottom of the concrete reaches the frost line. Hole depth = that + 6 in. Default 0 (no national figure).
- **Concrete fills from the top of the gravel to grade,** with the post's square cross-section subtracted. The gravel is a full 6 in cylinder (post sits on it, not subtracted). No crown/slope or below-grade stop.
- **Bags:** total bags = all-post concrete ÷ yield, rounded up once (bags can be shared between holes). Bags per post is shown to 2 decimals; the page explains rounding per hole instead (70 vs 58 bags in the example). No waste on concrete (the brief lists none).
- **Fence height** is used for the post-length check: post height above ground = post length − buried depth; shortest post = max(1.5 × height, height + frost ÷ 12). 
- **Default post length is 9 ft, not the brief's 8 ft** (changed at Matthew's request, 2026-10-07). With the 1/3 rule, a 9 ft post stands exactly 6 ft out of the ground for the default 6 ft fence; an 8 ft post would stand 5.33 ft. The range stays 5–12 ft. The worked example, both page.md tables (a 9 ft row was added to the bags-per-post table), and the tests use 9 ft; the page still explains what an 8 ft post gives.
- **Picket waste 5%** default, 0–15% (brief; no primary source; labeled as our estimate).
- **Gravel** is reported in cubic feet only. No gravel bag count, because no gravel bag size was sourced.
- **No hardware, fasteners, stain, or prices.**
- **Advanced inputs** (gate width, rails per section, frost depth, picket waste) live in the last step, labeled "Advanced: gates, rails, frost, waste", because the shared frame has no accordion (same approach as the Concrete and Mulch tools).

## Open questions (for Matthew)
- **Picket gap range:** I used −2 to +2 in (brief table says 0–2 but also says to support a negative overlap). OK, or should board-on-board be dropped / become its own select?
- **Gate materials:** gates add a post but no pickets or rails. Should gate leaves be counted with the same pickets and rails?
- **Quikrete PDF wording:** please confirm in the PDF that the 1/3 is of the post's overall length and the gravel is 6 in. If the guide actually means 1/3 of the *above-ground* height, the depth formula and every table on the page change.
- **Default post length:** resolved. Changed to 9 ft per Matthew (brief said 8 ft). Content & SEO may want to update the brief to match.
- **Post spacing default 8 ft** remains an unverified rule of thumb (brief).
- **Picket counts per pre-built panel** are not covered (brief: product-specific, unverified); the FAQ says to count the panel you buy.
- **FAQ questions** come from the brief's Google autocomplete list; People Also Ask was not captured (brief note). The extra "Fast-Setting vs Concrete Mix" FAQ is mine; cut it if you only want brief-sourced questions.
- **Related tools:** `concrete-calculator`, `gravel-calculator`, `deck-board-calculator`. The deck board tool doesn't exist yet, so the built page links only the first two until it does. The body copy links to `/gravel-calculator/`.
- **Results group labels** ("Fence layout", "Each post hole", "Totals and post check") are CSS `::before` text keyed to output order (5th, 9th, 13th output). If outputs are reordered in meta.json, update tool.css too. A real output-group feature in the shared frame would be cleaner (infra change, not done here).

## Anything Web Dev must fix on intake
- Nothing known. Regenerate the page file with `--page-only`; tests, build, and check pass locally.
- The repo root has untracked files from other runs (`concrete-calculator.zip`, `rebar-calculator.zip`, `paver-patio-calculator.zip`, `prompts/`, and the paver tool folder/page). I did not touch them.

## Dependency requests
- none
