## What it calculates and who it's for

This concrete calculator estimates how much concrete a pour needs, in cubic feet and cubic yards, and how many premix bags to buy in the size you plan to carry home: 40, 50, 60, 80, or 90 lb.

It is built for DIYers pouring a rectangular slab or footing (a patio, shed pad, walkway, or equipment pad) or a round column in a Sonotube-style form tube (for example, deck or porch footings). Bag counts use the yield printed on each manufacturer's data sheet, so you can see the difference between a Quikrete bag and a Sakrete bag of the same weight instead of relying on one generic "bags per yard" number.

## How to use

1. **Choose what you're pouring.** Pick *Rectangular slab or footing* or *Round column (Sonotube)*. Only the size fields for that shape are shown.
2. **Enter how many identical pours.** Leave it at 1 for a single slab. Enter 4 for four matching footing columns.
3. **Enter the size.** For a slab: length and width in feet and thickness in inches. For a column: the inside diameter of the tube and the height of concrete, both in inches. Use decimals for partial feet (10 ft 6 in = 10.5 ft).
4. **Pick the concrete mix and bag size.** Sizes a mix isn't sold in are greyed out.
5. **Adjust the waste allowance if you want.** It starts at 5%. Raise it for uneven ground or a first pour; set it to 0% to see the exact volume.
6. **Read your results.** The large number is the bags to buy. Below it are the total weight, the volume with and without waste, and the yield of the bag you picked.

## The formula

**Slab or footing volume:**

Volume (cu ft) = Length (ft) × Width (ft) × Thickness (in) ÷ 12 × Quantity

**Round column volume:**

Volume (cu ft) = π × (Diameter (in) ÷ 24)² × Height (in) ÷ 12 × Quantity

Dividing the diameter by 24 turns inches into feet (÷ 12) and diameter into radius (÷ 2) in one step.

**Then for both shapes:**

- Volume with waste (cu ft) = Volume × (1 + Waste % ÷ 100)
- Cubic yards = Cubic feet ÷ 27
- Bags to buy = Volume with waste ÷ Bag yield (cu ft per bag), **rounded up** to a whole bag
- Bags per cubic yard = 27 ÷ Bag yield
- Total weight to haul (lb) = Bags × Bag size (lb)

**Bag yield** is the approximate cubic feet of mixed concrete one bag makes, taken from the manufacturer's data sheet (see the table further down and the Sources list). For example, an 80 lb bag of Quikrete Concrete Mix yields about 0.60 cu ft.

## Worked example

A 10 ft × 10 ft patio slab, 4 in thick, one pour, Quikrete Concrete Mix in 80 lb bags, with the default 5% waste allowance:

1. Thickness in feet: 4 ÷ 12 = 0.333 ft
2. Volume: 10 × 10 × 0.333 = **33.33 cu ft** (33.33 ÷ 27 = **1.23 cu yd**)
3. Add 5% waste: 33.33 × 1.05 = **35.00 cu ft** (35.00 ÷ 27 = **1.30 cu yd**)
4. Bags: 35.00 ÷ 0.60 = 58.33, rounded up to **59 bags**
5. Weight: 59 × 80 lb = **4,720 lb**

With 0% waste the same slab needs 33.33 ÷ 0.60 = 55.56, rounded up to 56 bags. The calculator shows the same numbers with its default settings.

## How to read your results

- **Bags to buy** is already rounded up to a whole bag. Partial bags don't exist at the store, and running short in the middle of a pour can leave a weak joint where fresh concrete meets concrete that has started to set.
- **Concrete incl. waste** is the number to compare against your plan. **Concrete before waste** is the exact geometric volume of your forms.
- **Bags per cubic yard** tells you how many of your chosen bag make one yard. It's useful if a plan or a supplier quotes in yards.
- **Total weight to haul** is the dry weight of the bags. Use it to plan trips and check your vehicle's payload rating before loading up.
- If you're between two bag sizes, compare: 59 bags at 80 lb is fewer trips from the truck to the mixer than 78 bags at 60 lb for the same slab, but each bag is heavier to lift.

## Assumptions and limits

The calculator assumes:

- **Bag yields are the manufacturer's published values.** Each data sheet describes its yield as approximate. Actual yield depends on how much water you add and how well the mix is consolidated.
- **The slab is a flat box of even thickness** and the column is a straight cylinder. It does not add concrete for thickened edges, sloped bottoms, low spots in the sub-base, or bulging forms. The waste allowance is there to cover those.
- **5% waste is our starting estimate, not a manufacturer figure.** We did not find a published waste percentage for bagged concrete, so 5% is labeled as an assumption. You can set anything from 0% to 25%.
- **Rounding happens once, on the total.** With several identical pours, the bag count is for all of them together.
- **Nothing is subtracted for rebar or mesh**, which takes up a very small share of the volume.
- **Thin pours:** the Quikrete and Sakrete data sheets for these mixes describe them for pours about 2 in thick or more. The calculator requires a minimum thickness of 2 in to match those product limits.

What it doesn't cover:

- **Structural design.** It does not tell you how thick a slab must be, whether it needs reinforcement, how deep footings must go for frost, or what your local code requires. Structural slabs and footings need local code review and, where required, an engineer.
- **Fence posts.** Post holes have a post taking up part of the hole. Use the Fence Calculator for those so the concrete isn't double-counted.
- **Gravel base, forms, rebar, or prices.** This tool estimates concrete only. It does not price anything.
- **Ready-mix trucks and pallets.** Truck capacities and bags-per-pallet counts vary and are not covered here. The cubic yards figure is what you'd give a ready-mix supplier.

Confirm quantities with your supplier, follow the mixing and curing instructions on the bag, and check local building codes before you pour.

## FAQ

### How many bags of concrete make a yard?

One cubic yard is 27 cu ft, so divide 27 by the bag's yield. For Quikrete Concrete Mix, that's 90 bags at 40 lb, 72 at 50 lb, 60 at 60 lb, 45 at 80 lb, or 40 at 90 lb. Sakrete's 90 lb bag yields slightly less (0.66 cu ft), so it takes about 41. These counts have no waste added.

### How many 80 lb bags of concrete are in a yard?

45. Both Quikrete and Sakrete list 0.60 cu ft per 80 lb bag, and 27 ÷ 0.60 = 45. Add your waste allowance on top: at 5%, buy 48 (45 × 1.05 = 47.25, rounded up).

### How many yards of concrete are in an 80 lb bag?

About 0.022 cu yd (0.60 cu ft ÷ 27). Put another way, one 80 lb bag is 1/45 of a yard.

### How many 80 lb bags fill a 12 in Sonotube?

A 12 in tube holds about 0.785 cu ft per foot of height, which is about 1.3 bags of 80 lb mix per foot. A 36 in deep tube needs 2.36 cu ft, or 4 bags with no waste (5 bags with 5% waste). A 48 in deep tube needs 3.14 cu ft, or 6 bags with no waste. Choose *Round column* above to try your own depth.

### How much concrete do I need for a 12×12 slab?

At 4 in thick, a 12 ft × 12 ft slab is 48 cu ft, or 1.78 cu yd. With 5% waste that's 84 bags at 80 lb or 112 bags at 60 lb. At 6 in thick it's 2.67 cu yd, or 126 bags at 80 lb. The table below lists other common slab sizes.

### Why do Quikrete and Sakrete 90 lb bags give different counts?

Their data sheets list different yields: 0.675 cu ft for a 90 lb Quikrete Concrete Mix bag and 0.66 cu ft for a 90 lb Sakrete High-Strength bag. On a full yard, that's 40 bags versus about 41. At 40, 60, and 80 lb, the two brands list the same yields.

### Can I use this for fence posts?

No. A post takes up part of the hole, and a fence needs other quantities, like posts and rails. Use the Fence Calculator, which handles post-hole concrete.

## Bag yields by brand, and common slab sizes

**Bag yields from each data sheet.** Bags per cubic yard is 27 ÷ yield, before waste. Pick the mix in the calculator to use its yield. The data sheets are linked under Sources.

| Bag size | Quikrete Concrete Mix (1101) | Sakrete High-Strength | Quikrete Fast-Setting (1004) |
|---|---|---|---|
| 40 lb | 0.30 cu ft · 90 per yd | 0.30 cu ft · 90 per yd | not sold |
| 50 lb | 0.375 cu ft · 72 per yd | not sold | 0.375 cu ft · 72 per yd |
| 60 lb | 0.45 cu ft · 60 per yd | 0.45 cu ft · 60 per yd | 0.45 cu ft · 60 per yd |
| 80 lb | 0.60 cu ft · 45 per yd | 0.60 cu ft · 45 per yd | not sold |
| 90 lb | 0.675 cu ft · 40 per yd (regional) | 0.66 cu ft · 40.9 per yd | not sold |

**Common slab sizes at 4 in thick.** "cu yd" is the concrete before waste; "cu yd + 5%" and the bag counts include 5% waste. Bag counts use the 0.30, 0.45, and 0.60 cu ft yields that both brands list for 40, 60, and 80 lb bags.

| Slab (ft) | cu yd | cu yd + 5% | 40 lb bags | 60 lb bags | 80 lb bags |
|---|---|---|---|---|---|
| 4 × 4 | 0.20 | 0.21 | 19 | 13 | 10 |
| 8 × 8 | 0.79 | 0.83 | 75 | 50 | 38 |
| 10 × 10 | 1.23 | 1.30 | 117 | 78 | 59 |
| 10 × 12 | 1.48 | 1.56 | 140 | 94 | 70 |
| 12 × 12 | 1.78 | 1.87 | 168 | 112 | 84 |
| 10 × 20 | 2.47 | 2.59 | 234 | 156 | 117 |
| 16 × 16 | 3.16 | 3.32 | 299 | 200 | 150 |
| 20 × 20 | 4.94 | 5.19 | 467 | 312 | 234 |
| 24 × 24 | 7.11 | 7.47 | 672 | 448 | 336 |

For a 5 in or 6 in slab, multiply the cubic yards by 1.25 or 1.5, then recalculate the bags above (rounding happens once, so multiplying the bag counts can be off by one). The chart under the calculator does this for your own slab.
