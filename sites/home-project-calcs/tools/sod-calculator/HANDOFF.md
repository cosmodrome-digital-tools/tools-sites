# Handoff: sod-calculator

Built directly in the repo as part of the Nov 2026 site-wide redesign PR (not a zip handoff).

## What was built
- Tool slug: sod-calculator
- Tool name (meta.json "title"): Sod Calculator
- What it calculates, in one sentence: Square feet of lawn from up to three rectangles, and sod rolls and pallets at the supplier's sizes.
- Layout / chart style / accent chosen: split layout; bar chart of lawn/extra/spare; plan diagram with turf pattern; turf-green accent
- Group: B (not on the register: category fill)

## Sources used
- Sod Source Selection, Installation, Maintenance, and Producers in Virginia, publication 418-040 (Virginia Cooperative Extension, Virginia Tech): standard roll about 10 sq ft; pallets about 450 to 700 sq ft depending on the grower: https://www.pubs.ext.vt.edu/418/418-040/418-040.html (accessed 2026-11-11)
- Sod Installation and Maintenance, publication P2951 (Mississippi State University Extension): pallets typically 450 to 500 sq ft; buy about 5 percent more sod than you think you need: https://extension.msstate.edu/publications/sod-installation-and-maintenance (accessed 2026-11-11)
- How to Select and Install Sod (Texas A&M AgriLife Extension): measure the area and subtract the house and non-turf landscaping; some waste in installation from odd shapes: https://mytexas.ag.tamu.edu/publications/how-to-select-and-install-sod/ (accessed 2026-11-11)

Source checking note: this build session's container could not open external sites directly (outbound HTTP blocked; only web search worked). Sources dated 2026-10-06 were verified by the Content & SEO master build brief (Oct 2026). Sources dated 2026-11-11 were checked through web-search extracts of those pages. A reviewer should open each link once before merge.

## Test and build results
- `npm ci`: clean install, no new dependencies
- `npm test`: all suites pass (12 `it` blocks in this tool's logic.test.js, plus the shared diagram and title tests)
- `npm run build`: Complete!
- Known-answer cases and their references:
  - 30 x 20 -> 63 rolls, 2 pallets (page.md worked example, hand math)
  - two areas minus 120 sq ft -> 156 rolls, 4 pallets (hand math)
  - 1,000 sq ft, 500 sq ft pallets -> 3 pallets (2 with 0% extra) (hand math, MSU example)

## Decisions made (choice, source)
- Roll default 10 sq ft | Virginia Tech Extension 418-040 ("about 10 sq ft"; sizes vary)
- Pallet default 450 sq ft, editable 50 to 2,000 | MSU Extension (450 to 500) and Virginia Tech (450 to 700); lowest typical value so the count is not short
- Order about 5% extra | MSU Extension P2951
- No topsoil, compost, or seed | brief scope

## Open questions
- Not on the keyword register; chosen so Garden Beds and Lawn has two tools. Confirm with Content & SEO.

## Dependency requests
- none
