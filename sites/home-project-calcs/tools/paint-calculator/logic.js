// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Interior room paint: paintable wall and ceiling area, wall-paint gallons per
// coat and in total, a 5-gallon / 1-gallon / quart mix for the wall paint, and
// separate ceiling-paint and primer amounts to buy.
import { ceilTo, round, validateAll } from '@tools/calculator-core';

// Sherwin-Williams SuperPaint Interior Latex Flat PDS (A86, 08/2026):
// 350–400 sq ft per gallon at 4 mils wet. Low end is the default buy rate.
export const COVERAGE_LOW = 350;
export const COVERAGE_HIGH = 400;

// US liquid measure: 4 quarts = 1 gallon, so a 5-gallon bucket is 20 quarts.
export const QUART_GAL = 0.25;
export const QUARTS_PER_GALLON = 4;
export const QUARTS_PER_FIVE = 20;
// Three quarts or more of leftover paint are bought as one more gallon.
export const MAX_QUARTS = 3;

export const PRODUCTS = {
  'sw-350': COVERAGE_LOW,
  'sw-400': COVERAGE_HIGH,
};

const YES_NO = ['yes', 'no'];
const WHOLE = [
  ['doors', 'Doors'],
  ['windows', 'Windows'],
  ['coats', 'Coats'],
];

const NUMBER_RULES = {
  length: { label: 'Room length', min: 4, max: 50 },
  width: { label: 'Room width', min: 4, max: 50 },
  height: { label: 'Wall height', min: 7, max: 12 },
  doors: { label: 'Doors', min: 0, max: 10 },
  doorSize: { label: 'Door size', min: 10, max: 40 },
  windows: { label: 'Windows', min: 0, max: 20 },
  windowSize: { label: 'Window size', min: 4, max: 40 },
  coats: { label: 'Coats', min: 1, max: 3 },
};

/**
 * Split a gallon amount into 5-gallon buckets, 1-gallon cans, and quarts.
 * Rounds up to the next quart, then uses the largest containers that cover
 * that quart total (4 quarts = 1 gallon, 20 quarts = one 5-gallon bucket).
 * A leftover of 3 quarts is bought as one more gallon instead: 3 quarts hold
 * less paint than a gallon and quarts cost more per gallon (larger containers
 * are cheaper per gallon). If that makes five 1-gallon cans, they become one
 * 5-gallon bucket for the same reason.
 */
export function containerMix(gallons) {
  if (!(gallons > 0)) return { fiveGallon: 0, oneGallon: 0, quarts: 0 };
  const purchased = ceilTo(gallons, QUART_GAL);
  const quartCount = Math.round(purchased / QUART_GAL);
  let fiveGallon = Math.floor(quartCount / QUARTS_PER_FIVE);
  const afterFives = quartCount - fiveGallon * QUARTS_PER_FIVE;
  let oneGallon = Math.floor(afterFives / QUARTS_PER_GALLON);
  let quarts = afterFives - oneGallon * QUARTS_PER_GALLON;
  if (quarts >= MAX_QUARTS) {
    oneGallon += 1;
    quarts = 0;
  }
  if (oneGallon * QUARTS_PER_GALLON >= QUARTS_PER_FIVE) {
    fiveGallon += 1;
    oneGallon = 0;
  }
  return { fiveGallon, oneGallon, quarts };
}

/** Gallons in a container mix (what you carry home). */
export function mixGallons(mix) {
  return mix.fiveGallon * 5 + mix.oneGallon + mix.quarts * QUART_GAL;
}

const fmtGal = (n) => String(round(n, 2));

// Donut: gallons to carry home, split by product (wall paint, ceiling paint,
// primer). Zero slices are left off.
function chartFromBuys(walls, ceiling, primer) {
  const chart = [];
  if (walls > 0) chart.push({ label: `Walls ${fmtGal(walls)} gal`, value: walls });
  if (ceiling > 0) chart.push({ label: `Ceiling ${fmtGal(ceiling)} gal`, value: ceiling });
  if (primer > 0) chart.push({ label: `Primer ${fmtGal(primer)} gal`, value: primer });
  return chart;
}

export function calculate(raw = {}) {
  const errors = {};
  const ceiling = String(raw.includeCeiling ?? '').trim();
  const primer = String(raw.includePrimer ?? '').trim();
  const product = String(raw.product ?? '').trim();

  if (!YES_NO.includes(ceiling)) errors.includeCeiling = 'Choose yes or no for the ceiling.';
  if (!YES_NO.includes(primer)) errors.includePrimer = 'Choose yes or no for primer.';
  if (product !== 'custom' && !Object.prototype.hasOwnProperty.call(PRODUCTS, product)) {
    errors.product = 'Choose a Sherwin-Williams SuperPaint rate or Custom.';
  }

  const rules = { ...NUMBER_RULES };
  if (product === 'custom') rules.coverage = { label: 'Coverage rate', min: 200, max: 450 };

  const checked = validateAll(raw, rules);
  if (!checked.ok) Object.assign(errors, checked.errors);
  else {
    for (const [name, label] of WHOLE) {
      if (!Number.isInteger(checked.values[name])) errors[name] = `${label} must be a whole number.`;
    }
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  const { length, width, height, doors, doorSize, windows, windowSize, coats } = checked.values;
  const coverage = product === 'custom' ? checked.values.coverage : PRODUCTS[product];

  const grossWalls = 2 * (length + width) * height;
  const openings = doors * doorSize + windows * windowSize;
  if (openings > grossWalls + 1e-9) {
    const message = 'Door and window area is larger than the wall area. Lower the counts or the sizes.';
    const openingErrors = {};
    if (doors > 0) openingErrors.doors = message;
    if (windows > 0) openingErrors.windows = message;
    if (!doors && !windows) openingErrors.doorSize = message;
    return { ok: false, errors: openingErrors };
  }

  const wallArea = grossWalls - openings;
  const ceilingArea = ceiling === 'yes' ? length * width : 0;
  const paintable = wallArea + ceilingArea;
  if (!(paintable > 0)) {
    return {
      ok: false,
      errors: {
        includeCeiling: 'There is no area left to paint. Include the ceiling or reduce the openings.',
      },
    };
  }

  // Walls and ceiling are separate buys (ceilings usually get their own
  // ceiling paint), the way Sherwin-Williams' own calculator splits them.
  // No extra waste percent: the 350 sq ft/gal preset is already the low end of
  // the data sheet's 350–400 range, which buys more paint than the high end.
  const gallonsPerCoatExact = wallArea / coverage;
  const totalExact = gallonsPerCoatExact * coats;
  const mix = containerMix(totalExact);
  const ceilingExact = (ceilingArea / coverage) * coats;
  // Primer: one coat over everything being painted (walls plus ceiling when on).
  const primerExact = primer === 'yes' ? paintable / coverage : 0;
  const ceilingBuy = mixGallons(containerMix(ceilingExact));
  const primerBuy = mixGallons(containerMix(primerExact));

  return {
    ok: true,
    results: {
      wallArea: round(wallArea, 1),
      ceilingArea: round(ceilingArea, 1),
      gallonsPerCoat: round(gallonsPerCoatExact, 2),
      totalGallons: round(totalExact, 2),
      fiveGallon: mix.fiveGallon,
      oneGallon: mix.oneGallon,
      quarts: mix.quarts,
      ceilingBuy,
      primerBuy,
    },
    chart: chartFromBuys(mixGallons(mix), ceilingBuy, primerBuy),
  };
}
