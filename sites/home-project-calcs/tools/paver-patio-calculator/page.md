## What it calculates and who it's for

This calculator is for anyone planning a paver patio, walkway, or small residential driveway who wants a full materials list, not just a square footage. From your patio size and paver size it estimates:

- **Pavers to buy**, counting the sand joint between pavers and a waste allowance, rounded up to whole pavers
- **Compacted base gravel** in cubic yards and tons, at a depth set by the use and soil condition you pick
- **Bedding sand** in cubic feet and cubic yards
- **Edge restraint** in linear feet around the open edges

All units are US customary: feet, inches, square feet, cubic feet, cubic yards, and short tons. The base depths come from the Interlocking Concrete Pavement Institute's construction guide, ICPI Tech Spec 2 (linked under Sources).

## How to use

1. **Pick the patio shape.** Choose rectangle, circle, or "I know the square feet". Enter the length and width, the diameter, or the area. With a typed-in area, you can also add the edge length if you want an edge restraint total.
2. **Enter the paver size** in inches, length and width, from the product label.
3. **Choose what it will carry and your soil.** A patio or walkway uses a 4 in base and a driveway uses 6 in. If you pick cold, wet, or weak soil, an extra-depth box appears (2 to 4 in).
4. **Check the advanced settings.** Joint width, bedding sand depth, base density, and paver waste all start at stated defaults. Change any of them to match your product or supplier.
5. **Read the results.** The pavers-to-buy count is at the top, then base, sand, and edge restraint. The chart compares base tons at each ICPI depth so you can see what a deeper base adds.

## The formula

**Paved area (A, sq ft)**

- Rectangle: A = length (ft) × width (ft)
- Circle: A = π × (diameter (ft) ÷ 2)²
- Known area: A = the square feet you enter

**Pavers**

- Pavers per sq ft = 144 ÷ ((paver length + joint) × (paver width + joint)), with all sizes in inches. The 144 converts square inches to square feet. Adding one joint width to each side counts the sand gap that comes with every paver.
- Pavers before waste = A × pavers per sq ft
- Pavers to buy = pavers before waste × (1 + waste % ÷ 100), rounded **up** to a whole paver

**Compacted base**

- Base depth (in) = 4 for a patio or walkway, or 6 for a driveway, plus the extra depth (2 to 4 in) if you chose cold, wet, or weak soil
- Base volume (cu ft) = A × base depth ÷ 12
- Base (cu yd) = base volume ÷ 27
- Base (tons) = base cu yd × base density (tons per cu yd, default 1.40)

**Bedding sand**

- Sand (cu ft) = A × sand depth (in) ÷ 12, and sand (cu yd) = sand cu ft ÷ 27

**Edge restraint**

- Rectangle: 2 × (length + width). Circle: π × diameter. Known area: the edge length you enter, or blank.

## Worked example

A 12 ft × 12 ft patio using 4 × 8 in brick pavers with 1/8 in (0.125 in) joints, on well-drained soil, with the default 1 in of sand, 1.40 tons per cu yd base density, and 5% waste:

1. **Area:** 12 × 12 = **144 sq ft**
2. **Pavers per sq ft:** 144 ÷ ((8 + 0.125) × (4 + 0.125)) = 144 ÷ 33.515625 = **4.30** (4.2965 unrounded)
3. **Pavers before waste:** 144 × 4.2965 = **618.7**
4. **Pavers to buy:** 618.7 × 1.05 = 649.6, rounded up to **650 pavers**
5. **Base depth:** patio on well-drained soil = **4 in**
6. **Base volume:** 144 × 4 ÷ 12 = 48 cu ft; 48 ÷ 27 = **1.78 cu yd**
7. **Base weight:** 1.78 × 1.40 = **2.49 tons** (1.7778 × 1.40 unrounded)
8. **Bedding sand:** 144 × 1 ÷ 12 = **12 cu ft**, or 12 ÷ 27 = **0.44 cu yd**
9. **Edge restraint:** 2 × (12 + 12) = **48 linear ft**

The same patio as a driveway on wet clay with 2 in extra base would need an 8 in base: 144 × 8 ÷ 12 = 96 cu ft = 3.56 cu yd, or about 4.98 tons. That's twice the patio figure.

## How to read your results

- **Pavers to buy** already includes your waste allowance and is rounded up. Pavers are often sold by the pallet or by the square foot of coverage. If the store sells by coverage, compare its square feet per pallet to your paved area, then add waste.
- **Pavers before waste** and **pavers per sq ft** let you check the math against the coverage printed on the pallet tag.
- **Compacted base, tons and cu yd** is the volume of base once it's compacted in place, not the loose volume in the truck. Loose gravel settles when it's compacted, so tell your supplier the compacted depth and area and ask how much to order. Suppliers sell by the ton or the cubic yard, so both are shown.
- **Base depth used** confirms which ICPI depth went into the math.
- **Bedding sand** is the screeded layer under the pavers. Small jobs often buy it in bags; check the bag label for its cubic-foot fill. Joint sand (including polymeric sand) is separate. Use the coverage printed on that product's bag.
- **Edge restraint** is the full outside edge. Subtract any side that runs against a house wall, existing slab, or other solid edge that already holds the pavers in. Restraint is sold in fixed lengths, so round up to whole pieces.

## Assumptions and limits

- **Base depths** are ICPI Tech Spec 2 minimums for compacted base: 4 in for patios and walkways and 6 in for residential driveways on well-drained soil, plus 2 to 4 in in colder climates or on continually wet or weak soil. They're industry guidance for typical residential work, not a design. Soft soils, slopes, and heavier vehicle loads may need a deeper or engineered base.
- **Bedding sand** defaults to 1 in, the nominal uncompacted thickness in ICPI Tech Spec 2. Sand shouldn't be used to level out a bumpy base.
- **Base density** defaults to 1.40 tons per cu yd. This is an **unverified estimate**: base material weight varies by stone type, gradation, and moisture. Ask your supplier for their figure and enter it.
- **Paver waste** defaults to 5%. No published source gives a waste figure by laying pattern, so this is our starting estimate. Herringbone, diagonal layouts, curves, and lots of borders mean more cuts; raise it to suit.
- **Joints** default to 1/8 in, inside ICPI's 1/16 to 3/16 in range. Many pavers have built-in spacer bars; if the size you entered already includes them, set the joint to 0.
- **Base past the edges is not included.** Many installers carry the base out past the paver edge to support the edge restraint. We couldn't verify a standard distance, so the calculator uses the paved area only. Add extra if your installer or product guide calls for it.
- **Not included:** excavation depth, geotextile fabric, drainage pipe, joint or polymeric sand, borders and soldier courses, slopes, steps, and costs.
- Paver sizes are nominal face sizes from the label. Confirm quantities with your supplier, follow the paver and edge restraint manufacturers' instructions, call 811 before you dig, and check local codes or HOA rules.

## FAQ

### How many pavers per square foot?

Divide 144 by the paver's face area in square inches, including one joint width on each side. A 4 × 8 in paver works out to 4.5 per sq ft with no joint, or about 4.3 with 1/8 in joints. Common sizes:

| Paver size (in) | Per sq ft, no joint | Per sq ft, 1/8 in joint |
|---|---|---|
| 4 × 8 | 4.50 | 4.30 |
| 6 × 6 | 4.00 | 3.84 |
| 6 × 9 | 2.67 | 2.58 |
| 6 × 12 | 2.00 | 1.94 |
| 12 × 12 | 1.00 | 0.98 |
| 16 × 16 | 0.56 | 0.55 |
| 12 × 24 | 0.50 | 0.49 |
| 24 × 24 | 0.25 | 0.25 |

Add your waste allowance on top.

### How much paver base do I need?

Multiply the paved area by the compacted base depth in feet, then divide by 27 for cubic yards. A 12 × 12 ft patio with a 4 in base needs 144 × 4 ÷ 12 ÷ 27 = 1.78 cu yd. For tons, multiply by your supplier's density. At the default estimate of 1.40 tons per cu yd, that's about 2.5 tons.

### How deep should paver base be?

ICPI Tech Spec 2 gives a minimum compacted base of 4 in for patios, sidewalks, and other foot-traffic areas over well-drained soil. In colder climates or on continually wet or weak soil, it calls for a base 2 to 4 in thicker.

### How deep should paver base be for a driveway?

ICPI Tech Spec 2 gives at least 6 in of compacted base for a residential driveway on well-drained soil, plus 2 to 4 in more in cold, wet, or weak soil. That's 8 to 10 in on poor ground. Heavy vehicles or very poor soil may need an engineered base.

### How much sand for pavers?

For the bedding layer, ICPI specifies 1 in of sand, screeded and not compacted. That's area ÷ 12 in cubic feet: 144 sq ft needs 12 cu ft (0.44 cu yd). Joint sand swept in after laying is a separate, smaller amount.

### How much polymeric sand do I need for pavers?

It depends on the product, the paver size, and the joint width, so use the coverage chart on the bag. This calculator doesn't estimate joint or polymeric sand because coverage differs from brand to brand.

## ICPI base depth recipe

The use and soil selectors set the base depth using this table, from ICPI Tech Spec 2. Bedding sand stays at 1 in nominal in every row.

| What it carries | Soil | Compacted base (in) | Bedding sand (in) | Base tons for 100 sq ft* |
|---|---|---|---|---|
| Patio or walkway | Well-drained | 4 | 1 | 1.73 |
| Patio or walkway | Cold, wet, or weak | 6 to 8 | 1 | 2.59 to 3.46 |
| Residential driveway | Well-drained | 6 | 1 | 2.59 |
| Residential driveway | Cold, wet, or weak | 8 to 10 | 1 | 3.46 to 4.32 |

*At the default density estimate of 1.40 tons per cu yd. Your supplier's figure may differ.

**Real-world tip:** the base is usually the heaviest part of the job. In the worked example, 650 pavers cover the patio, but the 4 in base under them weighs about 2.5 tons. Check how much your vehicle or trailer can carry before you plan to haul it yourself. Many suppliers deliver base by the ton.
