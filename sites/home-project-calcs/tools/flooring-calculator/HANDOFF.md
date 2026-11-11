# Handoff: flooring-calculator

Built directly in the repo as part of the Nov 2026 site-wide redesign PR (not a zip handoff).

## What was built
- Tool slug: flooring-calculator
- Tool name (meta.json "title"): Flooring Calculator
- What it calculates, in one sentence: Boxes of flooring for up to four rooms entered in feet and inches, with layout waste and leftover square feet.
- Layout / chart style / accent chosen: split layout; bar chart of floor/waste/leftover; multi-room plan diagram; oak-amber accent
- Group: A (Oct 2026 register + master brief)

## Sources used
- ProGen Installation Instructions (Tarkett): add 10% for straight installations and 15% for diagonal installations: https://tarketthome.com/TarkettResidential/media/Tarkett-Residential/Product%20Documents/Hard%20Flooring/LVT/ProGen_InstallationInstructions.pdf?ext=.pdf (accessed 2026-10-06)

Source checking note: this build session's container could not open external sites directly (outbound HTTP blocked; only web search worked). Sources dated 2026-10-06 were verified by the Content & SEO master build brief (Oct 2026). Sources dated 2026-11-11 were checked through web-search extracts of those pages. A reviewer should open each link once before merge.

## Test and build results
- `npm ci`: clean install, no new dependencies
- `npm test`: all suites pass (14 `it` blocks in this tool's logic.test.js, plus the shared diagram and title tests)
- `npm run build`: Complete!
- Known-answer cases and their references:
  - 12 x 12, straight, 20 sq ft boxes -> 8 boxes, 1.6 sq ft left (hand math)
  - 12 ft 6 in x 10 + 8 x 8, diagonal, 23.4 sq ft boxes -> 10 boxes, 16.65 left (page.md worked example)
  - four rooms, 20% custom, 30 sq ft boxes, 2 spares -> 18 boxes (hand math)

## Decisions made (choice, source)
- Straight 10%, diagonal 15% | Tarkett ProGen installation instructions (master brief)
- Herringbone/other: user-entered waste, default 10, no published figure claimed | master brief marks herringbone unverified
- Box coverage default 20 sq ft, editable 1 to 100 | master brief default; page tells readers to use their label
- Up to 4 rooms via a room-count select with showIf | shared frame has fixed inputs, so a dynamic "add room" list was not possible

## Open questions
- A truly dynamic "add room" button would need a shared-frame repeater component; four rooms covers the brief's multi-room need for now.

## Dependency requests
- none
