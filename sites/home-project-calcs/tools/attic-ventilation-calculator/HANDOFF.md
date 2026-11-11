# Handoff: attic-ventilation-calculator

Built directly in the repo as part of the Nov 2026 site-wide redesign PR (not a zip handoff).

## What was built
- Tool slug: attic-ventilation-calculator
- Tool name (meta.json "title"): Attic Ventilation Calculator
- What it calculates, in one sentence: Required attic net free ventilating area (1/150 or 1/300) split into intake and exhaust, and feet or counts of vents.
- Layout / chart style / accent chosen: split layout; bar chart of intake vs exhaust; attic cross-section with airflow; airflow-blue accent
- Group: B (not on the register: category fill)

## Sources used
- R806.2 Minimum Vent Area, 2021 International Residential Code (UpCodes): 1/150 of the vented space; 1/300 when the exception's conditions are met, including 40 to 50 percent from upper ventilators: https://up.codes/s/minimum-vent-area (accessed 2026-11-11)
- Calculating Attic Passive Ventilation (Building America Solution Center, Pacific Northwest National Laboratory, U.S. Department of Energy): https://basc.pnnl.gov/information/calculating-attic-passive-ventilation (accessed 2026-11-11)
- ShingleVent II ridge vent product sheet (Air Vent): 18 sq in of net free area per linear foot: https://pdf.lowes.com/productdocuments/02819b27-0dec-4089-aa7b-8782262b4743/48329704.pdf (accessed 2026-11-11)
- Air Vent Continuous Aluminum Soffit and Under Eave Vent product listing (Do it Best): 9 sq in of net free area per linear foot: https://www.doitbest.com/product/120247/air-vent-mill-continuous-aluminum-soffit-and-under-eave-vent-retrofit-120247/ (accessed 2026-11-11)

Source checking note: this build session's container could not open external sites directly (outbound HTTP blocked; only web search worked). Sources dated 2026-10-06 were verified by the Content & SEO master build brief (Oct 2026). Sources dated 2026-11-11 were checked through web-search extracts of those pages. A reviewer should open each link once before merge.

## Test and build results
- `npm ci`: clean install, no new dependencies
- `npm test`: all suites pass (14 `it` blocks in this tool's logic.test.js, plus the shared diagram and title tests)
- `npm run build`: Complete!
- Known-answer cases and their references:
  - 1,200 sq ft at 1/150 -> 1,152 sq in, 64 ft soffit, 32 ft ridge (page.md worked example, hand math)
  - same at 1/300 -> 576 sq in, 32 ft, 16 ft (hand math)
  - 1,000 sq ft at 1/300, 40% exhaust via 50 sq in box vents -> 4 vents, 32 ft soffit (hand math)

## Decisions made (choice, source)
- 1/150, and 1/300 when both exception conditions are met (40 to 50% upper vents within 3 ft of the ridge; Class I/II vapor retarder in zones 6 to 8) | 2021 IRC R806.2 via UpCodes (search extract). The tool enforces the 40 to 50% share for 1/300 and tells readers to confirm the vapor-retarder condition
- Local ratio override 50 to 600 | brief "allow a local override"
- Default 50% exhaust share | simple even split; not a code requirement for 1/150 (stated on page)
- Default NFA: 9 sq in per ft continuous soffit (Air Vent), 18 sq in per ft ridge (Air Vent ShingleVent II) | manufacturer product listings; editable, page says to use your label

## Open questions
- Not on the keyword register; chosen so Insulation and Energy has two tools. Confirm with Content & SEO.
- Search results disagreed on "both" vs "one or more" conditions for the 1/300 exception (Philadelphia amendment uses "one or more"). We follow the UpCodes 2021 IRC text ("both"). Re-check before merge.

## Dependency requests
- none
