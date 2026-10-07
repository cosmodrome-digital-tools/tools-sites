// Gravel volume and tons for a driveway, path, or drain.
// Purchase lines round the full amount up to the next tenth of a yard or ton.
import { ceilTo, cuFtToCuYd, round, validateNumber, withWaste } from '@tools/calculator-core';

const CHOICES = {
  mode: {
    values: ['single', 'layered'],
    message: 'Choose single layer or layered driveway.',
  },
  shape: {
    values: ['rectangle', 'circle', 'sqft'],
    message: 'Choose rectangle, circle, or enter sq ft.',
  },
  densitySource: {
    values: ['estimate', 'supplier'],
    message: 'Choose a density source.',
  },
};

function readChoice(raw, name) {
  const value = String(raw?.[name] ?? '').trim();
  if (!CHOICES[name].values.includes(value)) return { error: CHOICES[name].message };
  return { value };
}

function readNumber(raw, name, rule, active, errors) {
  if (!active) return undefined;
  const result = validateNumber(raw?.[name], rule);
  if (!result.ok) errors[name] = result.message;
  return result.value;
}

// ceilTo can leave a binary tail (8.200000000000001). Round to one decimal after.
function roundUpToTenth(value) {
  return round(ceilTo(value, 0.1), 1);
}

export function calculate(raw) {
  const errors = {};
  const mode = readChoice(raw, 'mode');
  const shape = readChoice(raw, 'shape');
  const densitySource = readChoice(raw, 'densitySource');
  if (mode.error) errors.mode = mode.error;
  if (shape.error) errors.shape = shape.error;
  if (densitySource.error) errors.densitySource = densitySource.error;

  const layered = mode.value === 'layered';
  const shapeName = shape.value;

  const length = readNumber(raw, 'length', { label: 'Length', min: 1, max: 500 }, shapeName === 'rectangle', errors);
  const width = readNumber(raw, 'width', { label: 'Width', min: 1, max: 100 }, shapeName === 'rectangle' || shapeName === 'circle', errors);
  const typedArea = readNumber(raw, 'area', { label: 'Area', min: 1, max: 50000 }, shapeName === 'sqft', errors);
  const depth = readNumber(raw, 'depth', { label: 'Depth', min: 1, max: 24 }, true, errors);
  const surfaceDepth = readNumber(raw, 'surfaceDepth', { label: 'Surface depth', min: 1, max: 12 }, layered, errors);
  const density = readNumber(raw, 'density', { label: 'Density', min: 1, max: 2 }, true, errors);
  const surfaceDensity = readNumber(raw, 'surfaceDensity', { label: 'Surface density', min: 1, max: 2 }, layered, errors);
  const waste = readNumber(raw, 'waste', { label: 'Compaction / waste', min: 0, max: 30 }, true, errors);

  if (Object.keys(errors).length) return { ok: false, errors };

  // Circle: the width box is the diameter. Enter sq ft ignores length and width.
  let areaSqFt;
  if (shapeName === 'rectangle') areaSqFt = length * width;
  else if (shapeName === 'circle') areaSqFt = Math.PI * (width / 2) ** 2;
  else areaSqFt = typedArea;

  const baseCuFt = areaSqFt * (depth / 12);
  const surfaceCuFt = layered ? areaSqFt * (surfaceDepth / 12) : 0;
  const baseCuFtWith = withWaste(baseCuFt, waste);
  const surfaceCuFtWith = withWaste(surfaceCuFt, waste);

  const baseYardsExact = cuFtToCuYd(baseCuFtWith);
  const surfaceYardsExact = cuFtToCuYd(surfaceCuFtWith);
  const yardsExact = baseYardsExact + surfaceYardsExact;
  const baseTonsExact = baseYardsExact * density;
  const surfaceTonsExact = layered ? surfaceYardsExact * surfaceDensity : 0;
  const tonsExact = baseTonsExact + surfaceTonsExact;

  const results = {
    areaSqFt: round(areaSqFt, 1),
    cubicFeet: round(baseCuFtWith + surfaceCuFtWith, 1),
    cubicYards: round(yardsExact, 2),
    tons: round(tonsExact, 2),
    yardsToOrder: roundUpToTenth(yardsExact),
    tonsToOrder: roundUpToTenth(tonsExact),
    baseCubicFeet: round(baseCuFtWith, 1),
    baseYards: round(baseYardsExact, 2),
    baseTons: round(baseTonsExact, 2),
    surfaceCubicFeet: round(surfaceCuFtWith, 1),
    surfaceYards: round(surfaceYardsExact, 2),
    surfaceTons: round(surfaceTonsExact, 2),
    densityUsed: round(density, 2),
  };

  // Single layer: stone vs the compaction add-on. Layered: base vs surface (allowance already inside each).
  let chart;
  if (layered) {
    chart = [
      { label: 'Base', value: results.baseTons },
      { label: 'Surface', value: results.surfaceTons },
    ].filter((row) => row.value > 0);
  } else {
    const stoneExact = cuFtToCuYd(baseCuFt) * density;
    const stone = round(stoneExact, 2);
    const allowance = round(tonsExact - stoneExact, 2);
    chart = [
      { label: 'Stone', value: stone },
      { label: 'Allowance', value: allowance },
    ].filter((row) => row.value > 0);
  }

  return { ok: true, results, chart };
}
