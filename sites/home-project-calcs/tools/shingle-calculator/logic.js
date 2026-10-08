// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Shingle Calculator: roof area from a footprint and a pitch (or a pitch
// multiplier), then field bundles before and after waste, starter, ridge cap,
// underlayment rolls, and nails. Every purchase quantity rounds UP.
import { ceilTo, round, validateNumber } from '@tools/calculator-core';

export const SQ_FT_PER_SQUARE = 100; // one roofing square = 100 sq ft of roof surface

// 2024 IRC R905.2.2 and Table R905.1.1(2): asphalt shingles only on slopes of
// 2/12 or more; from 2/12 up to 4/12 two layers of underlayment are required.
// Pitch is rounded to 2 decimals before these checks, the same as the Roof
// Pitch Calculator, so both tools put a given pitch in the same band.
export const MIN_PITCH = 2;
export const DOUBLE_UNDERLAYMENT_BELOW = 4;

// Accessory coverage presets, from the manufacturers' data sheets (see meta.json sources).
// ui.js copies these into the editable coverage fields when the product line changes.
export const PRODUCTS = {
  gaf: {
    label: 'GAF: Pro-Start, Seal-A-Ridge, FeltBuster',
    starterCoverage: 120.33, // Pro-Start: approx. 120.33 lin ft per bundle (split in half)
    ridgeCoverage: 25, // Seal-A-Ridge: 4 bundles cover approx. 100 lin ft
    underlaymentCoverage: 937.5, // FeltBuster: 1,000 sq ft per roll excluding laps, less 3 in side laps on a 48 in roll (1,000 x 45/48)
  },
  oc: {
    label: 'Owens Corning: Starter Strip Plus, ProEdge, ProArmor',
    starterCoverage: 105, // Starter Strip Plus: approx. 105 lin ft per bundle
    ridgeCoverage: 33, // ProEdge 12 x 36 in: 33 lin ft per bundle
    underlaymentCoverage: 929, // ProArmor: 929 sq ft per roll with a 3 in overlap
  },
};

export const RULES = {
  length: { label: 'Footprint length', min: 10, max: 200 },
  width: { label: 'Footprint width', min: 10, max: 100 },
  pitch: { label: 'Roof pitch', min: 0, max: 24 },
  multiplier: { label: 'Pitch multiplier', min: 1, max: 2.5 },
  eave: { label: 'Eave length', min: 0, max: 500 },
  rake: { label: 'Rake length', min: 0, max: 500 },
  ridgeHip: { label: 'Ridge and hip length', min: 0, max: 500 },
  bundlesPerSquare: { label: 'Bundles per square', min: 3, max: 5 },
  waste: { label: 'Waste allowance', min: 5, max: 25 },
  starterCoverage: { label: 'Starter coverage', min: 50, max: 200 },
  ridgeCoverage: { label: 'Ridge-cap coverage', min: 15, max: 45 },
  underlaymentCoverage: { label: 'Underlayment roll coverage', min: 200, max: 1000 },
  nailsPerSquare: { label: 'Nails per square', min: 100, max: 400 },
};

/** Inputs shown for each pitch mode (ui.js hides the other one). */
export const PITCH_FIELDS = { pitch: ['pitch'], multiplier: ['multiplier'] };

/** Slope multiplier for a pitch of x/12: sqrt(1 + (x/12)^2). */
export const pitchToMultiplier = (pitch) => Math.sqrt(1 + (pitch / 12) ** 2);

/** The x/12 pitch that matches a slope multiplier (inverse of pitchToMultiplier). */
export const multiplierToPitch = (m) => 12 * Math.sqrt(Math.max(0, m * m - 1));

/**
 * Pitch handed over in the page URL by the Roof Pitch Calculator, e.g.
 * "?pitch=6" -> "6". Returns null when there is no usable number, so the form
 * keeps its default. Out-of-range numbers are passed through on purpose: the
 * normal validation then explains the problem on the pitch field.
 */
export function pitchFromQuery(search) {
  const value = new URLSearchParams(search ?? '').get('pitch');
  if (value === null || value.trim() === '' || value.length > 12) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? String(round(n, 2)) : null;
}

/** Bundles needed to cover a length or area, rounded up. 0 when nothing to cover. */
const bundles = (amount, coverage) => (amount > 0 ? ceilTo(amount / coverage) : 0);

export function calculate(raw) {
  const mode = raw?.pitchMode === 'multiplier' ? 'multiplier' : 'pitch';
  const names = Object.keys(RULES).filter((n) => !PITCH_FIELDS[mode === 'pitch' ? 'multiplier' : 'pitch'].includes(n));

  const values = {};
  const errors = {};
  for (const name of names) {
    const r = validateNumber(raw?.[name], RULES[name]);
    if (r.ok) values[name] = r.value;
    else errors[name] = r.message;
  }

  // Slope floor for asphalt shingles (checked on whichever pitch field is in use).
  if (!errors[mode]) {
    const pitchNow = mode === 'pitch' ? values.pitch : multiplierToPitch(values.multiplier);
    if (round(pitchNow, 2) < MIN_PITCH) {
      errors[mode] =
        mode === 'pitch'
          ? 'Below 2/12: the 2024 IRC (R905.2.2) does not allow asphalt shingles on this slope.'
          : 'Below 2/12 (a multiplier under about 1.014): the 2024 IRC (R905.2.2) does not allow asphalt shingles on this slope.';
    }
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const v = values;
  const multiplier = mode === 'pitch' ? pitchToMultiplier(v.pitch) : v.multiplier;
  const pitch = mode === 'pitch' ? v.pitch : multiplierToPitch(v.multiplier);
  const doubleUnderlayment = round(pitch, 2) < DOUBLE_UNDERLAYMENT_BELOW;

  const footprint = v.length * v.width; // sq ft, flat
  const roofArea = footprint * multiplier; // sq ft of sloped roof surface
  const squares = roofArea / SQ_FT_PER_SQUARE;
  const squaresWithWaste = squares * (1 + v.waste / 100);

  const fieldBundlesBeforeWaste = ceilTo(squares * v.bundlesPerSquare);
  const fieldBundles = ceilTo(squaresWithWaste * v.bundlesPerSquare);

  const starterLength = v.eave + v.rake;
  const starterBundles = bundles(starterLength, v.starterCoverage);
  const ridgeCapBundles = bundles(v.ridgeHip, v.ridgeCoverage);
  const underlaymentLayers = doubleUnderlayment ? 2 : 1;
  const underlaymentRolls = bundles(roofArea * underlaymentLayers, v.underlaymentCoverage);
  const nails = ceilTo(squaresWithWaste * v.nailsPerSquare);

  const slopeNote = doubleUnderlayment
    ? `${round(pitch, 2)}/12 is in the 2/12 up to 4/12 band: the 2024 IRC allows asphalt shingles here only with two layers of underlayment (Table R905.1.1(2)), so the underlayment count covers two layers.`
    : '';

  return {
    ok: true,
    results: {
      fieldBundles,
      fieldBundlesBeforeWaste,
      roofArea: round(roofArea, 1),
      multiplier: round(multiplier, 3),
      squares: round(squares, 2),
      squaresWithWaste: round(squaresWithWaste, 2),
      starterLength: round(starterLength, 1),
      starterBundles,
      ridgeCapBundles,
      underlaymentRolls,
      nails,
    },
    chart: [
      { label: 'No waste', value: fieldBundlesBeforeWaste },
      { label: 'With waste', value: fieldBundles },
      { label: 'Starter', value: starterBundles },
      { label: 'Ridge cap', value: ridgeCapBundles },
    ],
    slopeNote,
  };
}

/**
 * Shopping list grouped into field / accessories / fasteners, built from a
 * successful calculate() result. Pure; ui.js only renders it.
 */
export function shoppingList(results) {
  const r = results ?? {};
  return [
    {
      group: 'Field shingles',
      items: [{ label: 'Shingle bundles (with waste)', qty: r.fieldBundles, unit: 'bundles' }],
    },
    {
      group: 'Accessories',
      items: [
        { label: 'Starter strip', qty: r.starterBundles, unit: 'bundles' },
        { label: 'Hip and ridge cap', qty: r.ridgeCapBundles, unit: 'bundles' },
        { label: 'Underlayment', qty: r.underlaymentRolls, unit: 'rolls' },
      ],
    },
    {
      group: 'Fasteners',
      items: [{ label: 'Roofing nails for field shingles', qty: r.nails, unit: 'nails' }],
    },
  ];
}
