## What it calculates and who it's for

This calculator turns a driveway, path, or drain bed into cubic feet, cubic yards, and US short tons of gravel or crushed stone. It is for a homeowner who is about to call a supplier and needs an order quantity.

You can keep one layer, or switch to a layered driveway with a base course and a surface course on the same footprint. Each course has its own depth and its own tons-per-yard. The density boxes start at 1.40 short tons per cubic yard. That figure is an estimate. Type the number your supplier gives you for the exact stone, including a size such as #57, and set Density source to the supplier option.

The results are material quantities. They are not a price, and they are not a driveway or drainage design.

## How to use

The form opens on a 50 ft by 12 ft rectangle, 4 inches deep, at the 1.40 estimate with a 10 percent allowance. Change any box and the results update.

1. Under Job, choose Single layer or Layered driveway. Choose Rectangle, Circle, or Enter sq ft.
2. Under Area, enter the size. A rectangle uses Length and Width. A circle uses Width as the diameter. Enter sq ft uses the Area box.
3. Under Depth, enter the gravel thickness in inches. For a layered driveway, Depth is the base and Surface depth is the top course.
4. Under Stone, check Density. Replace 1.40 with your supplier's tons per cubic yard. In layered mode, set Surface density too if the top stone is different.
5. Under Advanced, set Density source so you can see whether the number is still the estimate. Leave Compaction / waste at 10 percent, or type a different percent from 0 to 30.
6. Read Tons to order and Cubic yards to order. Those two lines are the ones to give the supplier.

## The formula

The unit relationships come from NIST Handbook 44 (2026), Appendix C, [General Tables of Units of Measurement](https://www.nist.gov/document/2026-nist-handbook-44-appendix-c), accessed October 6, 2026. That handbook states that 12 inches equal 1 foot, 27 cubic feet equal 1 cubic yard, and an unmodified ton is the 2,000-pound ton. It does not give a gravel density or a driveway depth. Those stay editable on this page.

**Area**

- Rectangle: area (sq ft) = length (ft) × width (ft).
- Circle: area (sq ft) = π × (diameter ÷ 2)². The width box is the diameter in feet. π is the usual circle constant, about 3.14159265.
- Enter sq ft: area is the number in the Area box.

**One layer**

- Cubic feet = area × depth (inches) ÷ 12.
- Cubic feet with allowance = cubic feet × (1 + compaction percent ÷ 100).
- Cubic yards = cubic feet with allowance ÷ 27.
- Tons = cubic yards × density (short tons per cubic yard).

**Layered driveway**

The same area is used for both courses. The base uses Depth and Density. The surface uses Surface depth and Surface density. The same compaction percent is applied to each course, so a thicker course gets more extra material. Add the two courses to get the totals.

**Order lines**

Tons to order and Cubic yards to order take the full calculated amount and round it up to the next tenth. A value that is already on a tenth stays there. 11.407 tons becomes 11.5 tons to order. 5.6 tons stays 5.6.

## Worked example

These are the numbers already filled in when the page opens.

A rectangle 50 ft long and 12 ft wide, single layer, 4 inches deep, density 1.40 short tons per cubic yard, 10 percent compaction allowance.

1. Area = 50 × 12 = 600 sq ft.
2. Cubic feet before the allowance = 600 × 4 ÷ 12 = 200.
3. With a 10 percent allowance = 200 × 1.10 = 220 cubic feet.
4. Cubic yards = 220 ÷ 27 = 8.148148…, shown as 8.15.
5. Tons = 8.148148… × 1.40 = 11.407407…, shown as 11.41.
6. Order lines round up to the next tenth: 8.2 cubic yards and 11.5 tons.

The base-layer lines match those totals. The surface-layer lines are 0 because the mode is single layer. Density used shows 1.4, which is the 1.40 you entered. The chart splits that into about 10.37 tons of stone and about 1.04 tons of allowance.

## How to read your results

Tons to order and Cubic yards to order are the shopping lines. Calculated tons, Cubic yards, and Cubic feet are the same job rounded for reading: tons and yards to the nearest hundredth, cubic feet and area to the nearest tenth. Trailing zeros are dropped, so 3.80 shows as 3.8 and 1.40 shows as 1.4.

The order lines use the full amount, before that display rounding. A 10 ft by 20 ft path at the starting settings shows 3.8 calculated tons and 3.9 tons to order, because the full amount is about 3.802 tons. Ordering the higher line covers the estimate.

On a single layer, every surface line is 0. The base lines are the whole order, and they already include the compaction allowance. The chart then separates Stone (before the allowance) from Allowance (the extra tons).

On a layered driveway, base and surface each include the allowance. The chart shows those two ton totals. Rounded layer lines can differ from the calculated total by about 0.01 ton.

Density used is the base density, or the only density in single-layer mode. The words "Estimate" or "Supplier figure" stay on the Density source menu. The results list shows the number.

If your yard sells whole tons only, round Tons to order up to the next whole ton yourself. This tool stops at tenths. Confirm the load with the supplier before you buy, and follow the product guidance they give you for that stone.

## Assumptions and limits

Every assumption is listed here, with the reason it is in the tool.

- **US short ton.** "Ton" means the 2,000-pound ton from NIST Handbook 44 when the word is not qualified as long or metric. Gravel density in the US is usually quoted in those tons per cubic yard.
- **Rectangle, circle, or a known area.** Most beds are rectangles, so that shape is the start. A circle uses the width box as the diameter because the form has one width field. Enter sq ft is there when you already measured the area.
- **Size limits.** Length is 1 to 500 ft. Width (or diameter) is 1 to 100 ft. A typed area is 1 to 50,000 sq ft, which is the same cap as a 500 ft by 100 ft rectangle.
- **Same footprint for both courses.** In layered mode the surface covers the same area as the base.
- **Single layer leaves the surface boxes unused.** Surface depth and surface density stay on the form so you can switch modes, and a single-layer result ignores them.
- **Depth starts at 4 inches, surface depth at 2 inches.** Those placeholders make the form usable. No state DOT manual or university extension guide was used to choose them. Driveway and drainage depths change with soil and climate. Replace them with the thickness your supplier, local practice, or a designer specifies. Depth allows 1 to 24 inches. Surface depth allows 1 to 12 inches.
- **Density starts at 1.40 tons per cubic yard for both courses.** That is an unverified estimate, in a range people sometimes quote for common crushed stone such as #57. It is not a lab result for your pile. The boxes accept 1.00 to 2.00 so a lighter or heavier stone still fits. Ask the supplier for tons per cubic yard of the exact product.
- **Density source starts on Estimate.** The menu is there so the 1.40 figure is labeled as a stand-in. Choosing Supplier figure does not do extra math. It is a reminder that you typed the yard's number.
- **Compaction / waste starts at 10 percent.** There is no measured compaction rate behind that number. It adds material for compaction and an uneven base. The same percent is applied to every course. You can set it from 0 to 30.
- **Order quantities round up to the next 0.1.** A tenth of a ton or a tenth of a yard is a common sales step, and rounding up keeps the order from landing short of the estimate.
- **Quantities only.** There is no price.

This tool does not design slope, geotextile fabric, edging, drainage pipe, or a structural section. It does not set the gravel thickness under a concrete slab or in a drain trench. Use the depth from the slab plan, the drainage plan, the product instructions, and local code, then come back and enter that depth. Confirm the final yards and tons with your supplier.

## FAQ

### How many tons of gravel are in a yard?

As many as the density you enter. At the 1.40 starting estimate, one cubic yard is 1.40 short tons. At the low end of the box (1.00) a yard is 1 ton. At the high end (2.00) a yard is 2 tons. Use your supplier's tons-per-yard for the stone you are buying.

### How much does a yard of gravel weigh?

Weight follows the same density. One short ton is 2,000 pounds, so the 1.40 estimate is 2,800 pounds per cubic yard (1.40 × 2,000). That is the weight of the estimate, not a scale ticket. A supplier figure of 1.50 would be 3,000 pounds per cubic yard.

### How deep should gravel be for a driveway?

This page does not set a required depth. The depth box opens at 4 inches, and the surface box opens at 2 inches, so the form has a starting point. Those numbers are not from a code book. Soil, climate, and the stone all change the right thickness. Use the depth your supplier or local practice calls for.

### How many tons of gravel do I need for a driveway?

It depends on the area, the depth, the density, and the allowance. The worked example is a 50 ft by 12 ft driveway at 4 inches, 1.40 tons per yard, and 10 percent allowance: 11.41 calculated tons, which rounds up to 11.5 tons to order. The table lower on this page shows a few other common sizes at those same settings. Enter your own measurements for a different driveway.

### How much gravel goes under a concrete slab?

Enter the slab's length and width, then enter the gravel depth from the slab plan. The tool will convert that into yards and tons. It does not choose the depth. Follow the concrete product instructions and the local code for what belongs under the slab.

### How deep should gravel be for drainage?

Enter the depth the drainage plan uses. A trench and a driveway are different jobs, and this tool does not pick a drainage depth or a stone size. After you have that depth, the yards and tons are the same volume math as a driveway.

## Common driveway sizes

The layered driveway is the extra this page offers: a base and a surface on one footprint, each with its own depth and density, plus a density-source menu so the supplier's tons-per-yard can replace the 1.40 estimate.

The table uses the starting assumptions: 1.40 short tons per cubic yard and a 10 percent allowance. The first five rows are a single 4 inch layer. The last row is the same 12 ft by 50 ft driveway with a 4 inch base and a 2 inch surface, both at 1.40. If the surface stone is a different product, change Surface density and the surface tons will move on their own.

| Driveway | Setup | Cubic yards | Yards to order | Calculated tons | Tons to order |
| --- | --- | --- | --- | --- | --- |
| 10 ft × 20 ft | 4 in, single layer | 2.72 | 2.8 | 3.8 | 3.9 |
| 12 ft × 30 ft | 4 in, single layer | 4.89 | 4.9 | 6.84 | 6.9 |
| 12 ft × 50 ft | 4 in, single layer | 8.15 | 8.2 | 11.41 | 11.5 |
| 20 ft × 40 ft | 4 in, single layer | 10.86 | 10.9 | 15.21 | 15.3 |
| 24 ft × 40 ft | 4 in, single layer | 13.04 | 13.1 | 18.25 | 18.3 |
| 12 ft × 50 ft | 4 in base + 2 in surface | 12.22 | 12.3 | 17.11 | 17.2 |

The 10 ft by 20 ft row is the one where display rounding and the order line look a step apart: 3.8 calculated tons, 3.9 tons to order. The full amount is about 3.802 tons, so the next tenth up is 3.9. On a layered job the chart shows base tons and surface tons for whatever depth and density you entered, which this printed table cannot do.
