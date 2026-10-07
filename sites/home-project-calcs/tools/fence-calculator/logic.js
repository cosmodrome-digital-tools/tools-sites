// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Wood fence materials for one straight fence line: posts, rails, pickets, and
// the concrete and gravel to set each post with Quikrete's post-setting method
// (hole 3x the post width; post buried 1/3 of its length on a 6 in gravel base).
import { ceilTo, round, validateAll } from '@tools/calculator-core';

const CU_IN_PER_CU_FT = 1728;

// Actual (dressed) face width of nominal posts, in inches. Standard lumber
// sizes (PS 20); not re-checked against the standard this session.
export const POST_WIDTHS = { '4x4': 3.5, '6x6': 5.5 };

// Bag yields in cubic feet per bag from the Quikrete data sheets
// (see meta.json "sources", accessed 2026-10-06). Not user-editable.
export const BAGS = {
  fast50: { label: '50 lb Quikrete Fast-Setting', yield: 0.375 },
  fast60: { label: '60 lb Quikrete Fast-Setting', yield: 0.45 },
  mix80: { label: '80 lb Quikrete Concrete Mix', yield: 0.6 },
};

// Quikrete post-setting rule, as summarized in the build brief.
export const HOLE_DIAMETER_FACTOR = 3; // hole diameter = 3 x post width
export const BURY_FRACTION = 1 / 3; // post buried 1/3 of its overall length
export const GRAVEL_BASE_IN = 6; // gravel under the post, inches

export const RAIL_OPTIONS = [2, 3];

export const RULES = {
  fenceLength: { label: 'Fence length', min: 10, max: 1000 },
  fenceHeight: { label: 'Fence height', min: 3, max: 8 },
  postSpacing: { label: 'Post spacing', min: 4, max: 10 },
  postLength: { label: 'Post length', min: 5, max: 12 },
  gates: { label: 'Number of gates', min: 0, max: 10 },
  gateWidth: { label: 'Gate width', min: 2, max: 12 },
  picketWidth: { label: 'Picket width', min: 3, max: 8 },
  picketGap: { label: 'Picket gap', min: -2, max: 2 },
  frostDepth: { label: 'Frost depth', min: 0, max: 72 },
  picketWaste: { label: 'Picket waste', min: 0, max: 15 },
};

/**
 * Concrete, gravel, and buried-post volume for ONE post hole, in cubic feet.
 * postWidthIn: actual post face width (in); buryIn: depth of post in concrete (in).
 */
export function holeVolumes(postWidthIn, buryIn) {
  const diameterIn = HOLE_DIAMETER_FACTOR * postWidthIn;
  const circleSqIn = Math.PI * (diameterIn / 2) ** 2;
  const postSqIn = postWidthIn ** 2;
  return {
    diameterIn,
    concrete: ((circleSqIn - postSqIn) * buryIn) / CU_IN_PER_CU_FT,
    gravel: (circleSqIn * GRAVEL_BASE_IN) / CU_IN_PER_CU_FT,
    post: (postSqIn * buryIn) / CU_IN_PER_CU_FT,
  };
}

/** Posts and sections for a straight run: one post per section plus the end post, plus one per gate. */
export function postLayout(runFt, spacingFt, gates) {
  const sections = ceilTo(runFt / spacingFt, 1);
  return { sections, posts: sections + 1 + gates };
}

export function calculate(raw = {}) {
  const errors = {};
  const checked = validateAll(raw, RULES);
  if (!checked.ok) Object.assign(errors, checked.errors);
  const v = checked.ok ? checked.values : {};

  const postWidth = POST_WIDTHS[raw.postSize];
  if (!postWidth) errors.postSize = 'Choose a 4x4 or 6x6 post.';
  const bag = BAGS[raw.bagType];
  if (!bag) errors.bagType = 'Choose a concrete bag.';
  const rails = Number(raw.railsPerSection);
  if (!RAIL_OPTIONS.includes(rails)) errors.railsPerSection = 'Choose 2 or 3 rails per section.';

  if (checked.ok) {
    if (!Number.isInteger(v.gates)) errors.gates = 'Number of gates must be a whole number.';
    else if (v.gates * v.gateWidth >= v.fenceLength) {
      errors.gates = `${v.gates} gate(s) at ${v.gateWidth} ft use up the whole ${v.fenceLength} ft fence. Use fewer or narrower gates.`;
    }
    // Negative gap = board-on-board overlap on each edge; it must leave a gap
    // between the front-row pickets (overlap less than half the picket width).
    if (v.picketGap < 0 && -v.picketGap >= v.picketWidth / 2) {
      errors.picketGap = 'Overlap (negative gap) must be less than half the picket width.';
    }
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  // Fence line
  const gateOpenings = v.gates * v.gateWidth; // ft
  const fencedRun = v.fenceLength - gateOpenings; // ft of pickets and rails
  const { sections, posts } = postLayout(fencedRun, v.postSpacing, v.gates);

  // Rails and pickets
  const railCount = sections * rails;
  const picketsExact = (fencedRun * 12) / (v.picketWidth + v.picketGap);
  const picketsBeforeWaste = ceilTo(picketsExact, 1);
  const pickets = ceilTo(picketsExact * (1 + v.picketWaste / 100), 1);

  // Post holes: bury 1/3 of the post, or deeper to reach the frost depth.
  const buryIn = Math.max(v.postLength * 12 * BURY_FRACTION, v.frostDepth);
  const hole = holeVolumes(postWidth, buryIn);
  const concreteTotal = hole.concrete * posts;
  const gravelTotal = hole.gravel * posts;

  // Shortest post that still stands as tall as the fence:
  // above ground = L - max(L/3, frost) >= H  ->  L >= max(1.5 H, H + frost).
  const minPostLength = Math.max(v.fenceHeight / (1 - BURY_FRACTION), v.fenceHeight + v.frostDepth / 12);

  return {
    ok: true,
    results: {
      posts,
      rails: railCount,
      pickets,
      concreteBags: ceilTo(concreteTotal / bag.yield, 1),
      sections,
      actualSpacing: round(fencedRun / sections, 2),
      fencedRun: round(fencedRun, 2),
      picketsBeforeWaste,
      holeDiameter: round(hole.diameterIn, 2),
      holeDepth: round(buryIn + GRAVEL_BASE_IN, 2),
      concretePerPost: round(hole.concrete, 3),
      bagsPerPost: round(hole.concrete / bag.yield, 2),
      concreteTotal: round(concreteTotal, 2),
      gravelTotal: round(gravelTotal, 2),
      postAboveGround: round(v.postLength - buryIn / 12, 2),
      minPostLength: round(minPostLength, 2),
    },
    // Donut legend labels carry the cu ft value (the chart title names the unit).
    chart: [
      { label: `Concrete ${round(hole.concrete, 2).toFixed(2)}`, value: round(hole.concrete, 3) },
      { label: `Gravel ${round(hole.gravel, 2).toFixed(2)}`, value: round(hole.gravel, 3) },
      { label: `Post ${round(hole.post, 2).toFixed(2)}`, value: round(hole.post, 3) },
    ],
  };
}
