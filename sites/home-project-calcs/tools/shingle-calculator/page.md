## What it calculates and who it's for

This calculator estimates materials for an asphalt shingle roof in US units. From the roof's footprint and pitch it works out the sloped roof area in square feet and in roofing squares (1 square = 100 sq ft of roof surface). Then it gives field shingle bundles before and after waste, starter strip bundles for the eaves and rakes, hip and ridge cap bundles, underlayment rolls, and the nail count for the field shingles.

It's for homeowners pricing a reroof, DIY roofers building a material order, and anyone checking a contractor's or supplier's takeoff. It counts materials only. It doesn't give prices or labor.

## How to use

1. **Roof footprint.** Enter the length and width of the area the roof covers, measured from the outside edge of one overhang to the other. For an L-shaped or complex roof, run the calculator once per rectangle and add the results.
2. **Roof pitch.** Choose how you'll enter the slope. Pick **Pitch** and type the rise per 12 in of run (6 for a 6/12 roof), or pick **Pitch multiplier** and type the area factor if you already have one. Don't know your pitch? The [Roof Pitch Calculator](/roof-pitch-calculator/) works it out from a rise and run or an angle, and its link back here fills in the pitch for you.
3. **Roof edges.** Enter the total eave length (bottom edges), rake length (sloped gable edges), and ridge plus hip length. Set rakes to 0 if you won't run starter strip up the gables.
4. **Shingles and waste.** Check the bundles per square on your shingle's wrapper (3 for GAF Timberline HDZ). Keep 10% waste for a simple gable roof, or raise it to 15% or more for hips, valleys, and dormers.
5. **Advanced: accessory coverage.** Pick a product line to load its starter, ridge cap, and underlayment coverage from the maker's data sheet, or type your own numbers. Check the nails per square for your shingle and local code.
6. **Read the shopping list** under the results. It's grouped into field shingles, accessories, and fasteners.

## The formula

**Pitch multiplier (M)** turns flat footprint area into sloped roof area. For a pitch of *x*/12:

M = √(1 + (x ÷ 12)²)

A 6/12 roof gives M = √1.25 = 1.118. If you choose multiplier mode, the calculator uses your number directly.

- **Roof area (sq ft)** = footprint length (ft) × footprint width (ft) × M
- **Squares** = roof area ÷ 100
- **Squares with waste** = squares × (1 + waste % ÷ 100)
- **Field bundles before waste** = squares × bundles per square, rounded up
- **Field bundles with waste** = squares with waste × bundles per square, rounded up
- **Starter bundles** = (eave ft + rake ft) ÷ starter coverage (lin ft per bundle), rounded up
- **Ridge cap bundles** = ridge + hip ft ÷ ridge cap coverage (lin ft per bundle), rounded up
- **Underlayment rolls** = roof area × layers ÷ roll coverage (sq ft per roll, net of laps), rounded up. Layers is 2 when the pitch is from 2/12 up to (not including) 4/12, and 1 otherwise.
- **Nails** = squares with waste × nails per square, rounded up

The same footprint-times-multiplier math works for gable and hip roofs, as long as every roof plane has the same pitch. On a hip roof the hips add ridge cap length, not roof area.

## Worked example

A 40 ft × 30 ft footprint (overhangs included) with a 6/12 pitch, 80 ft of eaves, 60 ft of rakes, 40 ft of ridge, 3 bundles per square, 10% waste, and the GAF accessory preset:

1. Multiplier: √(1 + 0.5²) = √1.25 = 1.118034
2. Roof area: 40 × 30 = 1,200 sq ft of footprint × 1.118034 = **1,341.6 sq ft**
3. Squares: 1,341.64 ÷ 100 = **13.42 squares**
4. Field bundles before waste: 13.4164 × 3 = 40.25, rounded up to **41 bundles**
5. Squares with waste: 13.4164 × 1.10 = 14.758. Bundles: 14.758 × 3 = 44.27, rounded up to **45 bundles**
6. Starter: (80 + 60) = 140 lin ft ÷ 120.33 = 1.16, rounded up to **2 bundles**
7. Ridge cap: 40 ÷ 25 = 1.6, rounded up to **2 bundles**
8. Underlayment: 6/12 is steeper than 4/12, so one layer. 1,341.64 ÷ 937.5 = 1.43, rounded up to **2 rolls**
9. Nails: 14.758 × 256 = 3,778.06, rounded up to **3,779 nails**

These are the numbers the calculator shows when you open the page.

## How to read your results

- **Field shingle bundles (with waste)** is the number to order for the main roof. The "before waste" count shows how much of that is the waste allowance.
- **Squares** is how roofers and suppliers talk about roof size. Quotes and shingle wrappers are written per square.
- **Every purchase count is rounded up to whole bundles and rolls.** Shingles are sold by the bundle, so a 44.27-bundle roof needs 45.
- **Starter strip, ridge cap, and underlayment** come from your edge lengths and the coverage on each product's data sheet. Different brands cover different lengths per bundle, so match the coverage to what you actually buy.
- **Nails** cover the field shingles only. Starter strip, ridge cap, and plastic-cap fasteners for synthetic underlayment are extra, so follow each product's instructions. Nails are usually sold by the box or by weight, so check the count per box.
- Buy shingles from the same production lot where you can, so the color matches. Ask your supplier about returns on unopened bundles before deciding how much extra to keep.

## Assumptions and limits

- **Quantity estimate only.** The calculator doesn't check the structural roof deck, attic ventilation, ice barrier, flashing, or valley lining. It doesn't count drip edge either. The 2024 IRC (R905.2.8.5) requires drip edge at the eaves and rakes of a shingle roof, with pieces overlapped at least 2 in, so add it to your order using the eave and rake lengths you entered. It also doesn't cover fall protection or safe work on a steep roof. Those are outside its scope.
- **Same pitch on every plane.** For roofs with planes at different pitches, run each section separately.
- **Minimum slope.** Under the 2024 International Residential Code, asphalt shingles are only allowed on slopes of 2/12 (17 percent) or steeper (R905.2.2), and slopes from 2/12 up to 4/12 need two layers of underlayment (Table R905.1.1(2)). The calculator won't accept a pitch below 2/12, and it doubles the underlayment count from 2/12 up to (not including) 4/12. It rounds the pitch to two decimals before choosing, the same way the Roof Pitch Calculator does. Your local code edition and amendments may differ.
- **Waste** defaults to 10%. IKO, a shingle maker, recommends adding 10 to 15 percent for waste depending on the roof style, so 10% is the low end for a simple gable roof. Raise it to 15% or more for hips, valleys, dormers, and cut-up roofs.
- **Bundles per square** defaults to 3 and **nails per square** to 256, from GAF's published Timberline HDZ specs. Other shingles differ. Some codes and wind warranties call for 6 nails per shingle (384 per square for HDZ).
- **Underlayment coverage** is net of laps. The GAF preset takes FeltBuster's 1,000 sq ft rated roll (which excludes laps) and allows for 3 in side laps on its 48 in width. The Owens Corning preset uses ProArmor's published 929 sq ft with a 3 in overlap. End laps and waste at hips and valleys are not included.
- **Accessory coverage** comes from the manufacturers' data sheets listed in Sources and can change. Confirm the numbers on the product you buy, follow the manufacturer's installation instructions, and check local code before ordering.

## FAQ

### How many bundles of shingles are in a square?

Most architectural shingles, including GAF Timberline HDZ, take 3 bundles per square (100 sq ft). Some heavier or designer shingles take 4 or 5. The count is printed on the bundle wrapper.

### How many bundles of shingles do I need?

Find the sloped roof area, divide by 100 to get squares, multiply by the bundles per square, and add waste. A 1,341.6 sq ft roof is 13.42 squares. That's 41 bundles before waste and 45 with 10% waste.

### How many squares is my roof?

Multiply the footprint (including overhangs) by the pitch multiplier, then divide by 100. A 40 × 30 ft footprint at 6/12 is about 1,342 sq ft of roof, or 13.42 squares.

### How many shingles are in a bundle of architectural shingles?

It varies by product. GAF lists Timberline HDZ at 64 pieces per square in 3 bundles, so about 21 pieces per bundle. Check the wrapper for your shingle.

### How much underlayment do I need for my roof?

Divide the roof area by the roll's net coverage after laps. A 10-square synthetic roll covers about 930 to 940 sq ft once side laps are allowed for. Slopes from 2/12 up to 4/12 need a double layer under the IRC, so the count doubles.

### How many bundles of shingles for 2,000 square feet?

If 2,000 sq ft is the sloped roof area, that's 20 squares. At 3 bundles per square that's 60 bundles, or 66 with 10% waste. If 2,000 sq ft is the house's floor area, measure the roof footprint with overhangs and use the pitch instead. The roof is usually larger.

### Do I need more waste for a hip roof?

Usually, yes. Hips and valleys mean more cut shingles, so many estimators use about 15% instead of 10%. Also add the hip lengths to the ridge length so the ridge cap count covers them.

## Accessory coverage by product line

The product selector loads these figures from each maker's published data sheet. Use them to compare lines, or type your own product's numbers in the advanced step.

| Accessory | GAF | Owens Corning |
|---|---|---|
| Starter strip | Pro-Start: about 120.33 lin ft per bundle (19 sheets split into 38 pieces) | Starter Strip Plus: about 105 lin ft per bundle (32 pieces) |
| Hip and ridge cap | Seal-A-Ridge: 4 bundles cover about 100 lin ft (25 per bundle) | ProEdge 12 × 36 in: 33 lin ft per bundle (66 pieces) |
| Underlayment | FeltBuster: 10 squares (1,000 sq ft) per roll before laps, 48 in × 250 ft | ProArmor: 10-square roll, 929 sq ft with a 3 in overlap, 42 in × 286 ft |
| Field shingle reference | Timberline HDZ: 3 bundles per square, 64 pieces, 256 nails per square | Not preset. Enter your shingle's bundles and nails per square. |

**Tip:** Starter strip and ridge cap are measured in linear feet, not squares. A long, simple ranch roof can need more starter than its area suggests, and a hip roof needs much more ridge cap than a gable roof with the same footprint. That's why the calculator asks for edge lengths instead of guessing them from the area.
