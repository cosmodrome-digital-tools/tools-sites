# Handoff: stair-stringer-calculator

Built directly in the repo as part of the Nov 2026 site-wide redesign PR (not a zip handoff).

## What was built
- Tool slug: stair-stringer-calculator
- Tool name (meta.json "title"): Stair Stringer Calculator
- What it calculates, in one sentence: Number of risers and treads, exact riser height, total run, stringer length and angle for a total rise, with an IRC riser/tread/uniformity check.
- Layout / chart style / accent chosen: split layout; no chart (the stringer diagram is the visual); cedar-brown accent
- Group: A (Oct 2026 register + master brief)

## Sources used
- 2021 International Residential Code Visual Interpretation (Stairway Manufacturers' Association, hosted by Viewrail): R311.7.5.1 risers 7 3/4 in maximum, R311.7.5.2 treads 10 in minimum, 3/8 in variation: https://www.viewrail.com/wp-content/uploads/2025/04/2021-International-Residential-Code-Visual-Interpretation.pdf (accessed 2026-10-06)
- R318.7.5.1 Risers, 2024 IRC (Stairway Manufacturers' Association blog): https://stairways.org/blog/r318-7-5-1-risers-2024/ (accessed 2026-10-06)
- R318.7.5.2 Treads, 2024 IRC (Stairway Manufacturers' Association blog): https://stairways.org/blog/r318-7-5-2-treads-2024/ (accessed 2026-10-06)
- 2024 International Residential Code, Chapter 3 Building Planning: Section R318.7.5 Stair treads and risers (International Code Council): https://codes.iccsafe.org/content/IRC2024P2/chapter-3-building-planning (accessed 2026-11-11)

Source checking note: this build session's container could not open external sites directly (outbound HTTP blocked; only web search worked). Sources dated 2026-10-06 were verified by the Content & SEO master build brief (Oct 2026). Sources dated 2026-11-11 were checked through web-search extracts of those pages. A reviewer should open each link once before merge.

## Test and build results
- `npm ci`: clean install, no new dependencies
- `npm test`: all suites pass (17 `it` blocks in this tool's logic.test.js, plus the shared diagram and title tests)
- `npm run build`: Complete!
- Known-answer cases and their references:
  - 60 in rise, 10 in tread -> 8 risers of 7 1/2 in, 70 in run, 92.2 in stringer (page.md worked example, hand math)
  - 37.5 in rise -> 5 risers, 54.83 in stringer (hand math)
  - 100 in rise, 11 in tread -> 13 risers of 7.6923 in, 165.6 in stringer, 1/16 in left over (hand math)

## Decisions made (choice, source)
- Riser max 7 3/4 in and tread min 10 in, 3/8 in variation | 2021 IRC R311.7.5.1/.2 (SMA visual interpretation) and 2024 IRC R318.7.5.1/.2 (SMA blog; ICC 2024 Chapter 3 shows the R318.7.5 heading)
- Max riser editable 4 to 9 in for local amendments (some use 8 1/4 in) | master brief section 6
- Risers = ceil(total rise / max riser); treads = risers - 1; stringer = sqrt(rise^2 + run^2) | standard stair layout geometry (hand math)
- Uniformity check: riser rounded to 1/16 in, accumulated error over the flight compared with 3/8 in | IRC 3/8 in variation limit; 1/16 in is tape resolution (our choice, documented on page)
- Shortest even-length board = stringer length rounded up to the next even foot | standard lumber lengths; page says to allow for top and bottom cuts
- Landing splits risers ceil(n/2) + floor(n/2), landing replaces one tread | master brief "split rise" option
- Left out (unverified in brief): headroom, width, 147 in max rise between landings, handrail/guard triggers, 2x12 throat, stringer spacing. The page says they are not checked.

## Open questions
- Edition select from the brief was replaced by showing both 2021 and 2024 section numbers on every check row (same limits). OK?

## Dependency requests
- none
