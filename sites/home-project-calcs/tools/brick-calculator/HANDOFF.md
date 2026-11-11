# Handoff: brick-calculator

Built directly in the repo as part of the Nov 2026 site-wide redesign PR (not a zip handoff).

## What was built
- Tool slug: brick-calculator
- Tool name (meta.json "title"): Brick Calculator
- What it calculates, in one sentence: Bricks and mortar for a wall or veneer from its face area.
- Layout / chart style / accent chosen: split layout; bar chart of net bricks vs waste; brick-pattern wall elevation; fired-clay red accent
- Group: B (not on the register: category fill)

## Sources used
- Technical Notes on Brick Construction 10, Dimensioning and Estimating Brick Masonry (Brick Industry Association, February 2009): Table 4, modular brick with 3/8 in joints, 6.75 per sq ft and 8.1 cu ft mortar per 1,000 brick; waste allowances: https://39589251.fs1.hubspotusercontent-na1.net/hubfs/39589251/Education/BIA%20Tech%20Notes%2010-dimensioning-and-estimating-brick-masonry.pdf (accessed 2026-11-11)

Source checking note: this build session's container could not open external sites directly (outbound HTTP blocked; only web search worked). Sources dated 2026-10-06 were verified by the Content & SEO master build brief (Oct 2026). Sources dated 2026-11-11 were checked through web-search extracts of those pages. A reviewer should open each link once before merge.

## Test and build results
- `npm ci`: clean install, no new dependencies
- `npm test`: all suites pass (13 `it` blocks in this tool's logic.test.js, plus the shared diagram and title tests)
- `npm run build`: Complete!
- Known-answer cases and their references:
  - 20 x 4 ft wall, modular -> 567 bricks, 5.25 cu ft mortar (page.md worked example, BIA TN 10)
  - two wythes 10 x 8 minus 20 sq ft -> 851 bricks, 7.87 cu ft (hand math)
  - custom 4.5/sq ft and 6.0 cu ft per 1,000, no waste -> 450 bricks, 2.7 cu ft (hand math)

## Decisions made (choice, source)
- Modular brick, 3/8 in joints: 6.75 per sq ft, 8.1 cu ft mortar per 1,000 bricks | BIA Technical Note 10, Table 4 (values cross-checked across several secondary pages in search because the PDF extract was partial)
- Brick waste 5% (BIA "at least 5%"); mortar waste 20% (middle of BIA 15 to 25%) | BIA Technical Note 10
- Other sizes: user-entered bricks per sq ft and mortar per 1,000 | no invented figures for queen/king/utility
- Mortar bags not estimated | no verified bag yield found

## Open questions
- Not on the keyword register; distinct from the Retaining Wall Block tool (SRW block). Confirm with Content & SEO.
- Re-check BIA TN 10 Table 4 values against the PDF before merge (network blocked here).

## Dependency requests
- none
