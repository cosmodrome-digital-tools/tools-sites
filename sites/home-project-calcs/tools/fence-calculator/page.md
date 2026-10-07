## What it calculates and who it's for

This calculator is for anyone planning a wood picket fence along one line: a privacy fence, a picket fence, or a board-on-board fence. From the fence length, post spacing, and picket size, it counts the **posts, rails, and pickets** to buy. It also sizes the **hole for each post** and counts the **bags of concrete** to set them. Fence-post concrete is part of this page, so you don't need a separate concrete calculator for your posts.

All sizes are in US units: feet for the fence, inches for pickets and holes, cubic feet for concrete and gravel, and pounds for bags.

## How to use

1. **Fence line.** Enter the total fence length in feet, gates included, and the fence height. Enter how many gates the line has.
2. **Posts.** Set the post spacing (center to center), the post size (4x4 or 6x6), and the full length of the posts you will buy.
3. **Pickets.** Enter the actual face width of one picket and the gap between pickets. For board-on-board, enter the overlap on each edge as a negative gap.
4. **Post concrete.** Choose the concrete bag you plan to use.
5. **Advanced.** Set the gate width, rails per section, your local frost depth (if you know it), and the picket waste allowance.
6. **Read the results.** The four shaded numbers at the top are your shopping list. Below them are the fence layout, the size of each post hole, and the concrete and gravel totals.

Results update as you type. To start over, reload the page.

## The formula

**Fence line**

- Fence run (ft) = fence length − (number of gates × gate width)
- Sections = fence run ÷ post spacing, rounded **up** to a whole section
- Posts = sections + 1 + number of gates
- Actual post spacing (ft) = fence run ÷ sections

One straight run with *n* sections needs *n* + 1 posts. Each gate opening splits the run, which adds one more post.

**Rails and pickets**

- Rails = sections × rails per section (each rail spans one section, post to post)
- Pickets before waste = (fence run × 12) ÷ (picket width + picket gap), rounded up
- Pickets to buy = (fence run × 12) ÷ (picket width + picket gap) × (1 + waste % ÷ 100), rounded up

With a negative gap (board-on-board overlap), each picket covers its width minus the overlap.

**Post holes** (Quikrete Setting Posts method)

- Hole diameter (in) = 3 × actual post width (3.5 in for a 4x4, 5.5 in for a 6x6)
- Depth of post in concrete (in) = the larger of (post length in inches ÷ 3) and your frost depth
- Hole depth (in) = depth of post in concrete + 6 in of gravel
- Concrete per post (cu ft) = (π × (hole diameter ÷ 2)² − post width²) × depth of post in concrete ÷ 1,728
- Gravel per post (cu ft) = π × (hole diameter ÷ 2)² × 6 ÷ 1,728

The square of the post is subtracted because the post fills that space, not concrete. 1,728 is the number of cubic inches in a cubic foot.

**Bags**

- Bags per post = concrete per post ÷ bag yield
- Bags to buy = (concrete per post × posts) ÷ bag yield, rounded **up**
- Bag yields: 50 lb Fast-Setting = 0.375 cu ft, 60 lb Fast-Setting = 0.45 cu ft, 80 lb Concrete Mix = 0.60 cu ft (Quikrete data sheets)

**Post length check**

- Post height above ground (ft) = post length − (depth of post in concrete ÷ 12)
- Shortest post for your fence height (ft) = the larger of (fence height × 1.5) and (fence height + frost depth ÷ 12)

## Worked example

A 100 ft privacy fence, 6 ft tall, with one 4 ft gate. Posts are 4x4 by 9 ft at 8 ft spacing. Pickets are 1x6 (5.5 in actual) with a 0.5 in gap, 3 rails per section, 5% picket waste, no frost depth entered, and 50 lb Quikrete Fast-Setting bags. These are the calculator's starting values.

1. Fence run = 100 − (1 × 4) = **96 ft**
2. Sections = 96 ÷ 8 = **12** (already whole)
3. Posts = 12 + 1 + 1 = **14 posts**
4. Rails = 12 × 3 = **36 rails**
5. Pickets before waste = (96 × 12) ÷ (5.5 + 0.5) = 1,152 ÷ 6 = **192**
6. Pickets to buy = 192 × 1.05 = 201.6, rounded up = **202 pickets**
7. Hole diameter = 3 × 3.5 = **10.5 in**
8. Depth of post in concrete = (9 × 12) ÷ 3 = 36 in. Hole depth = 36 + 6 = **42 in**
9. Concrete per post = (3.1416 × 5.25² − 3.5²) × 36 ÷ 1,728 = (86.59 − 12.25) × 36 ÷ 1,728 = **1.55 cu ft**
10. Bags per post = 1.5488 ÷ 0.375 = **4.13 bags**
11. Concrete for all posts = 1.5488 × 14 = **21.68 cu ft**. Bags = 21.68 ÷ 0.375 = 57.8, rounded up = **58 bags**
12. Gravel = 86.59 × 6 ÷ 1,728 = 0.30 cu ft per post × 14 = **4.21 cu ft**
13. Post height above ground = 9 − (36 ÷ 12) = **6 ft**. Shortest post for a 6 ft fence = 6 × 1.5 = **9 ft**

The last step is why the calculator starts at 9 ft posts. With Quikrete's one-third rule, a more common 8 ft post would be buried 32 in and stand only 5 ft 4 in out of the ground, shorter than a 6 ft picket. That 8 ft post would take 1.38 cu ft and 52 bags for this fence instead of 58.

## How to read your results

- **Posts, rails, pickets, and bags are already rounded up** to whole pieces. Buy at least those numbers.
- **Bags per post** is a decimal on purpose. With 4.13 bags per post you can't put exactly one bag count in every hole. Open bags and share them between holes, or round up to 5 per hole if you'd rather not split bags (that's 70 bags for the example, not 58).
- **Actual post spacing** can be shorter than what you typed. The run is split into equal sections, so a 46 ft run at 8 ft spacing becomes 6 sections of about 7.67 ft each.
- **Rails** are counted one per section per rail row. Buy rails at least as long as your actual post spacing. Rails often come in 8 ft lengths, so 8 ft spacing is a common match.
- **Gravel for post bases** is in cubic feet. Small jobs are usually bought in bags, so read the bag's cubic-foot label. For bigger orders, see the [Gravel Calculator](/gravel-calculator/).
- **Shortest post for your fence height** is the post length that keeps the post top level with the top of the fence. If your post length is shorter, the result for post height above ground shows how far short it is.

## Assumptions and limits

These are the assumptions behind every number, and why each one is there:

- **One continuous fence line.** If the line turns corners, a post must land on every corner, so each side gets split into its own sections. That can add a post or two; running the calculator once per side and subtracting the shared corner posts gives the exact count. Separate runs that don't connect each need one extra end post. Add those by hand.
- **Each gate adds one post.** A gate splits the run, and the post on the far side of the opening is the extra one. Gates are not counted for pickets or rails. Many gates are bought pre-built or framed separately.
- **Post spacing of 8 ft is a rule of thumb.** We did not find a manufacturer or code figure for it, so it is an input you can change.
- **Hole size follows Quikrete's Setting Posts guide:** a hole 3 times the post width, 1/3 of the post buried, and 6 in of gravel underneath. This is a manufacturer's project method, not a building code.
- **Frost depth.** If you enter a frost depth deeper than 1/3 of the post, the post is buried to the frost depth instead, so the concrete reaches below the frost line. There is no national frost depth. Your local building department can tell you yours.
- **Actual post widths are 3.5 in (4x4) and 5.5 in (6x6).** These are standard dressed lumber sizes, but we have not checked them against the lumber standard for this page.
- **The concrete fills the hole to ground level.** Sloping the top so water runs off the post, or stopping just below grade, will change the amount a little.
- **The post is subtracted from the concrete; the gravel is not reduced for the post.** The post sits on the gravel.
- **Bag yields come from Quikrete's data sheets.** Other brands print their own yields.
- **Picket waste of 5% is our estimate,** not a manufacturer figure. Raise it for rough-sawn or lower-grade boards.
- **No hardware, stain, or cost.** Nails, screws, brackets, gate hardware, and post caps are not counted, and there are no prices.

**Before you dig:** call 811 a few days ahead so underground utility lines can be marked. Check your local rules on fence height, setbacks from the property line, and post depth, and any HOA rules. Follow the instructions on your concrete bag. Confirm quantities with your supplier before you order.

## FAQ

### How many fence posts do I need for a 100 ft fence?

At 8 ft spacing with no gates, a straight 100 ft line needs 13 sections and **14 posts** (100 ÷ 8 = 12.5, rounded up to 13, plus 1). With one 4 ft gate, the run drops to 96 ft (12 sections), and the gate adds a post, so it is still 14. At 6 ft spacing with no gates, it's 17 sections and 18 posts.

### How much concrete do I need per 4x4 fence post?

Using Quikrete's method with an 8 ft post, the hole is 10.5 in wide and the post is buried 32 in. That holds about **1.38 cu ft** of concrete once the post is subtracted: about 3.7 bags of 50 lb Fast-Setting, 3.1 bags of 60 lb Fast-Setting, or 2.3 bags of 80 lb Concrete Mix. The table below covers other post lengths.

### How much concrete per fence post 2 feet deep?

For a 4x4 in a 10.5 in hole with 2 ft (24 in) of post in concrete: (86.59 − 12.25) × 24 ÷ 1,728 = about **1.03 cu ft**. That's about 2.75 bags of 50 lb Fast-Setting, 2.3 bags of 60 lb, or 1.7 bags of 80 lb Concrete Mix. Two feet is the depth Quikrete's one-third rule gives for a 6 ft post.

### How deep should a fence post be for a 6 ft fence?

Quikrete's guide buries 1/3 of the post's length, plus 6 in of gravel below. For the post to stand 6 ft tall, it needs to be 9 ft long, with 3 ft in the ground and a hole 42 in deep. In cold areas the post may need to go deeper to clear the frost line. Your local building code has the final say.

### What is the recommended depth for fence posts?

There is no single national figure. Quikrete's project guide uses 1/3 of the post length in the ground plus 6 in of gravel. Local codes and frost depth can require more. Enter your frost depth in the Advanced step and the calculator deepens the hole when it governs.

### How many pickets are in an 8 foot section?

An 8 ft section is 96 in. With 5.5 in pickets and a 0.5 in gap, that's 96 ÷ 6 = **16 pickets**. Butted tight with no gap, it's 96 ÷ 5.5 = 17.5, so **18 pickets**. Board-on-board with 1 in overlap on each edge takes 96 ÷ 4.5 = 21.3, so **22 pickets**. Pre-built panels vary by product, so count the boards on the panel you're buying.

### Should I use Fast-Setting concrete or regular Concrete Mix for posts?

Both are listed. Fast-Setting comes in 50 and 60 lb bags. Concrete Mix 80 lb bags hold more per bag (0.60 cu ft), so you buy fewer bags, but each one is heavier. Follow the mixing and setting directions on the bag you choose.

## Concrete bags per post, by post size and length

These rows use the same Quikrete hole rule as the calculator, with no frost depth. Each figure is for one post, with the post's own volume taken out. Round up to whole bags only once you've added up all your posts.

| Post | Post length | Hole (diameter × depth) | Concrete per post | 50 lb Fast-Setting | 60 lb Fast-Setting | 80 lb Concrete Mix |
|---|---|---|---|---|---|---|
| 4x4 | 6 ft | 10.5 in × 30 in | 1.03 cu ft | 2.75 bags | 2.29 bags | 1.72 bags |
| 4x4 | 8 ft | 10.5 in × 38 in | 1.38 cu ft | 3.67 bags | 3.06 bags | 2.29 bags |
| 4x4 | 9 ft | 10.5 in × 42 in | 1.55 cu ft | 4.13 bags | 3.44 bags | 2.58 bags |
| 4x4 | 10 ft | 10.5 in × 46 in | 1.72 cu ft | 4.59 bags | 3.82 bags | 2.87 bags |
| 6x6 | 6 ft | 16.5 in × 30 in | 2.55 cu ft | 6.80 bags | 5.67 bags | 4.25 bags |
| 6x6 | 8 ft | 16.5 in × 38 in | 3.40 cu ft | 9.07 bags | 7.55 bags | 5.67 bags |
| 6x6 | 9 ft | 16.5 in × 42 in | 3.82 cu ft | 10.20 bags | 8.50 bags | 6.37 bags |
| 6x6 | 10 ft | 16.5 in × 46 in | 4.25 cu ft | 11.33 bags | 9.44 bags | 7.08 bags |

A 6x6 post takes about 2.5 times the concrete of a 4x4 at the same length, because its hole is about 1.6 times as wide (16.5 in vs 10.5 in), which makes the hole's area about 2.5 times as large.

**Posts, rails, and pickets by fence length.** The same settings as the worked example (8 ft spacing, one 4 ft gate, 3 rails, 5.5 in pickets with a 0.5 in gap, 5% waste, 4x4 × 9 ft posts, 50 lb Fast-Setting):

| Fence length | Posts | Rails | Pickets | 50 lb bags |
|---|---|---|---|---|
| 50 ft | 8 | 18 | 97 | 34 |
| 100 ft | 14 | 36 | 202 | 58 |
| 150 ft | 21 | 57 | 307 | 87 |
| 200 ft | 27 | 75 | 412 | 112 |

Change any setting above the page to see your own numbers. The donut chart under your results shows how one post hole splits into concrete, gravel, and buried post.
