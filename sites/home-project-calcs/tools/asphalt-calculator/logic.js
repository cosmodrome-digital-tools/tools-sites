// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Asphalt: hot-mix asphalt for a driveway or path, in tons and cubic yards,
// from area and compacted thickness. Tons use a spread rate in pounds per
// square yard per inch of compacted thickness; 110 lb is the planning rate
// state DOT specifications use (TxDOT, VDOT, INDOT), about 146.7 lb per cu ft.
// The rate is editable because each mix weighs a little differently.
import { ceilTo, cuFtToCuYd, round, sqFtToSqYd, validateNumber } from '@tools/calculator-core';

export const DEFAULT_RATE = 110; // lb per sq yd per inch
export const LB_PER_TON = 2000;

const read = (raw, name, label, min, max, errors) => {
  const r = validateNumber(raw[name], { label, min, max });
  if (r.ok) return r.value;
  errors[name] = r.message;
  return undefined;
};

/** Tons to order: rounded up to the next half ton. */
export const orderTons = (tons) => ceilTo(tons, 0.5);

export function calculate(raw = {}) {
  const errors = {};
  const layers = String(raw.layers ?? 'one');
  if (!['one', 'two'].includes(layers)) errors.layers = 'Choose one or two layers.';
  const length = read(raw, 'length', 'Length', 1, 2000, errors);
  const width = read(raw, 'width', 'Width', 1, 500, errors);
  const thickness = read(raw, 'thickness', layers === 'two' ? 'Base layer thickness' : 'Thickness', 0.5, 12, errors);
  const surface = layers === 'two' ? read(raw, 'surfaceThickness', 'Surface layer thickness', 0.5, 6, errors) : 0;
  const rate = read(raw, 'rate', 'Spread rate', 90, 130, errors);
  const waste = read(raw, 'waste', 'Extra allowance', 0, 20, errors);
  if (Object.keys(errors).length) return { ok: false, errors };

  const area = length * width;
  const sqYd = sqFtToSqYd(area);
  const factor = 1 + waste / 100;
  const tonsFor = (inches) => (sqYd * inches * rate * factor) / LB_PER_TON;
  const baseTons = tonsFor(thickness);
  const surfaceTons = tonsFor(surface);
  const tons = baseTons + surfaceTons;
  const totalIn = thickness + surface;
  const cuFt = area * (totalIn / 12) * factor;

  return {
    ok: true,
    results: {
      tonsToOrder: orderTons(tons),
      tons: round(tons, 2),
      cubicYards: round(cuFtToCuYd(cuFt), 2),
      cubicFeet: round(cuFt, 1),
      area: round(area, 1),
      sqYd: round(sqYd, 2),
      baseTons: layers === 'two' ? round(baseTons, 2) : null,
      surfaceTons: layers === 'two' ? round(surfaceTons, 2) : null,
      densityLbCuFt: round((rate * 12) / 9, 1),
    },
    chart: [1, 2, 3, 4].map((inches) => {
      const point = { label: `${inches} in`, value: round(tonsFor(inches), 2) };
      if (layers === 'one' && inches === thickness) Object.assign(point, { highlight: true, highlightLabel: 'Yours' });
      return point;
    }),
    // Plan with the compacted thickness section (labels only).
    diagram: {
      type: 'box',
      name: 'Asphalt area',
      length,
      width,
      depth: totalIn,
      unit: 'ft',
      depthUnit: 'in',
      pattern: 'hatch',
      layers: layers === 'two' ? [{ label: 'Surface', depth: surface }, { label: 'Base', depth: thickness }] : null,
      caption: `${round(totalIn, 2)} in compacted`,
    },
  };
}
