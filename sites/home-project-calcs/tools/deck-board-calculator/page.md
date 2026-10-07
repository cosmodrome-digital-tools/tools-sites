## What it calculates and who it's for

This calculator estimates deck boards, joists, and face screws for a rectangular deck in feet and inches. It is for a homeowner laying out a ground-level or raised deck surface before a lumber run.

It also checks the joist spacing you picked. Wood uses 2021 IRC Table R507.7. Composite uses the 2026 Trex span chart, including that guide's 45 degree reduction and its three-joist rule. The check is a comparison with those two sources. It is not a structural design.

## How to use

The results update as you change a field. Calculate runs the same check.

1. Under Deck, enter the length and the width in feet. Length is the side you space the joists along. Width is the side each joist spans. For diagonal boards, those two boxes are the outside sides of the rectangle.
2. Under Boards, choose the material, the face width, the stock length, the side gap, and perpendicular or 45 degree boards.
3. Under Joists, choose 12, 16, or 24 inches on center. For composite, pick the Trex chart span that matches your product row. Leave Board support on multiple span unless each board sits on only two joists.
4. Under Advanced, set face screws per joist and a waste percent. The boxes start at 2 screws and 10 percent.
5. Read boards to buy, joists, face screws, and the spacing warning. A warning of 1 means the spacing is over the limit, or a composite board is marked as sitting on only two joists.

## The formula

Deck length and deck width are in feet. Board width, side gap, and joist spacing are in inches. One foot is 12 inches.

**Joists.** Joists are spaced along the deck length, with one joist at each end.

`joists = ceiling(length in inches / joist spacing) + 1`

A 12 foot side at 16 inches is 144 / 16 = 9 spaces, plus the first joist, which is 10 joists. A 13 foot side is 156 / 16 = 9.75, which rounds up to 10 spaces, plus the first joist, which is 11. The last bay is shorter than the spacing you picked.

**Perpendicular rows.** The gap sits between boards. The last board does not get a gap after it.

`rows = ceiling((width in inches + side gap) / (board width + side gap))`

**Perpendicular boards to buy.** Compare the board run (the deck length) with the stock length.

- When the stock is at least as long as the run, one stick is cut into as many whole rows as will fit. The stick count is `rows / floor(stock length / run length)`. That can be a fraction of a stick. The only round-up is after waste.
- When the run is an exact number of sticks, every row uses that many sticks, and each row has one fewer butt joint than the number of pieces.
- When the run is longer than the stock and the offcut is at least as long as the leftover piece, two rows share that offcut. For 17 rows on an 18 foot run with 12 foot sticks, the remainder is 6 feet and the offcut is 6 feet, so eight pairs use 3 sticks and the last row uses 2: 8 × 3 + 2 = 26 sticks.
- When the offcut is shorter than the leftover piece, every row buys a full extra stick and the offcut is not reused.

Waste is applied after that count, then the result rounds up to a whole board.

`boards to buy = ceiling(sticks × (1 + waste / 100))`

`decking to buy, feet = boards to buy × stock length`

**Perpendicular screws.** Each row gets the screw count at every joist. A butt joint adds one more set, because two board ends share that joist.

`face screws = rows × (joists + butt joints per row) × screws per joist`

**Diagonal boards.** Diagonal means 45 degrees. The distance to cover, measured square to the boards, is `(length + width) / √2`. Rows use that distance in place of the width. The total length of board is the deck area divided by the board-plus-gap pitch. That length is divided by the stock length, waste is applied, and the result rounds up. This treats offcuts as usable. Face screws are the total board length divided by the distance along a 45 degree board from one joist to the next (`joist spacing × √2`), rounded up, times the screws per joist. Butt-joint screws are not added on a diagonal layout.

**Spacing limit.** For composite, the limit is the Trex chart span you picked. At 45 degrees it is that span minus 4 inches. For wood, the limit is the matching cell of 2021 IRC Table R507.7, shown in the joist spacing check below. Inches over the limit are 0 when the spacing you picked is at or under the limit.

`spacing warning = 1` when the spacing is over the limit, or when composite is set to single span. Trex's 2026 guide says the decking must span at least three joists. `Under 3 joists` is 1 only for that composite single-span case.

`Side gap under 3/16 in` is 1 when the material is composite and the side gap is under 0.1875 inches. Wood does not use that flag.

## Worked example

A 12 foot by 12 foot deck, composite, 5.5 inch boards, 16 foot sticks, a 3/16 inch (0.1875) side gap, boards perpendicular to the joists, joists at 16 inches, the 16 inch Trex chart span, multiple span, 2 screws per joist, and 10 percent waste. These are the starting values.

1. Pitch = 5.5 + 0.1875 = 5.6875 inches.
2. Width = 12 × 12 = 144 inches. Rows = (144 + 0.1875) / 5.6875 = 25.3516, which rounds up to 26. Twenty-five boards cover 25 × 5.5 + 24 × 0.1875 = 142 inches, which is short of 144. Twenty-six boards cover 143 + 4.6875 = 147.6875 inches.
3. The run is 144 inches and the stick is 192 inches, so one stick covers one row. Twenty-six rows need 26 sticks before waste.
4. 26 × 1.10 = 28.6, which rounds up to 29 boards. Decking to buy = 29 × 16 = 464 feet.
5. Joists = 144 / 16 + 1 = 10. There is no splice, so face screws = 26 × 10 × 2 = 520. Screws per square foot = 520 / 144 = 3.61.
6. The composite perpendicular limit is the 16 inch chart span. The spacing you picked is 16, so the warning is 0 and inches over the limit is 0. The board crosses 10 joists, so the three-joist flag is 0. The gap is 3/16 inch, so the gap flag is 0.

The donut shows 26 layout boards and 3 extra boards. 26 + 3 = 29.

## How to read your results

Boards to buy, joists, and face screws are already rounded up to whole pieces. Decking to buy is the boards times the stock length, which is the footage you haul home. Board rows is the count across the deck before a stick is cut into more than one row.

On an 8 foot board run with 16 foot sticks, one stick covers two rows. The 8 × 10 line in the table below is 22 rows and 13 boards for that reason: 22 / 2 = 11 sticks, and 11 × 1.10 = 12.1, which rounds up to 13.

Spacing warning is 1 when something in the check fails. Read Spacing limit and Inches over the limit together. If the limit is 8 and the smallest spacing on the form is 12, every spacing choice is over that limit. Under 3 joists is a separate composite rule. Side gap under 3/16 in is 1 only for composite entered below Trex's minimum. Face screws per square foot is this deck's screw count divided by its area. It is not a fixed rate from a fastener box.

Hidden clips are not in the screw count. If you use a hidden fastener, use the clip count in that product's instructions and keep the board and joist counts.

The table below uses the starting values: composite, 5.5 inch faces, 16 foot sticks, a 3/16 inch gap, perpendicular boards, 16 inch joists, the 16 inch chart span, multiple span, 2 screws, and 10 percent waste. Length is the board run. Width is across the boards.

| Deck, length × width | Board rows | Boards to buy | Decking to buy | Joists | Face screws |
| --- | --- | --- | --- | --- | --- |
| 8 × 10 ft | 22 | 13 | 208 ft | 7 | 308 |
| 10 × 12 ft | 26 | 29 | 464 ft | 9 | 468 |
| 12 × 12 ft | 26 | 29 | 464 ft | 10 | 520 |
| 12 × 16 ft | 34 | 38 | 608 ft | 10 | 680 |

A 10 × 12 and a 12 × 12 buy the same 29 boards because both use one 16 foot stick per row and the 12 foot side is the one that sets the row count. The joist count changes because the board run changed.

## Assumptions and limits

Length is the side the joists are spaced along. Width is how long each joist is. Diagonal mode uses those two numbers as the outside sides of the rectangle.

Board width starts at 5.5 inches because that is a common nominal 1x6 face. Confirm the face of the product you buy. The 2026 Trex guide names 1x6, 1x4, and 2x6 products and does not print a 5.5 inch face in the span section used here.

The side gap starts at 3/16 inch from the Trex 2026 guide, which allows that gap at every temperature, recommends 3/8 inch in a heavily wooded area, and says the gap should not exceed 1/2 inch. Wood side gaps are whatever the board maker specifies. End gaps are not subtracted. That guide's end-to-end gap is 1/8 inch above 40°F and 3/16 inch below 40°F. The gap against a solid object is 1/4 inch above 40°F and 1/2 inch below 40°F.

Waste starts at 10 percent. That number is an estimate so you can change it. It is not printed in the Trex guide or in the IRC table. Diagonal counts assume offcuts can be reused, so a low waste percent can come up short on a 45 degree layout.

Joists are the members under the boards, including both ends of the length. Beams, the ledger, posts, footings, guards, stairs, fascia, and a picture-frame border are separate. A butt joint often needs bearing under both board ends. This count does not add that extra framing.

The largest perpendicular overhang in the Trex 2026 guide is 3/4 inch. This tool does not check overhang. The length you enter is the finished board run.

Face screws follow the number you enter, starting at 2. Trex's 2026 guide says two screws per joist, and 2021 IRC R507.7 says wood decking is attached with at least two 8d threaded nails or two No. 8 wood screws at each supporting member. Hidden-fastener counts are product-specific and are not estimated here.

Composite spacing uses one chart span, 16 or 24 inches, not a separate row for every Trex product. Sixteen inches is the chart span for Signature, Transcend, Transcend Lineage, Select, and Enhance 1x6 boards at 100 psf, and for Lineage 1x4 at 100 psf. The same guide recommends 16 inches on center for a stiffer surface. Twenty-four inches is listed for Transcend and Select 2x6 at 100 psf, for Transcend 1x6 and Lineage 1x6 at 91 psf, and for Select 1x6 at 75 psf. Stair-tread spans in that chart (9, 12, or 16 inches, by product) are not applied here.

At 45 degrees, the Trex guide's maximum span is 4 inches less than the chart span. At 30 degrees, the same page says the maximum is half the chart span. This tool has a 45 degree choice and does not apply the 30 degree rule.

A research note for this page said composite commercial decks use 12 inch spacing. The 2026 chart does not say that. It says some commercial installations need a 100 psf rating or more, and the common 1x6 row at 100 psf is 16 inches. This check does not switch to 12 inches for a commercial deck.

The wood limits are 2021 IRC Table R507.7 only. The 2024 table number and values were not checked. Footnote b of the 2021 table allows another span when an accredited grading agency publishes one. This tool uses the table cells only. Local amendments can differ. Confirm the spacing with the building office and with the board maker's instructions before you buy.

## FAQ

### How many deck boards do I need for a 12x12 deck?

With the starting values, a 12 × 12 foot deck uses 26 rows and 29 boards of 16 foot stock. The worked example above is that deck: 5.5 inch faces, a 3/16 inch gap, perpendicular boards, and 10 percent waste. Change the width, the gap, or the stock length and the count changes.

### How many deck screws per square foot?

There is no single screws-per-square-foot rate in the sources used here. The tool divides the face-screw count by the deck area. The 12 × 12 starting deck is 520 screws on 144 square feet, which is 3.61 screws per square foot. A hidden-clip system uses its own count.

### What is the side gap for composite deck boards?

Trex's 2026 guide sets the width-to-width gap at a minimum of 3/16 inch for hot and cold weather. It recommends 3/8 inch in a heavily wooded area, and it says the gap should not exceed 1/2 inch. End gaps depend on the temperature at installation and are listed under Assumptions and limits.

### What joist spacing does Trex decking use?

The 2026 span chart is by product and load. The common 1x6 boards are listed at 16 inches on center for a 100 psf rating, and the guide recommends 16 inches for a stiffer surface. Some rows list 24 inches. At 45 degrees the maximum is 4 inches less than the chart span you are using, so a 16 inch chart becomes 12 inches. The decking must span at least three joists. Stair treads in that chart are a different span and are outside this tool.

### What joist spacing is allowed for 5/4 deck boards?

2021 IRC Table R507.7 lists 1-1/4 inch wood, which is the row this tool uses for 5/4. Perpendicular to the joists, the maximum is 12 inches for a single span and 16 inches for a multiple span. Diagonal, up to 45 degrees, the maximum is 8 inches for a single span and 12 inches for a multiple span. The 2 inch wood row is wider: 24 and 24 perpendicular, and 18 and 24 diagonal.

### How many deck screws per board?

The guides call for two screws at each joist the board crosses. On the 12 × 12 starting deck, each board crosses 10 joists, so that is 20 face screws per board. A butt joint needs a set of screws on each board end. The count already includes one set at that joist and adds a second set for the other end. With the starting value of 2, that is 2 extra screws at the joint.

## Joist spacing check

The warning compares your joist spacing with one limit. Wood uses the cell below. Composite uses the Trex chart span, minus 4 inches when the boards are at 45 degrees, and it warns on single span because that guide requires three joists.

2021 IRC Table R507.7, maximum on-center joist spacing for wood decking. Footnote a limits the diagonal angle to 45 degrees from perpendicular. Footnote c calls two joists a single span and three or more joists a multiple span. Plastic composite decking is sent to the manufacturer, which is why composite on this page does not use this table. The 2024 edition of the table was not checked.

| Decking | Perpendicular, single span | Perpendicular, multiple span | Diagonal, single span | Diagonal, multiple span |
| --- | --- | --- | --- | --- |
| 1-1/4 inch wood (5/4 on this page) | 12 in | 16 in | 8 in | 12 in |
| 2 inch wood (2x on this page) | 24 in | 24 in | 18 in | 24 in |

Composite limits this tool will show:

| Layout | Limit |
| --- | --- |
| Perpendicular, 16 in chart span | 16 in |
| 45 degrees, 16 in chart span | 12 in |
| Perpendicular, 24 in chart span | 24 in |
| 45 degrees, 24 in chart span | 20 in |
| Composite set to single span | Warning, even when the spacing is inside the span above |

A deck from 4 to 40 feet, at 12, 16, or 24 inch spacing, always has at least three joists along the length. A 4 foot side at 24 inches has joists at 0, 24, and 48 inches. Leave Board support on multiple span for a board that crosses those joists. Choose single span only when you cut each board so it sits on two joists. For 5/4 wood on a diagonal single span, the table limit is 8 inches, and every spacing on this form is over that limit.
