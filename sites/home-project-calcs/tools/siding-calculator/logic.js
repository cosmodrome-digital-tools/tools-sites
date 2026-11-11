// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Siding: wall area of a rectangular house (four walls plus triangular gable
// ends) or an entered wall area, less any openings you choose to deduct, plus
// a waste allowance (Vinyl Siding Institute: add 10%), turned into squares
// (1 square = 100 sq ft) and, if you enter carton coverage, cartons.
import { ceilTo, round, validateNumber } from '@tools/calculator-core';

export const SQ_FT_PER_SQUARE = 100;

const read = (raw, name, label, min, max, errors, required = true) => {
  if (!required && (raw[name] === undefined || String(raw[name]).trim() === '')) return 0;
  const r = validateNumber(raw[name], { label, min, max });
  if (r.ok) return r.value;
  errors[name] = r.message;
  return undefined;
};

export function calculate(raw = {}) {
  const errors = {};
  const mode = String(raw.mode ?? 'house');
  if (!['house', 'area'].includes(mode)) errors.mode = 'Choose house dimensions or wall area.';
  const house = mode === 'house';
  const L = house ? read(raw, 'houseLength', 'House length', 4, 300, errors) : 0;
  const Wd = house ? read(raw, 'houseWidth', 'House width', 4, 200, errors) : 0;
  const H = house ? read(raw, 'wallHeight', 'Wall height', 4, 40, errors) : 0;
  const gables = house ? read(raw, 'gables', 'Gable ends', 0, 4, errors) : 0;
  const gableRise = house && gables > 0 ? read(raw, 'gableRise', 'Gable height', 0.5, 40, errors) : 0;
  const typedArea = !house ? read(raw, 'wallArea', 'Wall area', 10, 50000, errors) : 0;
  const openings = read(raw, 'openings', 'Doors and windows', 0, 20000, errors);
  const waste = read(raw, 'waste', 'Waste allowance', 0, 30, errors);
  const carton = read(raw, 'cartonCoverage', 'Coverage per carton', 0, 1000, errors, false);
  if (gables !== undefined && !Number.isInteger(gables)) errors.gables = 'Gable ends must be a whole number.';
  if (Object.keys(errors).length) return { ok: false, errors };

  const wallsArea = house ? 2 * (L + Wd) * H : typedArea;
  // Each gable end is a triangle across the house width: width x height / 2.
  const gableArea = house ? gables * ((Wd * gableRise) / 2) : 0;
  const gross = wallsArea + gableArea;
  if (openings >= gross) {
    return { ok: false, errors: { openings: `Openings can't be ${openings} sq ft or more: the walls are only ${round(gross, 1)} sq ft.` } };
  }
  const net = gross - openings;
  const withWaste = net * (1 + waste / 100);
  const squares = ceilTo(withWaste / SQ_FT_PER_SQUARE, 1);

  return {
    ok: true,
    results: {
      squares,
      cartons: carton > 0 ? ceilTo(withWaste / carton, 1) : null,
      wallsArea: round(wallsArea, 1),
      gableArea: house ? round(gableArea, 1) : null,
      openings: round(openings, 1),
      netArea: round(net, 1),
      areaWithWaste: round(withWaste, 1),
      exactSquares: round(withWaste / SQ_FT_PER_SQUARE, 2),
    },
    chart: [
      { label: 'Walls', value: round(wallsArea, 1) },
      ...(gableArea > 0 ? [{ label: 'Gables', value: round(gableArea, 1) }] : []),
      ...(openings > 0 ? [{ label: 'Openings', value: round(openings, 1) }] : []),
      { label: 'Waste', value: round(withWaste - net, 1) },
    ],
    // Gable-end elevation of the house, or a wall panel for an entered area (labels only).
    diagram: house
      ? {
          type: 'wall', name: 'Gable end', length: Wd, height: H, gableRise: gables > 0 ? gableRise : 0, unit: 'ft', pattern: 'siding',
          moduleLabel: `House ${L} × ${Wd} ft · ${gables} gable end${gables === 1 ? '' : 's'}`,
          caption: `Walls ${round(wallsArea, 0).toLocaleString('en-US')} + gables ${round(gableArea, 0).toLocaleString('en-US')} sq ft`,
        }
      : (() => {
          const side = Math.sqrt(typedArea);
          return { type: 'wall', name: 'Wall area', length: side, height: side / 2.5, lengthLabel: `${round(typedArea, 0).toLocaleString('en-US')} sq ft`, heightLabel: 'entered', unit: 'ft', pattern: 'siding' };
        })(),
  };
}
