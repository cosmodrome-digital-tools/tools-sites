// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Brick: bricks and mortar for a wall or veneer from its face area, using the
// Brick Industry Association's estimating figures for modular brick with 3/8 in
// joints (Technical Note 10): 6.75 bricks per sq ft of wall face and 8.1 cu ft
// of mortar per 1,000 bricks, plus BIA's waste allowances (at least 5% for
// brick, 15 to 25% for mortar). Other brick sizes use the visitor's own figures.
import { ceilTo, cuFtToCuYd, round, validateNumber } from '@tools/calculator-core';

export const MODULAR = { perSqFt: 6.75, mortarPer1000: 8.1 };

const read = (raw, name, label, min, max, errors) => {
  const r = validateNumber(raw[name], { label, min, max });
  if (r.ok) return r.value;
  errors[name] = r.message;
  return undefined;
};

export function calculate(raw = {}) {
  const errors = {};
  const brickType = String(raw.brickType ?? 'modular');
  if (!['modular', 'custom'].includes(brickType)) errors.brickType = 'Choose modular or enter your own figures.';
  const wythes = Number(raw.wythes ?? 1);
  if (![1, 2].includes(wythes)) errors.wythes = 'Choose one or two wythes.';
  const length = read(raw, 'length', 'Wall length', 1, 500, errors);
  const height = read(raw, 'height', 'Wall height', 0.5, 40, errors);
  const openings = read(raw, 'openings', 'Openings', 0, 20000, errors);
  const brickWaste = read(raw, 'brickWaste', 'Brick waste', 0, 25, errors);
  const mortarWaste = read(raw, 'mortarWaste', 'Mortar waste', 0, 50, errors);
  const custom = brickType === 'custom';
  const perSqFt = custom ? read(raw, 'bricksPerSqFt', 'Bricks per sq ft', 1, 20, errors) : MODULAR.perSqFt;
  const mortarPer1000 = custom ? read(raw, 'mortarPer1000', 'Mortar per 1,000 bricks', 1, 40, errors) : MODULAR.mortarPer1000;
  if (Object.keys(errors).length) return { ok: false, errors };

  const gross = length * height;
  if (openings >= gross) {
    return { ok: false, errors: { openings: `Openings can't be ${openings} sq ft or more: the wall is only ${round(gross, 1)} sq ft.` } };
  }
  const net = gross - openings;
  const bricksNet = net * perSqFt * wythes;
  const bricks = ceilTo(bricksNet * (1 + brickWaste / 100), 1);
  // Mortar for the bed and head joints of the net bricks (collar joints between wythes not included).
  const mortarNet = (bricksNet / 1000) * mortarPer1000;
  const mortar = mortarNet * (1 + mortarWaste / 100);

  return {
    ok: true,
    results: {
      bricks,
      mortarCuFt: round(mortar, 2),
      mortarCuYd: round(cuFtToCuYd(mortar), 3),
      wallArea: round(net, 1),
      bricksNet: round(bricksNet, 1),
      mortarNet: round(mortarNet, 2),
      perSqFt,
    },
    chart: [
      { label: 'Net bricks', value: round(bricksNet, 0) },
      { label: 'Waste', value: round(bricks - bricksNet, 0) },
    ],
    // Wall elevation in running bond with the brick module called out (labels only).
    diagram: {
      type: 'wall',
      name: 'Brick wall',
      length,
      height,
      unit: 'ft',
      pattern: 'brick',
      moduleLabel: custom ? `${perSqFt} bricks per sq ft${wythes === 2 ? ' × 2 wythes' : ''}` : `Modular brick, 3/8 in joints: 6.75 per sq ft${wythes === 2 ? ' × 2 wythes' : ''}`,
      caption: openings > 0 ? `${round(gross, 0).toLocaleString('en-US')} sq ft − ${round(openings, 0).toLocaleString('en-US')} sq ft of openings` : undefined,
    },
  };
}
