# Handoff: asphalt-calculator

Built directly in the repo as part of the Nov 2026 site-wide redesign PR (not a zip handoff).

## What was built
- Tool slug: asphalt-calculator
- Tool name (meta.json "title"): Asphalt Calculator
- What it calculates, in one sentence: Tons and cubic yards of hot-mix asphalt for a driveway or path from area and compacted thickness.
- Layout / chart style / accent chosen: split layout; bar chart of tons at 1 to 4 in with your thickness highlighted; box diagram with layers; blacktop accent
- Group: B (not on the register: category fill)

## Sources used
- Item 341, Dense-Graded Hot-Mix Asphalt, 2014 Standard Specifications (Texas Department of Transportation): thickness based on 110 lb per sq yd for each inch of pavement: https://ftp.txdot.gov/pub/txdot-info/cmd/cserve/specs/2014/standard/s341.pdf (accessed 2026-11-11)
- Instructional and Informational Memorandum IIM-LD-158 (Virginia Department of Transportation, Location and Design Division): application rate based on 110 lb per sq yd per inch of thickness: https://www.vdot.virginia.gov/media/vdotvirginiagov/doing-business/technical-guidance-and-support/technical-guidance-documents/location-and-design/migrated/iim/IIM158_acc03222023_PM.pdf (accessed 2026-11-11)
- Hot Mix Asphalt Paving, 2025 (Indiana Department of Transportation): 110 lb per sq yd is about 1 in of compacted depth; some aggregates weigh more or less: https://www.in.gov/indot/files/2025-Hot-Mix-Asphalt-Paving.pdf (accessed 2026-11-11)

Source checking note: this build session's container could not open external sites directly (outbound HTTP blocked; only web search worked). Sources dated 2026-10-06 were verified by the Content & SEO master build brief (Oct 2026). Sources dated 2026-11-11 were checked through web-search extracts of those pages. A reviewer should open each link once before merge.

## Test and build results
- `npm ci`: clean install, no new dependencies
- `npm test`: all suites pass (13 `it` blocks in this tool's logic.test.js, plus the shared diagram and title tests)
- `npm run build`: Complete!
- Known-answer cases and their references:
  - 40 x 12 ft, 3 in, 5% -> 9.24 tons, order 9.5 (page.md worked example, hand math)
  - same, 0% -> 8.8 tons, order 9 (hand math)
  - 2 in base + 1.5 in surface -> 10.78 tons, order 11 (hand math)

## Decisions made (choice, source)
- Spread rate 110 lb per sq yd per inch (about 146.7 lb/cu ft), editable 90 to 130 | TxDOT Item 341, VDOT IIM-LD-158, INDOT 2025 HMA Paving; labeled a planning rate
- Extra allowance 5% | no published figure; labeled our estimate (shared assumption in master brief)
- Tons to order rounded up to the next half ton | our choice, documented on page
- No sealer, tack coat, or base stone; no thickness design | brief scope

## Open questions
- Not on the keyword register; chosen so Driveways and Paths has two tools. Confirm with Content & SEO.

## Dependency requests
- none
