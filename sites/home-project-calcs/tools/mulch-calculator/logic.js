// Mulch volume for a bed, circle, typed area, or tree ring.
// Purchase bags round up to a whole bag. The chart compares 2, 3, and 4 inch
// bare-soil depths and does not subtract mulch that is already in the bed.
import {
  CU_FT_PER_CU_YD,
  INCHES_PER_FOOT,
  ceilTo,
  cuFtToCuYd,
  round,
  validateNumber,
} from '@tools/calculator-core';

const SHAPES = ['rectangle', 'circle', 'treeRing', 'sqft'];

function readShape(raw) {
  const value = String(raw?.shape ?? '').trim();
  if (!SHAPES.includes(value)) {
    return { error: 'Choose rectangle, circle, tree ring, or enter sq ft.' };
  }
  return { value };
}

// Inactive fields stay on the form. Skip them so a leftover value cannot block the result.
function readNumber(raw, name, rule, active, errors) {
  if (!active) return undefined;
  const result = validateNumber(raw?.[name], rule);
  if (!result.ok) errors[name] = result.message;
  return result.value;
}

function bagsToBuy(cubicFeet, bagSize) {
  if (!(cubicFeet > 0)) return 0;
  return round(ceilTo(cubicFeet / bagSize, 1), 0);
}

export function calculate(raw) {
  const errors = {};
  const shape = readShape(raw);
  if (shape.error) errors.shape = shape.error;
  const shapeName = shape.value;

  const length = readNumber(
    raw,
    'length',
    { label: 'Length / diameter', min: 1, max: 200 },
    shapeName === 'rectangle' || shapeName === 'circle',
    errors,
  );
  const width = readNumber(
    raw,
    'width',
    { label: 'Width', min: 1, max: 100 },
    shapeName === 'rectangle',
    errors,
  );
  const outerDiameter = readNumber(
    raw,
    'outerDiameter',
    { label: 'Outer diameter', min: 2, max: 30 },
    shapeName === 'treeRing',
    errors,
  );
  const typedArea = readNumber(
    raw,
    'area',
    { label: 'Area', min: 1, max: 20000 },
    shapeName === 'sqft',
    errors,
  );
  const clearance = readNumber(
    raw,
    'clearanceRadius',
    { label: 'Trunk clearance', min: 0.25, max: 1 },
    shapeName === 'treeRing',
    errors,
  );
  const depth = readNumber(raw, 'depth', { label: 'Depth', min: 1, max: 6 }, true, errors);
  const existing = readNumber(
    raw,
    'existingDepth',
    { label: 'Existing depth', min: 0, max: 6 },
    true,
    errors,
  );
  const bagSize = readNumber(
    raw,
    'bagSize',
    { label: 'Bag size', min: 0.5, max: 3 },
    true,
    errors,
  );

  if (
    shapeName === 'treeRing' &&
    clearance !== undefined &&
    outerDiameter !== undefined &&
    !(clearance < outerDiameter / 2)
  ) {
    errors.clearanceRadius =
      'Trunk clearance must be less than half the outer diameter, or the ring has no mulch area.';
  }
  if (existing !== undefined && depth !== undefined && existing > depth) {
    errors.existingDepth =
      'Existing depth must be the depth you want or less. A higher number would mean removing mulch.';
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  let areaSqFt = 0;
  let openSqFt = 0;
  if (shapeName === 'rectangle') {
    areaSqFt = length * width;
  } else if (shapeName === 'circle') {
    areaSqFt = Math.PI * (length / 2) ** 2;
  } else if (shapeName === 'treeRing') {
    const outerRadius = outerDiameter / 2;
    openSqFt = Math.PI * clearance ** 2;
    areaSqFt = Math.PI * (outerRadius ** 2 - clearance ** 2);
  } else {
    areaSqFt = typedArea;
  }

  const netDepth = depth - existing;
  const cubicFeetExact = areaSqFt * (netDepth / INCHES_PER_FOOT);
  const bareBags = (inches) => bagsToBuy(areaSqFt * (inches / INCHES_PER_FOOT), bagSize);

  const results = {
    bags: bagsToBuy(cubicFeetExact, bagSize),
    cubicYards: round(cuFtToCuYd(cubicFeetExact), 2),
    cubicFeet: round(cubicFeetExact, 2),
    bagsPerYard: round(CU_FT_PER_CU_YD / bagSize, 2),
    areaSqFt: round(areaSqFt, 1),
    netDepth: round(netDepth, 2),
    openSqFt: round(openSqFt, 1),
  };

  const chart = [
    { label: '2 in', value: bareBags(2) },
    { label: '3 in', value: bareBags(3) },
    { label: '4 in', value: bareBags(4) },
  ];

  return { ok: true, results, chart };
}
