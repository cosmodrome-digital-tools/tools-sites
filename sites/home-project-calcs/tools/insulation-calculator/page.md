## What it calculates and who it's for

This page estimates attic-floor insulation for a US house. It reads the R-value ENERGY STAR recommends adding to the attic for your climate zone and for how much insulation is already there (none, or about 3-4 inches). It then counts either Owens Corning AttiCat blown fiberglass bags or EcoTouch fiberglass batt packages for the attic floor you measure.

It is for a homeowner planning an attic top-off or a first layer on an open attic floor. It uses square feet, R-value, inches of thickness, and whole bags or packages. It does not price the material, size wall cavities, or look up your county.

## How to use

1. Measure the attic floor in square feet. Use the flat floor area, not the sloped roof surface. The starting value is 1,000 sq ft. Allowed range is 100 to 5,000.
2. Choose your US climate zone from the numbered 2021 IECC map, not from a color map labeled Marine, Hot-Humid, Mixed-Humid, or Cold. Those color names are a different system. Open the [Department of Energy insulation page](https://www.energy.gov/cmei/buildings/articles/energy-efficient-home-improvement-credit-insulation-and-air-sealing) and use the map marked Source: 2021 IECC. Figure 4 in the [DOE 2021 climate-zone guide (PDF)](https://www.osti.gov/servlets/purl/1893981) is the same numbered map. Match it to this menu: zone 1; zone 2; zone 3; zone 4 except marine (4A and 4B); marine 4, zone 5, or zone 6; zones 7 and 8. This calculator does not look up a county for you. The ENERGY STAR window map uses different region names, so do not use that one either.
3. Say whether the attic is uninsulated or already has about 3-4 inches. Those are the two attic columns ENERGY STAR publishes. With about 3-4 inches, the number is what to add on top of the old layer, which stays in place.
4. Choose blown fiberglass (AttiCat chart) or batts (EcoTouch). For batts, pick the batt R-value and type the square feet printed on the package. The 64 starting value is one published package, explained below. Change it when the label says something else.
5. Open Advanced only if you need it. Leave the target R-value blank to keep the ENERGY STAR number to add. Type a number from 13 to 60 to aim at a different R-value. Extra waste starts at 0 percent because the charts already describe coverage. You can add up to 15 percent.
6. Read the ENERGY STAR R-value to add, the bags or packages to buy, and the thickness. Results update as you edit a field. You can also press Calculate.

The batt R-value and package coverage stay on the form even when you choose blown fiberglass. They affect the count only when Product type is batts.

## The formula

**ENERGY STAR R-value to add.** ENERGY STAR's attic columns are headed "Add Insulation to Attic," so each number is the R-value to add. For the zone and the existing-insulation choice, it is the attic number in the table farther down this page. Zone 1 uninsulated is R-30. Zone 1 with about 3-4 inches is R-25. Zones 2 and 3 are R-49 uninsulated and R-38 with about 3-4 inches. Zones 4A through 8 are R-60 uninsulated and R-49 with about 3-4 inches. ENERGY STAR says this guidance is based on 2021 IECC Table R402.1.3.

**Goal R-value.** If Target R-value override is blank, the goal is the ENERGY STAR R-value to add. If you type a number, that number is the goal. The ENERGY STAR result still shows the table value.

**Blown fiberglass (AttiCat, 27.5 lb bag).** The May 2026 AttiCat data sheet lists bags per 1,000 sq ft and a minimum thickness for nine R-values. This tool uses all nine:

| Chart R-value | Bags per 1,000 sq ft | Minimum thickness |
| --- | --- | --- |
| R-13 | 5.9 | 5 in |
| R-19 | 9 | 7 in |
| R-22 | 10.5 | 8 in |
| R-26 | 12.6 | 9.5 in |
| R-30 | 14.6 | 10.75 in |
| R-38 | 19 | 13.5 in |
| R-44 | 22.4 | 15.5 in |
| R-49 | 25 | 17 in |
| R-60 | 31.5 | 20.5 in |

The row used is the smallest of those nine whose R-value is at least the goal. The tool never makes up a bag rate between rows. For example, the zone 1 goal of R-25 uses the R-26 row, a goal of R-31 through R-38 uses R-38, R-45 through R-49 uses R-49, and R-50 through R-60 uses R-60.

Bags before rounding = (bags per 1,000 sq ft ÷ 1,000) × attic floor area in sq ft × (1 + extra waste ÷ 100).

Bags to buy = that amount rounded up to a whole bag.

The blown minimum thickness is the minimum thickness on that row. The sheet lists the same figure as the minimum settled thickness, so the depth has to reach it after the material settles, not just on the day it is blown. The sheet's extra Minnesota inches and bags are not added.

**Batts (EcoTouch).** One layer covers the attic floor. Packages before rounding = (attic floor area in sq ft ÷ package coverage in sq ft) × (1 + extra waste ÷ 100). Packages to buy = that amount rounded up.

Batt thickness comes from the EcoTouch manufacturers fact sheet for the standard batt, not the compressed cathedral batt: R-13 is 3.5 in, R-19 is 6.25 in, R-30 is 9.5 in, and R-38 is 12 in.

The 64 sq ft starting coverage is one row on that fact sheet: R-38, 12 in thick, 24 in wide, 48 in long, 8 pieces per package, 64.0 sq ft per package (publication 10017881, December 2012). The same sheet lists other coverages for other widths. The field is there so you can type the square feet on the package you are buying.

**R-value short of your goal.** For blown fiberglass, the installed R-value is the AttiCat row. For batts, it is the batt you selected. The shortfall is the goal minus that R-value, or 0 when the installed R-value is already at least the goal. This is a comparison of those two R-values. It does not convert inches of old insulation into R-value, and it does not add a second batt layer.

The line chart always shows AttiCat bags to buy for this attic, at R-30, R-38, R-49, and R-60, including extra waste and rounding up. It stays on the page when you switch to batts so you can compare the bag chart with a batt count.

## Worked example

**Blown fiberglass, the form's starting values.** Attic floor 1,000 sq ft, zones 4A and 4B, no existing insulation, AttiCat, target left blank, extra waste 0.

ENERGY STAR for an uninsulated attic in zones 4A and 4B is R-60. That matches an AttiCat row, so the row used is R-60: 31.5 bags per 1,000 sq ft and 20.5 in minimum thickness.

31.5 × (1,000 ÷ 1,000) × 1.00 = 31.5 bags before rounding. Rounded up, buy 32 bags. The R-value short of the goal is 0. Batt thickness does not apply, so that line shows a dash.

The line chart for this attic is 15 bags at R-30 (14.6 rounds up), 19 bags at R-38, 25 bags at R-49, and 32 bags at R-60.

**Same attic with EcoTouch batts.** Switch Product type to batts, keep R-38, and keep package coverage at 64 sq ft. ENERGY STAR is still R-60. One layer: 1,000 ÷ 64 = 15.625 packages before rounding, shown as 15.63, and you buy 16 packages. Batt thickness is 12 in. The AttiCat row and the blown thickness show a dash. The shortfall is 60 − 38 = 22 R. The tool does not turn that 22 R into a second layer of packages.

## How to read your results

The large number is the R-value ENERGY STAR recommends adding to the attic for the zone and the existing insulation you chose. With about 3-4 inches already there, it is the amount to add on top, not the attic's total. It does not change when you pick blown fiberglass or batts. It changes when you change the zone or the existing-insulation choice. A typed target override does not replace this line. The override changes the goal used for the AttiCat row and for the shortfall.

Bags or batt packages is the shopping count. It is always a whole number, rounded up. Amount before rounding up is the exact chart or coverage math, so you can see that 31.5 bags becomes 32 bags.

R-value short of your goal is 0 when the AttiCat row, or the single batt layer, already meets the goal. A number above 0 means that choice is still below the goal. If you type an override, the shortfall uses the number you typed. The ENERGY STAR line does not change, so you can still compare R-60 on that line with an AttiCat row of R-30. For batts, the usual case in zones 4 through 8 is a gap, because the highest batt in this list is R-38 and the uninsulated attic target is R-60. Closing that gap with another layer is outside this calculator.

Blown minimum thickness is the depth the AttiCat chart requires for the row used. Check it in the attic with a ruler or the depth marks made for this job. Meeting the bag count without meeting the thickness does not deliver the labeled R-value. The AttiCat sheet says both the bag count and at least the minimum thickness are required.

Batt thickness is the labeled thickness of the EcoTouch batt you selected. AttiCat row used is the data-sheet R-value the bag count came from. When the goal sits between published rows, this R-value is higher than the goal (R-26 for a goal of R-25, for example). You are buying the next published coverage, not a made-up bag rate in between.

Buy the whole bags or packages. Confirm the package square feet, the bag weight (AttiCat is 27.5 lb on the data sheet), and the current coverage chart with your supplier before you order.

## Assumptions and limits

The attic area is the floor, in square feet, from 100 to 5,000. The starting area is 1,000.

The R-values are ENERGY STAR's recommendations for adding insulation to an existing attic, based on the 2021 IECC. The 2024 IECC sets lower minimum ceiling levels for new homes (R-38 in zones 2 and 3, R-49 in zones 4 through 8), so your local code may ask for less than this page suggests. More insulation than the code minimum is allowed.

Climate zones follow the ENERGY STAR attic table: 1; 2; 3; 4A and 4B together; 4C, 5, and 6 together; 7 and 8 together. Zones that share an attic target on that table are one menu choice. The floor and wall columns on the ENERGY STAR page are not calculated.

Existing insulation is only "none" or "about 3-4 inches," because those are the two attic columns. Both columns are the R-value to add, and the old insulation stays in place. The calculator does not estimate R-value from some other depth.

Blown counts use the AttiCat bags per 1,000 sq ft for all nine rows on the May 2026 sheet, R-13 through R-60. A goal between rows uses the next higher row. Minnesota's extra inches and extra bags are not used. Blown cellulose is not estimated. Other blown fiberglass brands have their own bag charts, so use this count only for AttiCat bags.

Batt counts are one layer across the floor area you entered. Thicknesses are the standard EcoTouch batts at R-13, R-19, R-30, and R-38. Compressed cathedral batts (for example R-30 at 8.25 in or R-38 at 10.25 in on the same fact sheet) are not used. Package coverage starts at 64 sq ft from one 2012 fact-sheet row and should be replaced with the number on your package. The allowed coverage range, 10 to 400 sq ft, is only a check against typos.

Extra waste starts at 0 percent. The manufacturer coverage figures are already the coverage used in the bag and package math. Purchase quantities round up to the next whole bag or package.

Air sealing, vapor retarders, recessed-light clearances, and ventilation are out of scope. Blown-in depth must meet the chart minimum thickness shown in the results. Follow the product instructions and local codes, and confirm quantities with your supplier. Nothing here decides whether a particular attic is safe to insulate, and the page does not claim a contractor license or a code official's approval.

## FAQ

### What R-value insulation should I use in an attic?

Add the ENERGY STAR attic number for your climate zone and for whether the attic is bare or already has about 3-4 inches. That is R-30 for a bare attic or R-25 on top of 3-4 inches in zone 1, R-49 or R-38 in zones 2 and 3, and R-60 or R-49 in zones 4 through 8. The full table is below. Local code and your supplier can call for something different.

### How many bags of blown insulation do I need?

For AttiCat fiberglass, multiply the sheet's bags per 1,000 sq ft by your attic floor in thousands of square feet, then round up. A 1,000 sq ft uninsulated attic in zones 4A and 4B is the R-60 row: 31.5 bags, so you buy 32. The result also shows the minimum thickness for that row.

### How much does a bag of blown insulation cover?

The May 2026 AttiCat sheet's maximum net coverage is 68.5 sq ft per bag at R-30, 52.6 at R-38, 39.9 at R-49, and 31.8 at R-60. This calculator counts bags from the bags-per-1,000 column (14.6, 19, 25, and 31.5), then rounds up to a whole bag. Those two columns are both printed on the sheet. They are rounded differently, so the tool follows the bag column the sheet tells the installer to meet.

### What R-value should an attic in Texas use?

Texas is more than one climate zone. This page does not assign a zone to a state or a county. Use the Department of Energy map linked above, then pick that zone in the form. The table below is the whole answer this page gives. There is no separate state calculator.

### What R-value insulation should I use for 2x4 walls?

This calculator does not estimate wall cavities. ENERGY STAR's insulation table also mentions walls and floors. Those recommendations are not calculated here.

### How much insulation do I need in my attic?

Measure the attic floor, pick the climate zone from the map, and say whether you already have about 3-4 inches. The ENERGY STAR R-value to add, the bag or package count, and the thickness to install are the results. If the insulation you can see is some depth other than none or about 3-4 inches, this tool will not convert that depth into R-value.

## ENERGY STAR attic R-values by zone

ENERGY STAR's recommended attic levels for retrofitting existing wood-framed buildings are below. Both columns are the R-value to add. The same numbers drive the calculator. "About 3-4 inches" is the table's second attic column.

| Climate zone | Add to an uninsulated attic | Add on top of about 3-4 inches |
| --- | --- | --- |
| Zone 1 | R-30 | R-25 |
| Zone 2 | R-49 | R-38 |
| Zone 3 | R-49 | R-38 |
| Zones 4A and 4B | R-60 | R-49 |
| Zones 4C, 5, and 6 | R-60 | R-49 |
| Zones 7 and 8 | R-60 | R-49 |

The line chart on the calculator is the matching AttiCat shopping count for the attic area and extra waste you entered, at R-30, R-38, R-49, and R-60. At the starting 1,000 sq ft and 0 percent extra waste, that line is 15, 19, 25, and 32 bags.

Check blown depth against the minimum thickness in your results. The bag count and the thickness belong together. Air sealing, vapor retarders, lights, flues, and attic ventilation are separate work and are not sized here.
