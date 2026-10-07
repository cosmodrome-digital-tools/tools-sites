## What it calculates and who it's for

This calculator lays out a square rebar grid inside a rectangular slab or footing and tells you what to buy: the number of rebar sticks, their total weight in pounds, how many bars run each direction and how long each run is, how many lap splices you'll tie, how many crossings need a tie, and a rough chair count. Everything is in US units: feet, inches, pounds.

It's for DIYers and homeowners who already know what grid they want (from a plan, an engineer, a permit office, or a supplier) and need a shopping list. It does **not** decide whether your slab needs rebar or what size and spacing it needs.

## How to use

1. **Slab or footing size.** Enter the length and width in feet. Use decimals for inches (12 ft 6 in = 12.5).
2. **Bar size and spacing.** Pick the bar size from your plan (#4 is the default) and enter the center-to-center spacing. The same spacing is used in both directions.
3. **Sticks and laps (advanced).** Set the edge cover, the stick length your store sells, and the lap length. Change these if you're buying 10 ft sticks or your plan calls for a different lap.
4. **Chairs and waste (advanced).** Set how far apart your chairs go and how much extra steel to buy.
5. **Read the results.** The top number is the sticks to buy. Below it you'll find the cut list for each direction, the weight, ties, and chairs. The chart shows how the stick count changes at other spacings.

## The formula

All math is done in inches, then shown in feet.

**Usable span** (the length a bar actually covers, after leaving cover at both ends):

- Span along the length = Length (ft) × 12 − 2 × Cover (in)
- Span along the width = Width (ft) × 12 − 2 × Cover (in)

**Bars in each direction.** Lengthwise bars are spaced across the width, and widthwise bars are spaced along the length:

- Lengthwise bars = ⌈ Span along the width ÷ Spacing ⌉ + 1
- Widthwise bars = ⌈ Span along the length ÷ Spacing ⌉ + 1

⌈ ⌉ means round up. Rounding up means the real gap between bars is never wider than the spacing you entered. Each bar's run is the full span in its direction.

**Sticks per run, with laps.** If a run is longer than one stick, sticks are spliced end to end with an overlap (the lap). Each added stick only adds (Stick − Lap) of length, so:

- Sticks per run, n = ⌈ (Run − Lap) ÷ (Stick − Lap) ⌉, at least 1
- Lapped length = Run + (n − 1) × Lap
- Each run uses (n − 1) full sticks plus one leftover piece: Leftover = Lapped length − (n − 1) × Stick
- Leftover pieces are cut from shared sticks: Pieces per stick = ⌊ Stick ÷ Leftover ⌋ (⌊ ⌋ means round down)
- Sticks for a direction = Bars × (n − 1) + ⌈ Bars ÷ Pieces per stick ⌉

**Totals:**

- Sticks before waste = lengthwise sticks + widthwise sticks
- Sticks to buy = ⌈ Sticks before waste × (1 + Waste % ÷ 100) ⌉
- Weight to buy (lb) = Sticks to buy × Stick length (ft) × Bar weight (lb/ft)
- Lap splices = Bars × (n − 1), both directions added together
- Rebar in place (linear ft) = Σ Bars × Lapped length ÷ 12
- Tie points = Lengthwise bars × Widthwise bars
- Chairs = (⌈ Span along the length ÷ Chair spacing ⌉ + 1) × (⌈ Span along the width ÷ Chair spacing ⌉ + 1)

Bar weights are fixed ASTM A615 values published by CRSI: #3 = 0.376 lb/ft, #4 = 0.668 lb/ft, #5 = 1.043 lb/ft, #6 = 1.502 lb/ft.

## Worked example

A 24 ft × 12 ft slab with #4 bar at 18 in each way, 3 in edge cover, 20 ft sticks, 20 in lap, chairs every 48 in, and 5% waste.

1. **Spans.** Along the length: 24 × 12 − 2 × 3 = 282 in (23.5 ft). Along the width: 12 × 12 − 2 × 3 = 138 in (11.5 ft).
2. **Lengthwise bars.** ⌈138 ÷ 18⌉ + 1 = ⌈7.67⌉ + 1 = 9 bars, each running 23.5 ft.
3. **Sticks for lengthwise bars.** 23.5 ft is longer than a 20 ft stick, so n = ⌈(282 − 20) ÷ (240 − 20)⌉ = ⌈1.19⌉ = 2 sticks per run. Lapped length = 282 + 20 = 302 in. Each run uses 1 full stick plus a 302 − 240 = 62 in piece. Three 62 in pieces fit in one 240 in stick (⌊240 ÷ 62⌋ = 3), so the pieces need ⌈9 ÷ 3⌉ = 3 sticks. Total: 9 + 3 = **12 sticks**, with **9 lap splices**.
4. **Widthwise bars.** ⌈282 ÷ 18⌉ + 1 = ⌈15.67⌉ + 1 = 17 bars, each 11.5 ft. One fits per stick (⌊240 ÷ 138⌋ = 1), so **17 sticks**.
5. **Sticks to buy.** 12 + 17 = 29 before waste; 29 × 1.05 = 30.45, rounded up to **31 sticks** of 20 ft.
6. **Weight.** 31 × 20 × 0.668 = 414.16, about **414 lb**.
7. **Rebar in place.** 9 × 302 ÷ 12 + 17 × 11.5 = 226.5 + 195.5 = **422 linear ft**.
8. **Ties.** 9 × 17 = **153** crossings.
9. **Chairs.** (⌈282 ÷ 48⌉ + 1) × (⌈138 ÷ 48⌉ + 1) = 7 × 4 = **28 chairs**.

Enter those numbers in the calculator and you'll get the same results.

## How to read your results

- **Sticks to buy** is the number to take to the store. It's always rounded up to a whole stick and includes your waste allowance. "Sticks before waste" shows the count without it.
- **The cut list** (lengthwise and widthwise bars, run lengths, sticks per direction) tells you how to cut. Cut the long-direction runs first, then cut shorter pieces from the offcuts and the remaining sticks.
- **Lap splices** shows how many overlaps you'll need to tie. If it's more than you want, check whether your supplier sells longer sticks and enter that stick length.
- **Weight** is the weight of the sticks you buy, not just the steel left in the slab. Use it to plan your vehicle or trailer load. 31 sticks of #4 at 20 ft is over 400 lb.
- **Tie points** counts grid crossings only. The count assumes you tie every crossing; follow your plan if it says otherwise. Lap splices need their own ties, so buy extra tie wire.
- **Chairs** is a rough count for a grid of chairs at your chosen spacing. Pick a chair height that holds the bars where your plan wants them in the slab's depth.

## Assumptions and limits

- **Rectangular slab or footing, square grid.** One spacing is used both ways. It doesn't handle L-shapes, thickened edges, corner bars, dowels, hooks, or bent bars. Split an L-shaped slab into rectangles and add the results.
- **Spacing default of 18 in is only a starting point.** We didn't find a primary source for a standard residential slab spacing. Use your plan's spacing or ask your local building department.
- **Edge cover default of 3 in is an assumption,** not a verified code value. Cover in the slab's depth (how high bars sit) is set by your chairs and isn't part of the stick math.
- **Stick length default of 20 ft is common at stores but not verified.** Check what your supplier stocks.
- **Lap default of 20 in** is about 40 bar diameters for #4 bar, a widely quoted rule of thumb. We haven't verified it against ACI 318, and the right lap depends on bar size, concrete, and design. Use your plan's lap length.
- **Offcuts:** leftover pieces from one direction aren't reused in the other direction, so the stick count leans slightly high.
- **Chair spacing and waste have no published source.** They're our estimates. Follow the chair maker's guidance.
- **Bar weights** are the fixed ASTM A615 nominal values published by CRSI.
- This tool doesn't decide whether reinforcement is required or adequate. Confirm bar size, spacing, cover, and splices with your plans, a licensed professional, or your local building official. Confirm stock lengths with your supplier and follow local codes.

## FAQ

### What is the rebar spacing for a 4 inch slab?

There's no single answer. Spacing depends on your plan, the load, the soil, and local code. We couldn't verify a standard residential spacing, which is why the calculator lets you enter any spacing from 6 to 36 in. Check with your local building department or the person who drew your plan.

### Do you need rebar for a 4 inch slab?

This calculator can't answer that. Some slabs use rebar, some use wire mesh or fibers, and some patios and walkways use none. It depends on what the slab carries and what your local code requires. Ask your building department before you pour.

### How many rebar chairs do I need?

It depends on chair spacing. With chairs every 48 in each way, a 20 × 20 ft slab needs about 36 chairs. The calculator shows that as the default. Closer spacing means more chairs. Use the chair maker's spacing when you have it.

### How many rebar ties do I need?

At least one per crossing, which the calculator shows as tie points: lengthwise bars × widthwise bars. A 20 × 20 ft slab at 18 in has 14 × 14 = 196 crossings. Add ties for each lap splice too.

### What depth should rebar sit at in a 4 inch slab?

Rebar should sit inside the slab, not on the ground. That's what chairs are for. The exact height is a design detail we haven't verified. Follow your plan or ask your building department, then buy chairs of that height.

### How much rebar is in a bundle?

Bundle counts vary by supplier and bar size, and we couldn't verify a standard number. Most DIY jobs buy loose sticks. Ask your supplier if you want to buy by the bundle.

### How much does a 20 ft stick of rebar weigh?

Multiply the stick length by the bar's weight per foot: #3 is about 7.5 lb, #4 about 13.4 lb, #5 about 20.9 lb, and #6 about 30.0 lb per 20 ft stick.

## Bar size and weight reference

Weights below use the CRSI-published ASTM A615 unit weights. Use them to check a delivery or plan how much you can carry.

| Bar size | Nominal diameter | Weight per foot | 10 ft stick | 20 ft stick |
|---|---|---|---|---|
| #3 | 0.375 in (3/8 in) | 0.376 lb | 3.8 lb | 7.5 lb |
| #4 | 0.500 in (1/2 in) | 0.668 lb | 6.7 lb | 13.4 lb |
| #5 | 0.625 in (5/8 in) | 1.043 lb | 10.4 lb | 20.9 lb |
| #6 | see CRSI table | 1.502 lb | 15.0 lb | 30.0 lb |

**Tip for short slabs.** If your runs are a little over 10 ft (say 11.5 ft), 20 ft sticks leave an 8.5 ft offcut on every bar. Try 10 ft and 20 ft stick lengths in the calculator. Sometimes shorter sticks with one lap, or a mix of both, cut down on waste.
