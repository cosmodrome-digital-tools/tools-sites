# Handoff: retaining-wall-block-calculator

## What was built
- Tool slug: retaining-wall-block-calculator
- Tool name (meta.json "title"): Retaining Wall Block Calculator
- What it calculates, in one sentence: Wall blocks, caps, a 6 inch compacted leveling pad, drainage stone, and drainpipe feet for a straight run or a fire-pit circle, plus a 1/0 height flag from the 2015 IRC R404.4 excerpt.
- Layout / chart style / accent chosen: stepper layout, donut chart (blocks vs caps), brick accent `#6e3328` on a limestone surface (`#f6f1e8`), 8px corners, Trebuchet MS display font.

## Zip path and layout
- Zip path: `retaining-wall-block-calculator.zip` at the repo root.
- `Compress-Archive -Path sites/home-project-calcs/tools/retaining-wall-block-calculator` stores only the leaf folder (`retaining-wall-block-calculator\...`) and uses backslashes. That is not the layout in `docs/BUILDING-TOOLS.md`.
- The delivered zip was rebuilt so every entry uses the repo path and forward slashes: `sites/home-project-calcs/tools/retaining-wall-block-calculator/<file>`.
- The zip does not include `src/pages/retaining-wall-block-calculator.astro`, `node_modules`, or anything outside the tool folder. Web Dev regenerates the page with `npm run new-tool -- --site home-project-calcs --tool retaining-wall-block-calculator --page-only`.

## Sources used
- Belgard, SRW Quick Reference Install Guide (2023) — https://www.belgard.com/wp-content/uploads/sites/2/Belgard-SRW-Quick-Reference-Install-Guide-2023-1.pdf — accessed 2026-10-06. Supports the trench 12 inches wider than the block, the pad extending at least 6 inches in front and 6 inches behind and at least 6 inches deep after compaction, burying at least 6 inches of the first course, 3/4 inch minus for the pad, 12 inches of 3/4 inch free-draining aggregate behind every course, the pipe set low behind the wall, 4 inch or 6 inch perforated tile, an outlet through the face every 50 feet on center, optional filter fabric, hollow-core fill, setback by lip or pin, and geogrid only past a product's gravity-wall height with an engineer. It does not give a block face size, a cap size, a waste percent, a stone density, or a fire-pit formula.
- ICC, Significant Changes to the International Residential Code, 2015 Edition, R404.4 — http://media.iccsafe.org/news/icc-enews/2017v14n3/2015_irc_sigchanges_404.4.pdf — accessed 2026-10-06. Supports the 2015 wording: walls not laterally supported at the top that retain in excess of 48 inches of unbalanced fill, or walls exceeding 24 inches in height that resist lateral loads in addition to soil, shall be designed by accepted engineering practice. The same page's change summary also says "more than 24 inches of unbalanced backfill" for the extra-load case. The excerpt says the section does not apply to foundation walls that support buildings, and it names a 1.5 safety factor against sliding and overturning. It does not verify the 2021 or 2024 books.
- NIST Handbook 44 (2026), Appendix C — https://www.nist.gov/document/2026-nist-handbook-44-appendix-c — accessed 2026-10-06. Supports only the unit facts: 12 inches = 1 foot, 27 cubic feet = 1 cubic yard, and an unmodified ton is the 2,000 pound short ton. It does not support the 1.40 density or any block size.

## Test and build results
- `npm ci`: added 250 packages, and audited 257 packages in 47s. npm also printed a pre-existing "3 high severity vulnerabilities" notice. No packages were added or updated. `npm` was not on PATH; the commands used `C:\Users\matth_uq2w7e7\OneDrive\Desktop\GrokBot Websites\nodejs`.
- `npm test`: pass. This tool: 20 tests passed in `tools/retaining-wall-block-calculator/logic.test.js` (6 known-answer cases, 5 height-check cases, edge cases, and the scaffold guard). Site workspace total: 96 passed, 2 skipped (the template guard). calculator-core 15 passed, seo 8 passed, scaffold script tests 5 passed.
- `npm run build`: `Complete!` — 10 pages built, including `/retaining-wall-block-calculator/`. The homepage lists it under Garden walls.
- `npm run check`: the repo script crashes on this Windows machine before it prints results (`ERR_UNSUPPORTED_ESM_URL_SCHEME` while importing `site.config.mjs` by a `C:\` path). `scripts/` was not changed. The same checks, run from a temporary copy that imports the config with a `file://` URL, finished with 0 failures and the two expected warnings: placeholder domain (`contact@todo-domain.example`) and `ads.txt` with no real publisher ID.
- Known-answer cases (hand math, checked in `logic.test.js`):
  - Opening straight wall, 20 ft × 24 in exposed, bury 6, block 16×6×10, cap 16, waste 5%, density 1.40 → 5 courses, 15 blocks per course, 79 blocks, 15 caps, pad 0.68 cu yd and 0.96 tons, drainage 1.86 cu yd, pipe 20 ft, flag 0. This is the worked example. Chart: 79 blocks and 15 caps.
  - 27 ft, exposed 18, block 12×6, depth 12, cap 12, waste 0, density 1.40 → 108 blocks, 27 caps, pad 1 cu yd and 1.4 tons, drainage 2 cu yd.
  - Circle, 4 ft inside diameter, exposed 12, same opening block → 10 per course, 3 courses, 32 blocks, 10 caps, pad 0.52 cu yd and 0.73 tons, drainage 1.17 cu yd, pipe 18 ft.
  - 40 ft straight run → 158 blocks, 30 caps, pad 1.36 cu yd and 1.91 tons, drainage 3.71 cu yd, pipe 40 ft.
  - Exposed 25 in → 6 courses, stack 36 in, built exposed 30 in, 95 blocks, drainage 2.23 cu yd.
  - 10 ft, exposed 20, bury 4, cap 10, density 1 → 34 blocks, 12 caps, pad 0.34 cu yd and 0.34 tons, drainage 0.75 cu yd.
  - Height table in `page.md`: 48 in off stays 0; 54 in off is flag 1 and 6 in over; surcharge on at 24 in stays 0; surcharge on at 30 in is flag 1; typed 46 in with 8 in blocks builds a 50 in face, flag 1, 111 blocks.
- Page check in headless Edge (built page): the opening form showed 79 blocks, 15 caps, flag 0, 0.68 cu yd, 0.96 tons, 1.86 cu yd, and 20 ft. Switching to a 4 ft circle at 12 in exposed showed 32 blocks, 10 caps, 0.52 / 0.73 / 1.17, and 18 ft. Exposed height 54 with surcharge off showed flag 1 and 6 inches over. An empty length showed "Enter length or diameter." and cleared the chart. Exposed 46 with an 8 in block showed flag 1, a 50 in face, and 111 blocks. Gravel still opened at 11.5 tons / 8.2 yards, and mulch still opened at 25 bags / 1.85 cu yd. Desktop (1280×900) and phone (390×844) screenshots showed the form starting under the intro. On the phone the form top was about 524 px, inside an 844 px screen.

## Assumptions (each one, and why)
- Straight wall is the starting shape. The brief's default is Straight. Circle is the fire-pit mode.
- One box, Length or diameter, is the wall run in feet or the open inside diameter in feet. The form cannot change a label when the shape changes. The 20 foot start is a straight-wall length. A fire-pit user has to type a smaller diameter. The allowed range is 2 to 200 feet, from the brief.
- Exposed height starts at 24 inches and allows 6 to 96. Buried depth starts at 6 and allows 4 to 12. Those are the brief's defaults and ranges. Belgard's cited minimum burial is 6 inches, so 4 or 5 is below that guide and is still allowed so a different product sheet can be typed in.
- Block face starts at 16 by 6 inches, block depth at 10, cap length at 16. The brief gives those as product-specific placeholders. They are not from a block catalog. Help text says to measure the block.
- Surcharge is a two-choice menu (Off / On), not a toggle. The shared form only allows number and select inputs. Off is the default. On means something besides soil pushes on the wall (the brief's driveway example, plus parked vehicles and a fence on top from the 2015 change note).
- Block waste starts at 5 percent and allows 0 to 15. No manufacturer sheet gives that 5 percent. It applies to wall blocks only. Caps round up to a whole cap and do not get the percent. Say if caps should share the waste.
- Courses cover exposed height plus buried depth, then round up to a whole course. Stack height is courses times block height. Exposed height of the stack is stack height minus buried depth. The height flag uses that built face, which can be taller than the number typed when the block height does not divide evenly. The opening example divides evenly, so both numbers are 24.
- The flag is 1 only when the built face is over the limit. Exactly 48 inches with surcharge off stays 0. Exactly 24 inches with surcharge on stays 0. The limits are "in excess of 48" and "exceeding 24" from the 2015 excerpt. The check assumes the wall is not supported at the top. Exposed stack height stands in for both "unbalanced fill" and "height." Surcharge On stands in for "lateral loads in addition to soil."
- The 48 and 24 inch figures are from the 2015 significant-changes excerpt only. The 2021 and 2024 text was not checked. The page says so in the intro, the help text, the formula, the FAQ, and the closing note. Do not treat them as the current code until that check is done.
- Permit height is not given. The brief says there is no national figure. The page tells the reader to call the local building department.
- Geogrid is left out, as the brief requires. So are hollow-core fill, filter fabric, corner blocks, setback shortening, and the 1.5 safety factor. The Belgard guide mentions each of those as product-specific or optional.
- The pad is exactly 6 inches thick after compaction, and the trench is exactly 12 inches wider than the block (6 in front and 6 behind). Those are the Belgard minimums, used as the recipe. They are not inputs. No loose-stone compaction percent is added, because the guide does not give one. The pad is as long as the straight wall. Extra length past the two ends is not added.
- Drainage stone is a zone exactly 12 inches thick for the full stack, buried courses included, because the guide says to place that stone for every course and to set the pipe low. The 6 inches of low-permeability soil at the top of the grade is not subtracted, so the stone line can run a little high.
- Drainage is cubic yards only. Clean-stone density was not in the sources. Pad tons use an editable density that starts at 1.40 short tons per cubic yard. That 1.40 is the site's unverified aggregate estimate, not a Belgard number. The box allows 1.00 to 2.00, the same window as the gravel tool. That window is a form limit, not a measured range.
- Yards and tons round up to the next hundredth. Pipe rounds up to the next whole foot. Blocks and caps round up to the next whole unit. An exact value stays exact. The guide's outlet leg every 50 feet is not added, because the guide does not say how long that leg is. Pipe diameter is not chosen. The guide allows 4 inch or 6 inch tile.
- A circle counts blocks and caps along the inside circumference. The pad is a ring 6 inches inside the opening and 6 inches outside the block. Drainage is a 12 inch ring outside the blocks. Pipe length is the circumference at the back of the block. Setback is not applied, so every course uses the same circle. A patio fire pit that does not hold soil may not need the drainage ring or a full loop of pipe. The numbers still show.
- The same 48/24 flag runs for a circle. A freestanding fire pit is called out as a different kind of project.
- There are no prices. Units are US feet, inches, cubic yards, and short tons.
- Related tools are listed as `paver-patio-calculator`, `gravel-calculator`, and `mulch-calculator`. On this machine only Gravel and Mulch have folders, so the built page links those two. The paver link appears after that folder exists.

## Open questions
- Say if the height flag should use the typed exposed height instead of the stacked face. Today, typing 46 inches with an 8 inch block builds a 50 inch face and turns the flag on.
- Say if caps should get the same waste percent as blocks.
- Say if pad thickness (fixed at 6 inches) and drainage thickness (fixed at 12 inches) should become inputs. Other brands were not checked.
- Say if drainage stone should also get a tons line, with its own density. Clean stone and 3/4 inch minus can weigh different amounts, so tons were left off the drainage line.
- Say if the 1.40 default, or the 1.00 to 2.00 window, should change after you get a supplier figure.
- Say if buried depth should refuse numbers under Belgard's 6 inch minimum. The brief's range starts at 4, so 4 and 5 still calculate.
- Say if circle diameter should mean the outside of the ring instead of the open inside.
- Say if pipe should add a guessed outlet leg. The guide says every 50 feet and does not give the length, so nothing was added.
- The shared form cannot show a text banner, hide Advanced, or offer a real on/off switch. Above cited limit is the number 1 or 0, and it is one of the three large results, so a normal wall shows a large 0. Say if that 0 should be a smaller line instead.
- The shared form has no Reset button. Reloading the page restores the defaults.
- Title plus benefit is "Retaining Wall Block Calculator - Blocks and Gravel" (52 characters before the site name). The guide aims for about 45. The brief's display name is already 32 characters, so the aim cannot be met without shortening the name.
- `git checkout main` failed because this copy has no `main` branch. `git pull` failed because the remote ref `chore/monorepo-scaffold` was not found. The tool was built on the local `chore/monorepo-scaffold` commit that was already in the folder. Nothing was committed, pushed, or deployed.

## Anything Web Dev must fix on intake
- Unzip so the folder lands at `sites/home-project-calcs/tools/retaining-wall-block-calculator/`. Regenerate `src/pages/retaining-wall-block-calculator.astro` with `--page-only`. The astro file is not in the zip.
- Placeholder domain and `ads.txt` warnings are expected. They are not defects in this tool.
- No code change is required for the Windows `npm run check` crash. Leave `scripts/` alone. CI on Linux should not hit it.
- Do not treat the 48 inch / 24 inch flag as verified against the 2021 or 2024 IRC. The page already says the 2015 excerpt is the source and later editions were not checked.

## Dependency requests
none
