// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Rebar grid for a rectangular slab or footing: bars each direction, cut
// lengths, lap-aware stick count, purchase weight, tie points, and chairs.
// All internal math is in inches to keep rounding predictable.
import { INCHES_PER_FOOT, ceilTo, round, validateAll, withWaste } from '@tools/calculator-core';

// Nominal unit weights in lb per linear foot (ASTM A615 / CRSI, see meta.json
// "sources", accessed 2026-10-06). Fixed, not user-editable.
export const BAR_WEIGHTS = { 3: 0.376, 4: 0.668, 5: 1.043, 6: 1.502 };

export const RULES = {
  length: { label: 'Length', min: 1, max: 100 },
  width: { label: 'Width', min: 1, max: 100 },
  spacing: { label: 'Spacing', min: 6, max: 36 },
  cover: { label: 'Edge cover', min: 1, max: 6 },
  stickLength: { label: 'Stick length', min: 10, max: 40 },
  lap: { label: 'Lap length', min: 0, max: 60 },
  chairSpacing: { label: 'Chair spacing', min: 12, max: 72 },
  waste: { label: 'Waste allowance', min: 0, max: 20 },
};

// Spacings drawn in the comparison chart, in inches on center.
export const CHART_SPACINGS = [12, 16, 18, 24, 36];

/** Round down without float surprises (e.g. 240 / 80 = 2.9999999). */
const floorSafe = (value) => Math.floor(Number(value.toPrecision(12)));

/**
 * Number of bars (or chair rows) across a span: enough spaces that the gap
 * never exceeds the chosen spacing, plus one for the starting bar.
 */
export function countAcross(spanIn, spacingIn) {
  return ceilTo(spanIn / spacingIn, 1) + 1;
}

/**
 * Sticks needed for `count` identical runs of `cutIn` inches.
 * A run longer than one stick is spliced: each added stick overlaps the last
 * by `lapIn`, so n sticks cover n * stick - (n - 1) * lap.
 * Every run uses (n - 1) full sticks plus one remainder piece; remainder
 * pieces are cut from shared sticks as many per stick as fit.
 */
export function sticksForRuns(count, cutIn, stickIn, lapIn) {
  const perRun = Math.max(1, ceilTo((cutIn - lapIn) / (stickIn - lapIn), 1));
  const lappedIn = cutIn + (perRun - 1) * lapIn;
  const remainderIn = lappedIn - (perRun - 1) * stickIn;
  const piecesPerStick = Math.max(1, floorSafe(stickIn / remainderIn));
  return {
    sticks: count * (perRun - 1) + ceilTo(count / piecesPerStick, 1),
    splices: count * (perRun - 1),
    lappedIn,
  };
}

/** The whole grid for already-validated numbers. */
function grid(v) {
  const stickIn = v.stickLength * INCHES_PER_FOOT;
  const lapIn = v.lap;
  const spanLengthIn = v.length * INCHES_PER_FOOT - 2 * v.cover; // usable span along the length
  const spanWidthIn = v.width * INCHES_PER_FOOT - 2 * v.cover; // usable span across the width

  // Lengthwise bars run the length and are spaced across the width (and vice versa).
  const barsAlongLength = countAcross(spanWidthIn, v.spacing);
  const barsAlongWidth = countAcross(spanLengthIn, v.spacing);
  const runL = sticksForRuns(barsAlongLength, spanLengthIn, stickIn, lapIn);
  const runW = sticksForRuns(barsAlongWidth, spanWidthIn, stickIn, lapIn);

  const sticksBeforeWaste = runL.sticks + runW.sticks;
  const sticksToBuy = ceilTo(withWaste(sticksBeforeWaste, v.waste), 1);

  return {
    barsAlongLength,
    barsAlongWidth,
    spanLengthIn,
    spanWidthIn,
    runL,
    runW,
    sticksBeforeWaste,
    sticksToBuy,
  };
}

export function calculate(raw = {}) {
  const errors = {};
  const barSize = String(raw.barSize ?? '4').replace('#', '').trim();
  if (!Object.hasOwn(BAR_WEIGHTS, barSize)) errors.barSize = 'Choose bar size #3, #4, #5, or #6.';

  const checked = validateAll(raw, RULES);
  if (!checked.ok) Object.assign(errors, checked.errors);

  if (checked.ok) {
    const { length, width, cover } = checked.values;
    if (Math.min(length, width) * INCHES_PER_FOOT - 2 * cover <= 0) {
      errors.cover = 'Edge cover on both sides uses up the whole width. Use a smaller cover or a bigger slab.';
    }
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const v = checked.values;
  const unitWeight = BAR_WEIGHTS[barSize];
  const g = grid(v);

  const chairs =
    countAcross(g.spanLengthIn, v.chairSpacing) * countAcross(g.spanWidthIn, v.chairSpacing);
  const linearInches = g.barsAlongLength * g.runL.lappedIn + g.barsAlongWidth * g.runW.lappedIn;

  return {
    ok: true,
    results: {
      sticksToBuy: g.sticksToBuy,
      stickLength: v.stickLength,
      weightToBuy: round(g.sticksToBuy * v.stickLength * unitWeight, 1),
      barsAlongLength: g.barsAlongLength,
      cutLengthAlongLength: round(g.spanLengthIn / INCHES_PER_FOOT, 2),
      sticksAlongLength: g.runL.sticks,
      barsAlongWidth: g.barsAlongWidth,
      cutLengthAlongWidth: round(g.spanWidthIn / INCHES_PER_FOOT, 2),
      sticksAlongWidth: g.runW.sticks,
      lapSplices: g.runL.splices + g.runW.splices,
      linearFeet: round(linearInches / INCHES_PER_FOOT, 1),
      sticksBeforeWaste: g.sticksBeforeWaste,
      tiePoints: g.barsAlongLength * g.barsAlongWidth,
      chairs,
      unitWeight,
    },
    chart: CHART_SPACINGS.map((spacing) => ({
      label: `${spacing} in`,
      value: grid({ ...v, spacing }).sticksToBuy,
    })),
  };
}
