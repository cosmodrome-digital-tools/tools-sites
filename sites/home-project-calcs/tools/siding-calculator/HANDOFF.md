# Handoff: siding-calculator

Built directly in the repo as part of the Nov 2026 site-wide redesign PR (not a zip handoff).

## What was built
- Tool slug: siding-calculator
- Tool name (meta.json "title"): Siding Calculator
- What it calculates, in one sentence: Squares (and optional cartons) of siding for house walls plus gable ends, with the VSI 10% waste allowance.
- Layout / chart style / accent chosen: split layout; bar chart of area parts; gable-end elevation diagram; navy accent
- Group: B (not on the register: category fill)

## Sources used
- Vinyl Siding Installation Manual, Estimating Required Materials (Vinyl Siding Institute, 2022 edition, hosted by the Polymeric Exteriors Coalition): squares of 100 sq ft, gable area, add 10% for waste: https://polymericexteriors.org/wp-content/uploads/2022/10/2022-Vinyl-Siding-Installation-Manual-ENGLISH_100322_LR.pdf (accessed 2026-11-11)
- Vinyl Siding Installation Manual, updated December 2007 (Vinyl Siding Institute): same estimating method and 10% waste factor: https://consensus.fsu.edu/FBC/soffit/VSI_2007Manual.pdf (accessed 2026-11-11)

Source checking note: this build session's container could not open external sites directly (outbound HTTP blocked; only web search worked). Sources dated 2026-10-06 were verified by the Content & SEO master build brief (Oct 2026). Sources dated 2026-11-11 were checked through web-search extracts of those pages. A reviewer should open each link once before merge.

## Test and build results
- `npm ci`: clean install, no new dependencies
- `npm test`: all suites pass (13 `it` blocks in this tool's logic.test.js, plus the shared diagram and title tests)
- `npm run build`: Complete!
- Known-answer cases and their references:
  - 40 x 30 x 9 with two 7.5 ft gables -> 17 squares, 9 cartons of 200 sq ft (page.md worked example, VSI method)
  - same minus 150 sq ft openings -> 15 squares (hand math)
  - hip roof 60 x 40 x 10 -> 22 squares (hand math)

## Decisions made (choice, source)
- Square = 100 sq ft; add 10% to all material estimates; gable = width x height / 2; openings not deducted by default | Vinyl Siding Institute installation manual (2022 and 2007 editions)
- Squares rounded up to whole squares | Cameron Ashley estimating guide practice seen in search; standard ordering
- Carton coverage optional (blank = skip) | coverage varies by product; no default invented
- Trim, starter, J-channel, soffit not estimated | no cited coverage

## Open questions
- Not on the keyword register; chosen to fill the Siding and Exterior category. Confirm the intent with Content & SEO.

## Dependency requests
- none
