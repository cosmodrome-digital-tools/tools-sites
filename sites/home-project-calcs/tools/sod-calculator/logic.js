// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Sod: lawn area from up to three rectangles, less beds or paths inside them,
// plus an ordering allowance (extension guidance: about 5% extra), turned into
// rolls and pallets using the coverage your supplier quotes. Roll and pallet
// sizes vary by grower, so both are editable.
import { ceilTo, round, sqFtToSqYd, validateNumber } from '@tools/calculator-core';

export const MAX_AREAS = 3;

const read = (raw, name, label, min, max, errors) => {
  const r = validateNumber(raw[name], { label, min, max });
  if (r.ok) return r.value;
  errors[name] = r.message;
  return undefined;
};

export function calculate(raw = {}) {
  const errors = {};
  const count = Number(raw.areaCount ?? 1);
  if (!Number.isInteger(count) || count < 1 || count > MAX_AREAS) errors.areaCount = 'Choose 1 to 3 areas.';
  const areas = [];
  if (!errors.areaCount) {
    for (let n = 1; n <= count; n++) {
      const length = read(raw, `area${n}Length`, `Area ${n} length`, 1, 1000, errors);
      const width = read(raw, `area${n}Width`, `Area ${n} width`, 1, 1000, errors);
      if (length !== undefined && width !== undefined) areas.push({ n, length, width, area: length * width });
    }
  }
  const subtract = read(raw, 'subtract', 'Beds and paths', 0, 1000000, errors);
  const roll = read(raw, 'rollCoverage', 'Coverage per roll', 1, 100, errors);
  const pallet = read(raw, 'palletCoverage', 'Coverage per pallet', 50, 2000, errors);
  const waste = read(raw, 'waste', 'Extra to order', 0, 25, errors);
  if (Object.keys(errors).length) return { ok: false, errors };

  const gross = areas.reduce((s, a) => s + a.area, 0);
  if (subtract >= gross) {
    return { ok: false, errors: { subtract: `Beds and paths can't be ${subtract} sq ft or more: the areas add up to ${round(gross, 1)} sq ft.` } };
  }
  const lawn = gross - subtract;
  const order = lawn * (1 + waste / 100);
  const rolls = ceilTo(order / roll, 1);
  const pallets = ceilTo(order / pallet, 1);
  const areaOf = (n) => {
    const a = areas.find((x) => x.n === n);
    return a ? round(a.area, 1) : null;
  };

  return {
    ok: true,
    results: {
      rolls,
      pallets,
      lawnArea: round(lawn, 1),
      lawnSqYd: round(sqFtToSqYd(lawn), 2),
      orderArea: round(order, 1),
      orderSqYd: round(sqFtToSqYd(order), 2),
      exactPallets: round(order / pallet, 2),
      subtract: round(subtract, 1),
      area1: areaOf(1),
      area2: areaOf(2),
      area3: areaOf(3),
    },
    chart: [
      { label: 'Lawn', value: round(lawn, 1) },
      { label: 'Extra', value: round(order - lawn, 1) },
      { label: 'Spare on last pallet', value: round(pallets * pallet - order, 1) },
    ],
    // Plan view of each lawn area with its dimensions (labels only).
    diagram: {
      type: 'plan',
      name: 'Lawn plan',
      unit: 'ft',
      pattern: 'turf',
      areas: areas.map((a) => ({ label: `Area ${a.n}`, length: a.length, width: a.width })),
      depthNote: subtract > 0 ? `${round(gross, 0).toLocaleString('en-US')} sq ft − ${round(subtract, 0).toLocaleString('en-US')} sq ft of beds = ${round(lawn, 0).toLocaleString('en-US')} sq ft of lawn` : `${round(lawn, 0).toLocaleString('en-US')} sq ft of lawn`,
    },
  };
}
