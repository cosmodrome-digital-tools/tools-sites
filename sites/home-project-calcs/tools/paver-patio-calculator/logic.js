// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Paver count (with joints and waste), compacted aggregate base (cu yd and
// tons), bedding sand (cu ft and cu yd), and edge restraint (linear ft) for a
// rectangular, round, or known-area patio, walkway, or driveway.
import {
  ceilTo,
  cuFtToCuYd,
  inchesToFeet,
  round,
  validateAll,
  validateNumber,
  withWaste,
} from '@tools/calculator-core';

const SQ_IN_PER_SQ_FT = 144;

// ICPI Tech Spec 2 (rev. Feb 2020), "Construction of Interlocking Concrete
// Pavements" (see meta.json "sources", accessed 2026-10-06): minimum compacted
// base 4 in for sidewalks, patios and pedestrian areas over well-drained soils,
// 6 in for residential driveways; 2 to 4 in thicker in colder climates or
// continually wet or weak soils. Fixed presets; the extra depth is an input.
export const BASE_DEPTH_IN = { patio: 4, driveway: 6 };
export const USES = Object.keys(BASE_DEPTH_IN);
export const SOILS = ['drained', 'poor'];
export const SHAPES = ['rectangle', 'circle', 'area'];

const SHAPE_RULES = {
  rectangle: {
    length: { label: 'Length', min: 1, max: 100 },
    width: { label: 'Width', min: 1, max: 100 },
  },
  circle: {
    diameter: { label: 'Diameter', min: 1, max: 100 },
  },
  area: {
    area: { label: 'Area', min: 1, max: 10000 },
  },
};
const COMMON_RULES = {
  paverLength: { label: 'Paver length', min: 4, max: 24 },
  paverWidth: { label: 'Paver width', min: 2, max: 24 },
  jointWidth: { label: 'Joint width', min: 0, max: 0.5 },
  sandDepth: { label: 'Bedding sand depth', min: 0.5, max: 2 },
  density: { label: 'Base density', min: 1, max: 2 },
  waste: { label: 'Paver waste', min: 0, max: 20 },
};
const EXTRA_BASE_RULE = { label: 'Extra base for poor soil', min: 2, max: 4 };
const PERIMETER_RULE = { label: 'Edge length', min: 1, max: 2000, required: false };

/** Pavers per square foot, counting one joint width on each paver's length and width. */
export function paversPerSqFt(paverLength, paverWidth, jointWidth = 0) {
  return SQ_IN_PER_SQ_FT / ((paverLength + jointWidth) * (paverWidth + jointWidth));
}

/** Compacted base depth in inches for a use and soil condition. */
export function baseDepthIn(use, soil, extraBase = 0) {
  return BASE_DEPTH_IN[use] + (soil === 'poor' ? extraBase : 0);
}

/** Area (sq ft) and perimeter (linear ft, or undefined if unknown) of the paved shape. */
function footprint(shape, v) {
  if (shape === 'rectangle') return { area: v.length * v.width, perimeter: 2 * (v.length + v.width) };
  if (shape === 'circle') return { area: Math.PI * (v.diameter / 2) ** 2, perimeter: Math.PI * v.diameter };
  return { area: v.area, perimeter: v.perimeter };
}

/** Compacted base in tons for an area (sq ft), depth (in), and density (tons per cu yd). */
const baseTons = (area, depthIn, density) => cuFtToCuYd(area * inchesToFeet(depthIn)) * density;

export function calculate(raw = {}) {
  const errors = {};
  const shape = String(raw.shape ?? 'rectangle');
  const use = String(raw.use ?? 'patio');
  const soil = String(raw.soil ?? 'drained');
  if (!SHAPES.includes(shape)) errors.shape = 'Choose rectangle, circle, or enter square feet.';
  if (!USES.includes(use)) errors.use = 'Choose patio / walkway or driveway.';
  if (!SOILS.includes(soil)) errors.soil = 'Choose a soil condition.';

  const rules = { ...(SHAPE_RULES[shape] ?? SHAPE_RULES.rectangle), ...COMMON_RULES };
  if (soil === 'poor') rules.extraBase = EXTRA_BASE_RULE;
  const checked = validateAll(raw, rules);
  if (!checked.ok) Object.assign(errors, checked.errors);

  // Edge length is optional and only asked for when the area is typed in.
  let perimeter;
  if (shape === 'area') {
    const p = validateNumber(raw.perimeter, PERIMETER_RULE);
    if (p.ok) perimeter = p.value;
    else errors.perimeter = p.message;
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  const v = { ...checked.values, perimeter };
  const { area, perimeter: edge } = footprint(shape, v);

  const perSqFt = paversPerSqFt(v.paverLength, v.paverWidth, v.jointWidth);
  const paversExact = area * perSqFt;
  const pavers = ceilTo(withWaste(paversExact, v.waste), 1);

  const depth = baseDepthIn(use, soil, v.extraBase);
  const baseCuFt = area * inchesToFeet(depth);
  const sandCuFt = area * inchesToFeet(v.sandDepth);

  // Chart: base tons at each ICPI depth option (4 in, 6 in, and each plus the
  // extra poor-soil depth), so the visitor sees what the use/soil choice costs in weight.
  const extra = soil === 'poor' ? v.extraBase : 2;
  const depths = [...new Set([4, 6, 4 + extra, 6 + extra])].sort((a, b) => a - b);
  const chart = depths.map((d) => {
    const tons = round(baseTons(area, d, v.density), 1);
    return { label: `${d}" · ${tons} t`, value: tons };
  });

  return {
    ok: true,
    results: {
      pavers,
      paversNoWaste: round(paversExact, 1),
      paversPerSqFt: round(perSqFt, 2),
      area: round(area, 1),
      baseDepth: depth,
      baseTons: round(baseTons(area, depth, v.density), 2),
      baseCuYd: round(cuFtToCuYd(baseCuFt), 2),
      sandCuFt: round(sandCuFt, 1),
      sandCuYd: round(cuFtToCuYd(sandCuFt), 2),
      edgeRestraint: edge === undefined ? NaN : round(edge, 1),
    },
    chart,
  };
}
