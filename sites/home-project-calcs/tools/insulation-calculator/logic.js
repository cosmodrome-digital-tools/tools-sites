// Attic insulation quantities. Pure calculate(raw): no DOM, network, or storage.
// ENERGY STAR "add insulation to attic" levels (2021 IECC Table R402.1.3 basis)
// and every published AttiCat open-attic row (May 2026 data sheet). Batt package
// coverage is an input because EcoTouch packages do not share one square-foot yield.
import { ceilTo, round, validateAll, withWaste } from '@tools/calculator-core';

export const AREA_MIN = 100;
export const AREA_MAX = 5000;
export const TARGET_MIN = 13;
export const TARGET_MAX = 60;
export const WASTE_MIN = 0;
export const WASTE_MAX = 15;
export const COVERAGE_MIN = 10;
export const COVERAGE_MAX = 400;

/**
 * ENERGY STAR "Add Insulation to Attic" columns: the R-value to ADD.
 * none = attic is uninsulated, some = about 3-4 inches already there.
 */
export const ENERGY_STAR_ATTIC = {
  '1': { none: 30, some: 25 },
  '2': { none: 49, some: 38 },
  '3': { none: 49, some: 38 },
  '4ab': { none: 60, some: 49 },
  '4c56': { none: 60, some: 49 },
  '78': { none: 60, some: 49 },
};

/**
 * Owens Corning AttiCat open-attic rows (27.5 lb bag), every row on the
 * May 2026 data sheet. bagsPer1000 is the "bags per 1,000 sq ft" column.
 * minInches is the minimum thickness, which the sheet also lists as the
 * minimum settled thickness (the columns are identical). The Minnesota-only
 * extra inches and bags are not added.
 */
export const ATTICAT_ROWS = [
  { r: 13, bagsPer1000: 5.9, minInches: 5 },
  { r: 19, bagsPer1000: 9, minInches: 7 },
  { r: 22, bagsPer1000: 10.5, minInches: 8 },
  { r: 26, bagsPer1000: 12.6, minInches: 9.5 },
  { r: 30, bagsPer1000: 14.6, minInches: 10.75 },
  { r: 38, bagsPer1000: 19, minInches: 13.5 },
  { r: 44, bagsPer1000: 22.4, minInches: 15.5 },
  { r: 49, bagsPer1000: 25, minInches: 17 },
  { r: 60, bagsPer1000: 31.5, minInches: 20.5 },
];

/** The line chart compares the four 2021 IECC attic levels. */
export const CHART_R = [30, 38, 49, 60];

/** Standard EcoTouch thicknesses. Cathedral (compressed) rows are not included. */
export const BATT_THICKNESS = {
  '13': 3.5,
  '19': 6.25,
  '30': 9.5,
  '38': 12,
};

const ZONES = new Set(Object.keys(ENERGY_STAR_ATTIC));
const EXISTING = new Set(['none', 'some']);
const PRODUCTS = new Set(['blown', 'batts']);
const BATT_VALUES = new Set(Object.keys(BATT_THICKNESS));

export const RULES = {
  area: { label: 'Attic floor area', min: AREA_MIN, max: AREA_MAX },
  targetR: { label: 'Target R-value', min: TARGET_MIN, max: TARGET_MAX, required: false },
  extraWaste: { label: 'Extra waste', min: WASTE_MIN, max: WASTE_MAX },
  battCoverage: { label: 'Batt package coverage', min: COVERAGE_MIN, max: COVERAGE_MAX },
};

/** Smallest published AttiCat row whose R-value is at least the goal. */
export function atticatRowFor(goalR) {
  return ATTICAT_ROWS.find((row) => row.r >= goalR) ?? null;
}

function purchase(exact) {
  return {
    beforeRounding: round(exact, 2),
    packages: ceilTo(exact, 1),
  };
}

function blownPurchase(area, row, wastePercent) {
  return purchase(withWaste((row.bagsPer1000 / 1000) * area, wastePercent));
}

export function calculate(raw) {
  const checked = validateAll(raw ?? {}, RULES);
  const errors = checked.ok ? {} : { ...checked.errors };

  if (!ZONES.has(raw?.climateZone)) errors.climateZone = 'Choose a US climate zone.';
  if (!EXISTING.has(raw?.existing)) errors.existing = 'Choose the existing insulation.';
  if (!PRODUCTS.has(raw?.product)) errors.product = 'Choose blown fiberglass or batts.';
  if (!BATT_VALUES.has(raw?.battR)) errors.battR = 'Choose a batt R-value.';

  if (Object.keys(errors).length) return { ok: false, errors };

  const { area, targetR, extraWaste, battCoverage } = checked.values;
  const energyStarR = ENERGY_STAR_ATTIC[raw.climateZone][raw.existing];
  const goalR = targetR === undefined ? energyStarR : targetR;
  const battThicknessIn = BATT_THICKNESS[raw.battR];

  let packages;
  let beforeRounding;
  let blownThickness = null;
  let battThickness = null;
  let chartR = null;
  let installedR;

  if (raw.product === 'blown') {
    const row = atticatRowFor(goalR);
    const bought = blownPurchase(area, row, extraWaste);
    packages = bought.packages;
    beforeRounding = bought.beforeRounding;
    blownThickness = row.minInches;
    chartR = row.r;
    installedR = row.r;
  } else {
    const bought = purchase(withWaste(area / battCoverage, extraWaste));
    packages = bought.packages;
    beforeRounding = bought.beforeRounding;
    battThickness = battThicknessIn;
    installedR = Number(raw.battR);
  }

  const rShortfall = round(Math.max(0, goalR - installedR), 1);

  const chart = ATTICAT_ROWS.filter((row) => CHART_R.includes(row.r)).map((row) => ({
    label: `R${row.r}`,
    value: blownPurchase(area, row, extraWaste).packages,
  }));

  return {
    ok: true,
    results: {
      energyStarR,
      packages,
      beforeRounding,
      blownThickness,
      battThickness,
      chartR,
      rShortfall,
    },
    chart,
  };
}
