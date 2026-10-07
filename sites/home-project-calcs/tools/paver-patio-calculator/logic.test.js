// logic.test.js: Vitest tests for logic.js.
// Required: at least 3 known-answer cases (each with its reference noted: a
// trusted calculator or hand math) PLUS edge cases: zero, negative, very
// large, empty, non-numeric, and the boundary values of every input.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate, paversPerSqFt, baseDepthIn } = logic;

// Page defaults (meta.json), so each test only states what it changes.
const DEFAULTS = {
  shape: 'rectangle',
  length: '12',
  width: '12',
  diameter: '10',
  area: '',
  perimeter: '',
  paverLength: '8',
  paverWidth: '4',
  use: 'patio',
  soil: 'drained',
  extraBase: '2',
  jointWidth: '0.125',
  sandDepth: '1',
  density: '1.40',
  waste: '5',
};
const run = (over = {}) => calculate({ ...DEFAULTS, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok).toBe(true);
  return r.results;
};
const errorOn = (field, over) => {
  const r = run(over);
  expect(r.ok).toBe(false);
  expect(r.errors).toHaveProperty(field);
};

describe('known answers', () => {
  it('worked example in page.md: 12 x 12 ft patio, 4 x 8 in pavers, 1/8 in joints, well-drained, 5% waste', () => {
    // Hand math:
    //   area = 12 x 12 = 144 sq ft
    //   pavers/sq ft = 144 / ((8 + 0.125) x (4 + 0.125)) = 144 / 33.515625 = 4.2965
    //   pavers = 144 x 4.2965 = 618.70; x 1.05 = 649.64 -> 650
    //   base = 4 in (ICPI patio, well-drained): 144 x 4/12 = 48 cu ft = 1.78 cu yd; x 1.40 = 2.49 tons
    //   sand = 144 x 1/12 = 12 cu ft = 0.44 cu yd
    //   edge = 2 x (12 + 12) = 48 ft
    expect(ok()).toEqual({
      pavers: 650,
      paversNoWaste: 618.7,
      paversPerSqFt: 4.3,
      area: 144,
      baseDepth: 4,
      baseTons: 2.49,
      baseCuYd: 1.78,
      sandCuFt: 12,
      sandCuYd: 0.44,
      edgeRestraint: 48,
    });
  });

  it('20 x 10 ft driveway on poor soil (+3 in), 10% waste', () => {
    // Hand math:
    //   area = 200 sq ft; pavers = 200 x 4.2965 = 859.30; x 1.10 = 945.23 -> 946
    //   base = 6 + 3 = 9 in: 200 x 9/12 = 150 cu ft = 5.556 cu yd; x 1.40 = 7.78 tons
    //   sand = 200/12 = 16.67 cu ft = 0.62 cu yd; edge = 2 x 30 = 60 ft
    const r = ok({ length: '20', width: '10', use: 'driveway', soil: 'poor', extraBase: '3', waste: '10' });
    expect(r).toMatchObject({ pavers: 946, baseDepth: 9, baseCuYd: 5.56, baseTons: 7.78, sandCuFt: 16.7, sandCuYd: 0.62, edgeRestraint: 60 });
  });

  it('10 ft circle, 6 x 6 in pavers, no joint', () => {
    // Hand math:
    //   area = pi x 5^2 = 78.54 sq ft; pavers/sq ft = 144 / 36 = 4
    //   pavers = 314.16 x 1.05 = 329.87 -> 330
    //   base = 78.54 x 4/12 = 26.18 cu ft = 0.97 cu yd; x 1.40 = 1.36 tons
    //   edge = pi x 10 = 31.4 ft
    const r = ok({ shape: 'circle', diameter: '10', paverLength: '6', paverWidth: '6', jointWidth: '0' });
    expect(r).toMatchObject({ area: 78.5, paversPerSqFt: 4, pavers: 330, baseCuYd: 0.97, baseTons: 1.36, sandCuFt: 6.5, edgeRestraint: 31.4 });
  });

  it('4 x 8 in pavers with no joint = 4.5 per sq ft (hand math: 144 / 32)', () => {
    expect(paversPerSqFt(8, 4, 0)).toBe(4.5);
    expect(ok({ jointWidth: '0', waste: '0' })).toMatchObject({ pavers: 648, paversPerSqFt: 4.5 });
  });

  it('page.md pavers-per-sq-ft table values (hand math: 144 / ((L + j) x (W + j)))', () => {
    const table = [
      [8, 4, 4.5, 4.3],
      [6, 6, 4, 3.84],
      [9, 6, 2.67, 2.58],
      [12, 6, 2, 1.94],
      [12, 12, 1, 0.98],
      [16, 16, 0.56, 0.55],
      [24, 12, 0.5, 0.49],
      [24, 24, 0.25, 0.25],
    ];
    for (const [l, w, none, eighth] of table) {
      expect(Number(paversPerSqFt(l, w, 0).toFixed(2)), `${l}x${w} no joint`).toBe(none);
      expect(Number(paversPerSqFt(l, w, 0.125).toFixed(2)), `${l}x${w} 1/8 joint`).toBe(eighth);
    }
  });

  it('page.md driveway variant: same 12 x 12 ft on poor soil +2 in = 8 in base, 3.56 cu yd, 4.98 tons', () => {
    // Hand math: 144 x 8/12 = 96 cu ft; / 27 = 3.556 cu yd; x 1.40 = 4.978 tons
    expect(ok({ use: 'driveway', soil: 'poor', extraBase: '2' })).toMatchObject({ baseDepth: 8, baseCuYd: 3.56, baseTons: 4.98 });
  });

  it('page.md base depth recipe table: tons for 100 sq ft at 4, 6, 8, 10 in', () => {
    // Hand math: 100 x d/12 / 27 x 1.40 -> 1.728, 2.593, 3.457, 4.321
    const tons = (over) => ok({ shape: 'area', area: '100', ...over }).baseTons;
    expect(tons({})).toBe(1.73);
    expect(tons({ use: 'driveway' })).toBe(2.59);
    expect(tons({ soil: 'poor', extraBase: '4' })).toBe(3.46);
    expect(tons({ use: 'driveway', soil: 'poor', extraBase: '4' })).toBe(4.32);
  });

  it('known area of 200 sq ft with no edge length leaves edge restraint blank', () => {
    const r = ok({ shape: 'area', area: '200' });
    expect(r.pavers).toBe(903); // 859.30 x 1.05 = 902.27 -> 903
    expect(r.baseTons).toBe(3.46); // 200 x 4/12 / 27 x 1.40 = 3.457
    expect(Number.isNaN(r.edgeRestraint)).toBe(true);
    expect(ok({ shape: 'area', area: '200', perimeter: '60' }).edgeRestraint).toBe(60);
  });
});

describe('ICPI base depth presets', () => {
  it('4 in patio, 6 in driveway, plus extra only on poor soil', () => {
    expect(baseDepthIn('patio', 'drained', 3)).toBe(4);
    expect(baseDepthIn('driveway', 'drained', 3)).toBe(6);
    expect(baseDepthIn('patio', 'poor', 2)).toBe(6);
    expect(baseDepthIn('driveway', 'poor', 4)).toBe(10);
  });
  it('ignores an invalid extra-base value when soil is well-drained (field is hidden)', () => {
    expect(ok({ extraBase: '99' }).baseDepth).toBe(4);
    errorOn('extraBase', { soil: 'poor', extraBase: '99' });
  });
});

describe('chart', () => {
  it('shows base tons at each distinct ICPI depth option', () => {
    expect(run().chart.map((c) => c.value)).toEqual([2.5, 3.7, 5]); // 4, 6, 8 in (6 in appears once)
    const poor = run({ soil: 'poor', extraBase: '3' }).chart;
    expect(poor.map((c) => c.label)).toEqual(['4" · 2.5 t', '6" · 3.7 t', '7" · 4.4 t', '9" · 5.6 t']);
  });
});

describe('edge cases', () => {
  it('rejects zero and negative sizes', () => {
    errorOn('length', { length: '0' });
    errorOn('width', { width: '-1' });
    errorOn('diameter', { shape: 'circle', diameter: '0' });
    errorOn('area', { shape: 'area', area: '-5' });
    errorOn('paverLength', { paverLength: '0' });
    errorOn('waste', { waste: '-1' });
  });
  it('rejects very large values', () => {
    errorOn('length', { length: '1e7' });
    errorOn('area', { shape: 'area', area: '1000000' });
    errorOn('perimeter', { shape: 'area', area: '200', perimeter: '99999' });
  });
  it('rejects empty and non-numeric input', () => {
    errorOn('length', { length: '' });
    errorOn('width', { width: 'twelve' });
    errorOn('density', { density: 'abc' });
    errorOn('area', { shape: 'area', area: '' });
    expect(calculate({}).ok).toBe(false);
  });
  it('rejects unknown select values', () => {
    errorOn('shape', { shape: 'triangle' });
    errorOn('use', { use: 'street' });
    errorOn('soil', { soil: 'swamp' });
  });
  it('only validates the size fields for the chosen shape', () => {
    expect(run({ shape: 'circle', length: '', width: 'x' }).ok).toBe(true);
    expect(run({ shape: 'area', area: '50', length: '', diameter: '' }).ok).toBe(true);
    expect(run({ shape: 'rectangle', diameter: '', area: 'x', perimeter: 'x' }).ok).toBe(true);
  });
  it('accepts commas in numbers', () => {
    expect(ok({ shape: 'area', area: '1,000' }).area).toBe(1000);
  });
});

describe('input boundaries (just inside accepted, just outside rejected)', () => {
  const cases = [
    ['length', {}, 1, 100, 0.99, 100.01],
    ['width', {}, 1, 100, 0.99, 100.01],
    ['diameter', { shape: 'circle' }, 1, 100, 0.99, 100.01],
    ['area', { shape: 'area' }, 1, 10000, 0.99, 10000.01],
    ['perimeter', { shape: 'area', area: '100' }, 1, 2000, 0.99, 2000.01],
    ['paverLength', {}, 4, 24, 3.99, 24.01],
    ['paverWidth', {}, 2, 24, 1.99, 24.01],
    ['jointWidth', {}, 0, 0.5, -0.01, 0.51],
    ['extraBase', { soil: 'poor' }, 2, 4, 1.99, 4.01],
    ['sandDepth', {}, 0.5, 2, 0.49, 2.01],
    ['density', {}, 1, 2, 0.99, 2.01],
    ['waste', {}, 0, 20, -0.01, 20.01],
  ];
  for (const [field, base, min, max, below, above] of cases) {
    it(`${field}: accepts ${min} and ${max}, rejects ${below} and ${above}`, () => {
      expect(run({ ...base, [field]: String(min) }).ok).toBe(true);
      expect(run({ ...base, [field]: String(max) }).ok).toBe(true);
      errorOn(field, { ...base, [field]: String(below) });
      errorOn(field, { ...base, [field]: String(above) });
    });
  }
});

// KEEP THIS BLOCK. It is skipped in the _template folder only, and fails in a
// newly scaffolded tool until the template example and every TODO are replaced.
const isTemplateFolder = new URL('.', import.meta.url).pathname.endsWith('/_template/');
describe.skipIf(isTemplateFolder)('scaffold guard', () => {
  it('replaces the template example calculation', () => {
    expect(logic.TEMPLATE_EXAMPLE).toBeUndefined();
  });
  it('has no TODO left in meta.json or page.md', () => {
    for (const file of ['meta.json', 'page.md']) {
      expect(readFileSync(new URL(`./${file}`, import.meta.url), 'utf8'), file).not.toMatch(/TODO/);
    }
  });
});
