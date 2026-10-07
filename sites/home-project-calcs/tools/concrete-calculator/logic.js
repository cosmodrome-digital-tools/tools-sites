// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Concrete volume (cu ft / cu yd) and premix bag count for a rectangular slab
// or footing, or a round column (Sonotube), using manufacturer bag yields.
import {
  CU_FT_PER_CU_YD,
  ceilTo,
  cuFtToCuYd,
  inchesToFeet,
  round,
  validateAll,
  withWaste,
} from '@tools/calculator-core';

// Bag yields in cubic feet per bag, copied from each product's data sheet
// (see meta.json "sources", accessed 2026-10-06). Not user-editable.
export const BRANDS = {
  quikrete1101: {
    label: 'Quikrete Concrete Mix (No. 1101)',
    yields: { 40: 0.3, 50: 0.375, 60: 0.45, 80: 0.6, 90: 0.675 },
  },
  sakreteHighStrength: {
    label: 'Sakrete High-Strength Concrete Mix',
    yields: { 40: 0.3, 60: 0.45, 80: 0.6, 90: 0.66 },
  },
  quikrete1004: {
    label: 'Quikrete Fast-Setting Concrete Mix (No. 1004)',
    yields: { 50: 0.375, 60: 0.45 },
  },
};

export const SHAPES = ['slab', 'column'];

const SLAB_RULES = {
  length: { label: 'Length', min: 0.1, max: 200 },
  width: { label: 'Width', min: 0.1, max: 200 },
  thickness: { label: 'Thickness', min: 1, max: 24 },
};
const COLUMN_RULES = {
  diameter: { label: 'Diameter', min: 4, max: 48 },
  height: { label: 'Height', min: 6, max: 120 },
};
const COMMON_RULES = {
  quantity: { label: 'Quantity', min: 1, max: 50 },
  waste: { label: 'Waste allowance', min: 0, max: 25 },
};

// Comparison sizes for the chart: slab thickness or column diameter, in inches.
const CHART_THICKNESSES = [4, 5, 6, 8];
const CHART_DIAMETERS = [8, 12, 16, 24];

/** Volume of one pour in cubic feet. */
function pourCuFt(shape, v) {
  if (shape === 'slab') return v.length * v.width * inchesToFeet(v.thickness);
  const radiusFt = inchesToFeet(v.diameter) / 2;
  return Math.PI * radiusFt ** 2 * inchesToFeet(v.height);
}

/** Bags to buy: total cubic feet (with waste) divided by bag yield, rounded up. */
function bagsFor(cuFtWithWaste, bagYield) {
  return ceilTo(cuFtWithWaste / bagYield, 1);
}

export function calculate(raw = {}) {
  const errors = {};
  const shape = String(raw.shape ?? 'slab');
  if (!SHAPES.includes(shape)) errors.shape = 'Choose a rectangular slab or a round column.';

  const rules = { ...(shape === 'column' ? COLUMN_RULES : SLAB_RULES), ...COMMON_RULES };
  const checked = validateAll(raw, rules);
  if (!checked.ok) Object.assign(errors, checked.errors);
  if (checked.ok && !Number.isInteger(checked.values.quantity)) {
    errors.quantity = 'Quantity must be a whole number.';
  }

  const brand = BRANDS[raw.brand];
  if (!brand) errors.brand = 'Choose a concrete mix.';
  const bagSize = Number(raw.bagSize);
  const bagYield = brand?.yields[bagSize];
  if (brand && !bagYield) {
    const sizes = Object.keys(brand.yields).map((s) => `${s} lb`).join(', ');
    errors.bagSize = `${brand.label} comes in ${sizes} bags. Pick one of those sizes.`;
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  const v = checked.values;
  const cubicFeet = pourCuFt(shape, v) * v.quantity;
  const cubicFeetWithWaste = withWaste(cubicFeet, v.waste);
  const bags = bagsFor(cubicFeetWithWaste, bagYield);

  // Chart: bags for the same footprint (slab) or height (column) at other sizes.
  const chart = (shape === 'slab' ? CHART_THICKNESSES : CHART_DIAMETERS).map((inches) => {
    const alt = shape === 'slab' ? { ...v, thickness: inches } : { ...v, diameter: inches };
    const altBags = bagsFor(withWaste(pourCuFt(shape, alt) * v.quantity, v.waste), bagYield);
    return { label: `${inches}" · ${altBags}`, value: altBags };
  });

  return {
    ok: true,
    results: {
      bags,
      bagSize,
      totalWeight: bags * bagSize,
      cubicYardsWithWaste: round(cuFtToCuYd(cubicFeetWithWaste), 2),
      cubicFeetWithWaste: round(cubicFeetWithWaste, 2),
      cubicYards: round(cuFtToCuYd(cubicFeet), 2),
      cubicFeet: round(cubicFeet, 2),
      bagYield,
      bagsPerCubicYard: round(CU_FT_PER_CU_YD / bagYield, 1),
    },
    chart,
  };
}
