## What it calculates and who it's for

This calculator turns a garden wall into a shopping list: wall blocks, cap blocks, a leveling pad under the first course, drainage stone behind the wall, and feet of drainpipe. It is for someone stacking segmental blocks in a straight run or in a circle, such as a fire-pit ring.

You choose the shape, then enter the length or the inside diameter, the height you want to see, and the size of the block. The stone recipe follows the Belgard [SRW Quick Reference Install Guide (2023)](https://www.belgard.com/wp-content/uploads/sites/2/Belgard-SRW-Quick-Reference-Install-Guide-2023-1.pdf) (accessed October 6, 2026): a compacted pad at least 6 inches deep in a trench 12 inches wider than the block, and 12 inches of free-draining aggregate behind the wall. Another brand's sheet can call for a different pad or a different stone zone. The buried-depth, block-size, cap, waste, and density boxes are there so you can match the product in front of you.

A separate line, Above cited limit, compares the wall you would stack with a 2015 code note. That note is explained below. It is a prompt to check the code your town uses. It is not a wall design, and it is not a permit answer.

The results are material counts. They leave out price.

## How to use

The form opens on a straight wall 20 feet long, 24 inches of exposed height, a 16 inch by 6 inch block face, a 10 inch block depth, a 16 inch cap, 6 inches buried, 5 percent block waste, and a pad density of 1.40. Surcharge starts off. With those numbers the page shows 79 blocks, 15 caps, 0.68 cubic yards of pad, 0.96 tons of pad, 1.86 cubic yards of drainage stone, and 20 feet of pipe. Above cited limit shows 0.

1. Under Wall, choose Straight wall or Circle (fire pit). Enter Length or diameter. For a straight wall that box is the run, in feet. For a circle it is the open inside diameter, in feet. The 20 foot start is a straight-wall length. For a fire pit, type the inside diameter you want.
2. Enter Exposed height, the inches of wall you want to see above the ground in front. Set Surcharge to On if a driveway, parked vehicles, or a fence on top will push on the wall in addition to soil. Leave it Off if the wall only holds soil.
3. Under Block, enter the face length and the face height printed for your block. The 16 inch and 6 inch starts are placeholders. Measure your block.
4. Under Advanced, set Buried depth, Block depth, Cap length, Block waste, and Pad density. Buried depth starts at 6 inches, which is the Belgard minimum. Block depth sets the trench width. Pad density starts at 1.40 tons per cubic yard. That density is an estimate. Replace it with the figure your supplier gives you for the pad stone.
5. Read Blocks to buy, Caps to buy, the two stone lines, and Drainpipe. Then read Above cited limit. A 1 means the stacked wall is over the 2015 figure cited on this page. Read the height section below before you treat that 1 as a rule for your town.

There is no separate Reset control. Reload the page to restore the opening numbers. Advanced stays open. The form has no collapsible section.

## The formula

Three unit facts come from NIST Handbook 44 (2026), Appendix C, [General Tables of Units of Measurement](https://www.nist.gov/document/2026-nist-handbook-44-appendix-c), accessed October 6, 2026. One foot equals 12 inches. Twenty-seven cubic feet equal 1 cubic yard. An unmodified ton in US customary measure is the 2,000 pound short ton. That appendix does not give a block size, a pad thickness, or a stone density.

The pad thickness, the trench width, the burial minimum, and the drainage thickness come from the Belgard 2023 guide linked above. The guide says:

- Excavate the leveling-pad trench 12 inches wider than the block.
- The pad extends at least 6 inches in front of the first course and at least 6 inches behind it, and it is at least 6 inches deep after compaction.
- Bury a minimum of 6 inches of the block below the finished grade in front.
- Backfill 12 inches behind the wall with 3/4 inch free-draining aggregate, and do that for every course.
- Place the drainpipe as low as possible behind the wall. The guide names 4 inch or 6 inch perforated drain tile. It also says to run an outlet through the wall face every 50 feet on center.

This calculator uses those minimums as the recipe: a 6 inch compacted pad, a trench exactly 12 inches wider than the block, and a drainage zone exactly 12 inches thick for the full height of the courses. It does not add a thicker pad.

**Courses**

- Height to cover (inches) = exposed height + buried depth.
- Courses = height to cover ÷ block face height, rounded up to a whole course. A total that already divides evenly stays on that count.
- Stack height (inches) = courses × block face height.
- Exposed height of the stack (inches) = stack height − buried depth. This is the face above the ground in front after the courses are stacked. It equals the exposed height you typed when the block height divides the total evenly. It is taller when a partial course rounds up.

**Blocks and caps**

- Straight run (inches) = length in feet × 12.
- Circle run (inches) = π × inside diameter in feet × 12. That is the circumference of the open inside of the ring. π is the circle constant, about 3.14159265. The block face is counted along that inside circle.
- Blocks in one course = run ÷ block face length, rounded up to a whole block.
- Blocks to buy = blocks in one course × courses × (1 + block waste ÷ 100), rounded up to a whole block. At 5 percent, multiply by 1.05. At 0 percent, the count stays at the whole blocks already required.
- Caps to buy = run ÷ cap length, rounded up to a whole cap. The waste percent is not applied to caps. One row of caps sits on top. Cap thickness is not added to the wall height.

**Leveling pad**

- Straight wall: pad width (feet) = (block depth in inches + 12) ÷ 12. Pad thickness is 6 ÷ 12 = 0.5 feet. Cubic feet = length × pad width × 0.5. The pad is as long as the wall. Extra length past the two ends is not added. The 6 inches in front and the 6 inches behind are already inside the width.
- Circle: inside radius (feet) = diameter ÷ 2. The pad's inner radius is that radius minus 0.5 feet (6 inches toward the open center). The pad's outer radius is the inside radius plus the block depth in feet plus 0.5 feet (6 inches outside the block). Pad area (square feet) = π × (outer radius² − inner radius²). Cubic feet = area × 0.5. At the smallest allowed diameter (2 feet) and the deepest allowed block (18 inches), the inner radius of the pad is still 0.5 feet, so the ring does not close up.
- Cubic yards = cubic feet ÷ 27. The result then rounds up to the next hundredth of a yard. A value that is already on a hundredth stays there.
- Tons = cubic yards, before that rounding, × pad density. Tons then round up to the next hundredth. The density box is US short tons per cubic yard of the pad stone only.

**Drainage stone and pipe**

- Drainage height is the full stack, buried courses included, because the guide says to place the 12 inch aggregate for every course and to set the pipe low behind the wall.
- Straight wall: cubic feet = length × 1 foot of thickness × stack height in feet.
- Circle: the stone is a 12 inch ring outside the blocks. Inner radius of that ring = inside radius + block depth in feet. Outer radius = that inner radius + 1 foot. Cubic feet = π × (outer radius² − inner radius²) × stack height in feet.
- Drainage cubic yards use the same round-up to the next hundredth. There is no tons line for this stone.
- Straight drainpipe (feet) = the wall length, rounded up to the next whole foot. An exact length stays.
- Circle drainpipe (feet) = the circumference at the back of the block, 2 × π × (inside radius + block depth in feet), rounded up to the next whole foot.
- The guide's outlet through the face every 50 feet is not added. The guide does not say how long that outlet leg is.

**Height flag**

The numbers 48 and 24 come from the ICC excerpt [Significant Changes to the International Residential Code, 2015 Edition, R404.4](http://media.iccsafe.org/news/icc-enews/2017v14n3/2015_irc_sigchanges_404.4.pdf) (accessed October 6, 2026). The 2015 code text in that excerpt says retaining walls that are not laterally supported at the top and that retain in excess of 48 inches of unbalanced fill, or retaining walls exceeding 24 inches in height that resist lateral loads in addition to soil, shall be designed in accordance with accepted engineering practice. The change summary on the same page also describes the second case as more than 24 inches of unbalanced backfill when the wall resists additional lateral loads. The 2021 and 2024 wording was not checked. Do not treat 48 and 24 as the current code until you verify them.

This calculator uses one stand-in for both "unbalanced fill" and "height": the exposed height of the stack. Surcharge On is the stand-in for "lateral loads in addition to soil." The wall is treated as not supported at the top.

- Cited height limit = 24 inches if surcharge is on, and 48 inches if surcharge is off.
- Inches over that limit = exposed height of the stack − the cited limit. If the stack is under the limit, or exactly on it, this line is 0. "In excess of 48" and "exceeding 24" both mean more than that number, so 48 with surcharge off stays at 0, and 24 with surcharge on stays at 0.
- Above cited limit = 1 when inches over is more than 0, and 0 otherwise.

The same excerpt says the section does not apply to foundation walls that support buildings. It also names a safety factor of 1.5 against sliding and overturning. This page does not calculate that factor.

The donut chart is Blocks to buy and Caps to buy. It does not include the stone.

## Worked example

These are the numbers already filled in when the page opens.

A straight wall 20 feet long. Exposed height 24 inches. Buried depth 6 inches. Block face 16 inches long and 6 inches high. Block depth 10 inches. Cap length 16 inches. Surcharge off. Block waste 5 percent. Pad density 1.40.

1. Height to cover = 24 + 6 = 30 inches.
2. Courses = 30 ÷ 6 = 5 exactly. Stack height = 30 inches. Exposed height of the stack = 30 − 6 = 24 inches.
3. Run = 20 × 12 = 240 inches.
4. Blocks in one course = 240 ÷ 16 = 15 exactly.
5. Blocks before waste = 15 × 5 = 75. With 5 percent, 75 × 1.05 = 78.75. Rounded up, Blocks to buy = 79.
6. Caps to buy = 240 ÷ 16 = 15. The 5 percent is not added.
7. Pad width = 10 + 12 = 22 inches, which is 22 ÷ 12 feet. Cubic feet = 20 × (22 ÷ 12) × 0.5 = 18.333…. Cubic yards = 18.333… ÷ 27 = 0.67901…. Rounded up to the next hundredth, Leveling pad = 0.68 cubic yards.
8. Tons, before that yard rounding, = 0.67901… × 1.40 = 0.95061…. Rounded up to the next hundredth, Leveling pad = 0.96 tons.
9. Drainage height = 30 inches = 2.5 feet. Cubic feet = 20 × 1 × 2.5 = 50. Cubic yards = 50 ÷ 27 = 1.85185…. Rounded up, Drainage stone = 1.86 cubic yards.
10. Drainpipe = 20 feet.
11. Surcharge is off, so the cited limit is 48 inches. The stack's exposed height is 24, which is under 48. Above cited limit = 0. Inches over that limit = 0.

The chart reads 79 blocks and 15 caps.

**The same wall, one inch taller.** Change only Exposed height to 25.

1. Height to cover = 31 inches. Courses = 31 ÷ 6, which rounds up from 5.166… to 6. Stack height = 36 inches. Exposed height of the stack = 30 inches.
2. Blocks to buy = 15 × 6 × 1.05 = 94.5, which rounds up to 95.
3. Drainage cubic feet = 20 × 3 = 60. Cubic yards = 2.222…, which rounds up to 2.23.
4. The pad stays 0.68 cubic yards and 0.96 tons. Caps stay 15. Pipe stays 20 feet. The flag stays 0, because 30 is under 48.

**A clean check where the round-up adds nothing.** Straight wall, 27 feet long, exposed height 18 inches, buried 6 inches, block face 12 inches by 6 inches, block depth 12 inches, cap 12 inches, waste 0 percent, density 1.40.

1. Courses = 24 ÷ 6 = 4. Blocks in one course = 324 ÷ 12 = 27. Blocks to buy = 108. Caps = 27.
2. Pad cubic feet = 27 × (24 ÷ 12) × 0.5 = 27, which is 1 cubic yard exactly. The line stays 1. Tons = 1.40, shown as 1.4.
3. Stack height = 24 inches = 2 feet. Drainage = 27 × 2 = 54 cubic feet = 2 cubic yards exactly.
4. Drainpipe = 27 feet. Above cited limit = 0.

## How to read your results

Blocks to buy and Caps to buy are the shopping counts. Both are whole numbers, rounded up. Blocks in one course is the count along the run, or around the fire-pit circle, before you multiply by the courses. Courses is how many layers you stack. Stack height is those layers in inches. Exposed height of the stack is what you will see above the ground in front after burial. If that line is taller than the exposed height you typed, the block height did not divide evenly and the extra height is the partial course rounded up.

Leveling pad in cubic yards is the compacted pad: 6 inches deep after compaction, in the trench that is 12 inches wider than the block. The tons line is that same pad multiplied by the density you typed. Both lines round up to the next hundredth, so 0.679 cubic yards shows as 0.68 and 0.951 tons shows as 0.96. A number that is already exact stays exact: 1 cubic yard shows as 1, and 1.40 tons shows as 1.4. Trailing zeros are dropped.

Drainage stone is the 12 inch zone behind every course, in cubic yards, rounded up the same way. Order that stone by the yard. Ask the yard how many tons their clean 3/4 inch stone weighs. This page does not guess that weight. The pad stone in the Belgard guide is 3/4 inch minus with fines. The drainage stone is 3/4 inch free-draining aggregate. They are two different materials.

Drainpipe is feet of pipe along the back of the wall, rounded up to the next whole foot. The guide allows 4 inch or 6 inch perforated tile. This line does not choose a diameter. It also leaves out the outlet legs. The guide says to run an outlet through the face about every 50 feet, and it does not give the length of that leg. Add those feet from your site plan.

Above cited limit is 0 or 1. A 0 means the exposed height of the stack is at or under the cited limit (48 inches with surcharge off, 24 inches with surcharge on). A 1 means it is over that 2015 figure. Inches over that limit is how far. The block count still shows when the flag is 1, so you can talk about quantity. The count is not a design. Read the limits section before you build from a 1.

The chart repeats Blocks to buy and Caps to buy. It changes when those two counts change.

## Assumptions and limits

The opening block is 16 inches long, 6 inches high, and 10 inches deep, with a 16 inch cap. Those are placeholders from the build brief, not a product sheet. Measure the block and the cap you will buy.

Block waste starts at 5 percent and allows 0 to 15 percent. No manufacturer sheet was used for 5 percent. It is labeled as an assumption, and it applies only to wall blocks. Caps round up to a whole cap and get no extra percent.

Pad density starts at 1.40 short tons per cubic yard and allows 1.00 to 2.00. The 1.40 figure is an unverified estimate. The 1.00 to 2.00 window is a form limit, not a measured range of stone. Replace 1.40 with your supplier's tons per yard for the pad stone. Drainage stone is reported in cubic yards only.

The pad is counted at the compacted size in the Belgard guide: 6 inches deep after compaction. The guide does not give a loose-stone percentage for compaction, so none is added. If your supplier says the loose stone shrinks when it is compacted, order that extra on top of this line.

Buried depth allows 4 to 12 inches because that is the brief's range. The Belgard guide says a minimum of 6 inches. A 4 or 5 in this box is below that guide. The page still calculates so you can follow a different sheet.

Every course uses the full length, or the same circle. The Belgard guide tells you to pull each course into the setback. The setback distance depends on the lip or the pin, and this count does not shorten or lengthen the upper courses for that lean.

Corner blocks are left out. The straight mode is one run. The circle mode is one closed ring.

Hollow-core fill is left out. The guide says to fill open cores with free-draining aggregate. The volume depends on the block. Add it from the product sheet if your block is hollow.

Filter fabric is marked optional on the Belgard diagrams, so no fabric area is counted.

The guide also calls for 6 inches of low-permeability soil at the finished grade so surface water sheds away from the wall. That soil cap is not subtracted from the drainage stone, so the stone line can run a little high.

Geogrid is left out. The guide says reinforcement is for walls that pass a product's gravity-wall height, and that an engineer should design it. Gravity-wall heights differ by product. This page does not list them and does not estimate grid length.

A circle uses the inside diameter you type. Blocks and caps are divided into the inside circumference. A fire pit built with tapered blocks, or with the face on the outside of the ring, can need a different count. The drainage stone sits in a 12 inch ring outside the blocks, which is "behind" a wall that holds soil. A fire pit that sits on a patio and does not hold soil back may not need that ring or a full loop of pipe. The numbers still show so you can see them.

The height flag uses the same 48 and 24 inch figures for a circle as for a straight wall. A freestanding fire pit that does not retain soil is a different kind of project. Read a 1 on a fire pit as a prompt to check the product's height limit and your building department.

The 48 and 24 inch figures are from the 2015 excerpt linked above. The 2021 and 2024 text was not checked. Permit heights are local. This page does not give a national permit height. Call your building department. The flag does not decide whether you need an engineer. It shows whether the stack is over the 2015 figure, using exposed stack height as the stand-in for unbalanced fill.

This page does not design the wall. It does not check sliding, overturning, soil type, water, or the 1.5 safety factor named in the 2015 excerpt. It does not apply to a foundation wall that supports a building. Follow the product instructions and the rules where you live.

## FAQ

### How many blocks do I need for a retaining wall?

Enter the length, the exposed height, and the block face size. Blocks to buy is the count. It includes the waste percent and rounds up to a whole block. Blocks in one course is the count along one layer before that multiplication.

### How much gravel goes behind a retaining wall?

Read Drainage stone. That line is a zone 12 inches thick behind every course, including the buried courses, reported in cubic yards. The Belgard 2023 guide calls for 3/4 inch free-draining aggregate at least 12 inches out from the wall, placed as you build each course. The tons of that clean stone are not on this page. Ask your supplier for a tons-per-yard figure.

### How much gravel goes under retaining wall blocks?

Read the Leveling pad lines. The Belgard guide calls for compactable 3/4 inch minus, at least 6 inches deep after compaction, in a trench 12 inches wider than the block (6 inches in front and 6 inches behind). Cubic yards are that compacted size. Tons use the pad density you type, which starts at an unverified 1.40.

### How tall can a retaining wall be without a permit?

This page does not give a permit height. There is no national figure here. Call the building department for the town where the wall will stand, and ask before you build.

### How tall can a retaining wall be without an engineer?

The 2015 excerpt cited above says a retaining wall that is not supported at the top and that holds more than 48 inches of unbalanced fill has to be designed by engineering practice. The same excerpt says a wall exceeding 24 inches in height that also resists lateral loads besides soil has to be designed that way. This calculator sets Above cited limit to 1 when the exposed height of the stacked courses is over 48 inches, or over 24 inches if Surcharge is On. Exactly 48, and exactly 24 with surcharge on, stay at 0. The 2021 and 2024 books were not checked. A product can have a lower gravity-wall limit, and your town can have its own rule. The flag is a prompt to verify the current code, the product sheet, and the local office. It is not an engineering determination.

### How many retaining wall blocks do I need for a fire pit?

Choose Circle (fire pit) and type the inside diameter in Length or diameter. Blocks in one course is the count around that inside circle. Blocks to buy multiplies by the courses and then applies the waste percent. The 4 foot example in the next section uses the opening block size and comes to 32 blocks.

## Height check and fire-pit circle

Two views sit on this page because both show up in planning questions: a straight garden wall, and a round fire pit. The same block math runs for both. The shape changes the run from a straight length into an inside circumference, and it changes the pad and the drainage stone from a straight trench into rings.

The table uses the opening block: 16 inch face, 6 inch height, 10 inch depth, 16 inch cap, 6 inches buried, 5 percent waste, pad density 1.40, surcharge off.

| Wall | Blocks | Caps | Courses | One course | Pad (cu yd) | Pad (tons) | Drainage (cu yd) | Pipe (ft) | Above cited limit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Straight, 20 ft, exposed 24 in | 79 | 15 | 5 | 15 | 0.68 | 0.96 | 1.86 | 20 | 0 |
| Straight, 40 ft, exposed 24 in | 158 | 30 | 5 | 30 | 1.36 | 1.91 | 3.71 | 40 | 0 |
| Circle, 4 ft inside diameter, exposed 12 in | 32 | 10 | 3 | 10 | 0.52 | 0.73 | 1.17 | 18 | 0 |

The 40 foot row is the same wall at twice the length. Blocks, caps, and pipe double. The stone lines are that doubled volume, each rounded up on its own, so the pad tons show 1.91 rather than 1.92 and the drainage shows 3.71 rather than 3.72. The circle row is the same block around a 4 foot open inside. Its inside run is π × 4 × 12, about 150.8 inches, which is 10 blocks and 10 caps per course. Three courses and 5 percent waste give 32 blocks. The pipe follows the outside of the block and rounds up from about 17.8 feet to 18.

The next table shows when the height flag turns on. Length, face length, cap, waste, and density stay at the opening values. Buried depth stays at 6 inches.

| Exposed height typed | Surcharge | Block height | Exposed height of the stack | Cited limit | Above cited limit | Inches over |
|---|---|---:|---:|---:|---:|---:|
| 24 in | Off | 6 in | 24 in | 48 in | 0 | 0 |
| 48 in | Off | 6 in | 48 in | 48 in | 0 | 0 |
| 54 in | Off | 6 in | 54 in | 48 in | 1 | 6 |
| 24 in | On | 6 in | 24 in | 24 in | 0 | 0 |
| 30 in | On | 6 in | 30 in | 24 in | 1 | 6 |
| 46 in | Off | 8 in | 50 in | 48 in | 1 | 2 |

The last row is the one to watch. You typed 46 inches, which is under 48, but an 8 inch block does not divide 46 + 6 evenly. The wall stacks 7 courses, 56 inches tall, and the face above the burial is 50 inches. The flag turns to 1 because of that extra course. Blocks to buy for that row, with the other opening values, is 111.

A 0 on the opening 24 inch wall means that particular stack is under the 2015 figure with surcharge off. It does not mean every wall is fine, and it does not mean your town has adopted that 2015 sentence. Check the code edition in force, the product's gravity-wall limit, and the local building department before you build.
