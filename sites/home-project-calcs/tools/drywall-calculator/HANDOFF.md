# Handoff: drywall-calculator

Built directly in the repo as part of the Nov 2026 site-wide redesign PR (not a zip handoff).

## What was built
- Tool slug: drywall-calculator
- Tool name (meta.json "title"): Drywall Calculator
- What it calculates, in one sentence: Drywall sheets for a room's walls and ceiling, joint compound, paper tape, and screws derived from IRC fastener spacing.
- Layout / chart style / accent chosen: split layout; bar chart of wall vs ceiling sheets; room diagram; slate-teal accent
- Group: A (Oct 2026 register + master brief)

## Sources used
- SHEETROCK Brand All Purpose Joint Compound, Ready-Mixed, submittal sheet J1969 (USG): approximate coverage per 1,000 sq ft of board: https://www.usg.com/content/dam/USG_Marketing_Communications/united_states/product_promotional_materials/finished_assets/sheetrock-all-purpose-joint-compound-submittal-J1969.pdf (accessed 2026-10-06)
- Joint Tapes, Industrial Construction data sheet MH1178 (USG): SHEETROCK Brand Joint Tape approximate coverage 370 ft per 1,000 sq ft of gypsum panels: https://www.usg.com/content/dam/USG_Marketing_Communications/united_states/product_promotional_materials/finished_assets/joint-tapes-industrial-construction-data-MH1178.pdf (accessed 2026-11-11)
- 2021 International Residential Code, R702.3.5 Application and Table R702.3.5, Minimum thickness and application of gypsum board (International Code Council): https://codes.iccsafe.org/s/IRC2021P2/part-iii-building-planning-and-construction/IRC2021P2-Pt03-Ch07-SecR702.3.5 (accessed 2026-11-11)
- 2024 International Residential Code, Chapter 7 Wall Covering (GSA Residential Code 2024, adopts the IRC 2024), UpCodes: gypsum board fastener spacing for walls and ceilings: https://up.codes/viewer/general-services-administration/irc-2024/chapter/7/wall-covering (accessed 2026-10-06)

Source checking note: this build session's container could not open external sites directly (outbound HTTP blocked; only web search worked). Sources dated 2026-10-06 were verified by the Content & SEO master build brief (Oct 2026). Sources dated 2026-11-11 were checked through web-search extracts of those pages. A reviewer should open each link once before merge.

## Test and build results
- `npm ci`: clean install, no new dependencies
- `npm test`: all suites pass (13 `it` blocks in this tool's logic.test.js, plus the shared diagram and title tests)
- `npm run build`: Complete!
- Known-answer cases and their references:
  - 12 x 12 x 8 room, ceiling, 30 sq ft openings, 4x8, 16 in, 10% -> 18 sheets, 5 gal, 185 ft tape, 539 screws (page.md worked example, hand math)
  - 4x12 on 24 in framing -> 13 sheets, 455 screws (hand math)
  - 10 x 10 walls only, 0% -> 10 sheets, 280 screws (hand math)

## Decisions made (choice, source)
- Compound 10 gal per 1,000 sq ft | USG All Purpose ready-mixed submittal J1969 (master brief)
- Tape 370 ft per 1,000 sq ft | USG Joint Tapes data sheet MH1178 (US source, replaces the brief's CGC Canada sheet)
- Screw spacing: ceilings 12 in; walls 16 in at 16 in framing, 12 in at 24 in framing (screws, no adhesive) | 2021 IRC Table R702.3.5; same values in the 2024 IRC per UpCodes (table number not cited for 2024 because the brief flagged possible renumbering)
- Screws per sheet = (floor(sheet length / framing) + 1) x (floor(48 / spacing) + 1), sheets hung horizontally | derived from the IRC spacing (unique addition)
- Waste 10% (editable 0 to 30) | no primary source; labeled as our estimate (master brief default)
- Mud and tape use board area before waste; sheets and screws use sheets to buy | our choice, documented on page

## Open questions
- Lightweight and setting-type compound are not estimated (no verified coverage).

## Dependency requests
- none
