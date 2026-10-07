// logic.test.js: Vitest tests for logic.js.
// Known answers use hand math with the manufacturer bag yields cited in
// meta.json (Quikrete 1101, Sakrete High-Strength, Quikrete 1004 data sheets).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate } = logic;

const SLAB = { shape: 'slab', length: '10', width: '10', thickness: '4', quantity: '1', brand: 'quikrete1101', bagSize: '80', waste: '5' };
const COLUMN = { shape: 'column', diameter: '12', height: '36', quantity: '1', brand: 'quikrete1101', bagSize: '80', waste: '5' };

const ok = (raw) => {
  const r = calculate(raw);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};
const errorsFor = (raw) => {
  const r = calculate(raw);
  expect(r.ok).toBe(false);
  return r.errors;
};

describe('known answers', () => {
  // Worked example in page.md. Hand math: 10 x 10 x (4/12) = 33.33 cu ft;
  // x 1.05 = 35.00 cu ft; 35 / 0.60 (Quikrete 80 lb yield) = 58.33 -> 59 bags.
  it('10 x 10 ft slab, 4 in, 80 lb Quikrete, 5% waste = 59 bags (page.md worked example)', () => {
    expect(ok(SLAB)).toEqual({
      bags: 59,
      bagSize: 80,
      totalWeight: 4720,
      cubicYardsWithWaste: 1.3,
      cubicFeetWithWaste: 35,
      cubicYards: 1.23,
      cubicFeet: 33.33,
      bagYield: 0.6,
      bagsPerCubicYard: 45,
    });
  });

  // Hand math: 33.33 cu ft / 0.60 = 55.56 -> 56 bags.
  it('same slab with 0% waste = 56 bags', () => {
    expect(ok({ ...SLAB, waste: '0' }).bags).toBe(56);
  });

  // Hand math: 9 x 9 x (4/12) = 27 cu ft = exactly 1 cu yd.
  // Quikrete 90 lb: 27 / 0.675 = 40 exactly (must not round up to 41).
  // Sakrete 90 lb: 27 / 0.66 = 40.91 -> 41. Quikrete 80 lb: 27 / 0.6 = 45.
  it('1 cu yd slab: Quikrete 90 lb = 40 bags, Sakrete 90 lb = 41, 80 lb = 45', () => {
    const yard = { ...SLAB, length: '9', width: '9', waste: '0' };
    expect(ok({ ...yard, bagSize: '90' })).toMatchObject({ cubicYards: 1, bags: 40, bagsPerCubicYard: 40 });
    expect(ok({ ...yard, brand: 'sakreteHighStrength', bagSize: '90' })).toMatchObject({ bags: 41, bagsPerCubicYard: 40.9, bagYield: 0.66 });
    expect(ok({ ...yard, bagSize: '80' }).bags).toBe(45);
    expect(ok({ ...yard, brand: 'quikrete1004', bagSize: '50' }).bags).toBe(72); // 27 / 0.375
    // FAQ: 1 cu yd with 5% waste = 28.35 cu ft / 0.6 = 47.25 -> 48 bags.
    expect(ok({ ...yard, waste: '5' }).bags).toBe(48);
  });

  // Hand math: pi x (0.5 ft)^2 x 3 ft = 2.356 cu ft; x 1.05 = 2.474; / 0.6 = 4.12 -> 5 bags.
  it('12 in Sonotube, 36 in tall, 80 lb, 5% waste = 5 bags', () => {
    expect(ok(COLUMN)).toMatchObject({ bags: 5, cubicFeet: 2.36, cubicFeetWithWaste: 2.47, cubicYards: 0.09 });
  });

  // Hand math: pi x 0.25 x 4 = 3.1416 cu ft / 0.6 = 5.24 -> 6 bags (FAQ answer).
  it('12 in Sonotube, 48 in tall, 0% waste = 6 bags (FAQ)', () => {
    expect(ok({ ...COLUMN, height: '48', waste: '0' })).toMatchObject({ bags: 6, cubicFeet: 3.14 });
  });

  // Hand math: 12 x 12 x (4/12) = 48 cu ft x 1.05 = 50.4; / 0.6 = 84 exactly (no float bump to 85).
  it('12 x 12 ft slab, 4 in, 5% waste = 84 x 80 lb or 112 x 60 lb bags (sizes table)', () => {
    const slab = { ...SLAB, length: '12', width: '12' };
    expect(ok(slab)).toMatchObject({ bags: 84, cubicYards: 1.78, cubicYardsWithWaste: 1.87 });
    expect(ok({ ...slab, bagSize: '60' }).bags).toBe(112); // 50.4 / 0.45 = 112 exactly
  });

  it('quantity multiplies the pour: 3 identical columns = 3x the volume', () => {
    const one = ok({ ...COLUMN, waste: '0' });
    const three = ok({ ...COLUMN, waste: '0', quantity: '3' });
    expect(three.cubicFeet).toBeCloseTo(one.cubicFeet * 3, 1);
    expect(three.bags).toBe(12); // 7.07 / 0.6 = 11.78 -> 12
  });

  it('chart compares 4/5/6/8 in thickness for the same slab footprint', () => {
    const r = calculate(SLAB);
    expect(r.chart.map((d) => d.value)).toEqual([59, 73, 88, 117]);
    expect(r.chart[0].label).toBe('4" · 59');
  });

  it('chart compares 8/12/16/24 in diameters for a column', () => {
    expect(calculate(COLUMN).chart.map((d) => d.value)).toEqual([2, 5, 8, 17]);
  });
});

describe('edge cases', () => {
  it('ignores column fields for a slab and slab fields for a column', () => {
    expect(calculate({ ...SLAB, diameter: 'abc', height: '' }).ok).toBe(true);
    expect(calculate({ ...COLUMN, length: '', width: '-5', thickness: 'x' }).ok).toBe(true);
  });

  it('rejects zero and negative sizes', () => {
    expect(errorsFor({ ...SLAB, length: '0' })).toHaveProperty('length');
    expect(errorsFor({ ...SLAB, width: '-1' })).toHaveProperty('width');
    expect(errorsFor({ ...SLAB, thickness: '0' })).toHaveProperty('thickness');
    expect(errorsFor({ ...COLUMN, diameter: '-12' })).toHaveProperty('diameter');
    expect(errorsFor({ ...COLUMN, height: '0' })).toHaveProperty('height');
    expect(errorsFor({ ...SLAB, quantity: '0' })).toHaveProperty('quantity');
    expect(errorsFor({ ...SLAB, waste: '-1' })).toHaveProperty('waste');
  });

  it('rejects very large values', () => {
    expect(errorsFor({ ...SLAB, length: '1e9' })).toHaveProperty('length');
    expect(errorsFor({ ...COLUMN, height: '99999' })).toHaveProperty('height');
  });

  it('rejects empty and non-numeric input', () => {
    expect(errorsFor({ ...SLAB, length: '' })).toHaveProperty('length');
    expect(errorsFor({ ...SLAB, width: 'ten' })).toHaveProperty('width');
    expect(errorsFor({ ...SLAB, thickness: '4in' })).toHaveProperty('thickness');
    expect(errorsFor({ ...COLUMN, diameter: '' })).toHaveProperty('diameter');
    expect(calculate({}).ok).toBe(false);
    expect(calculate().ok).toBe(false);
  });

  it('accepts commas and spaces in numbers', () => {
    expect(ok({ ...SLAB, length: ' 10 ', width: '1,0' }).bags).toBe(59);
  });

  it('rejects fractional quantity', () => {
    expect(errorsFor({ ...SLAB, quantity: '1.5' }).quantity).toMatch(/whole number/);
  });

  it('rejects unknown shape, brand, and bag size', () => {
    expect(errorsFor({ ...SLAB, shape: 'triangle' })).toHaveProperty('shape');
    expect(errorsFor({ ...SLAB, brand: 'acme' })).toHaveProperty('brand');
    expect(errorsFor({ ...SLAB, bagSize: '70' })).toHaveProperty('bagSize');
  });

  it('rejects bag sizes a brand does not sell, keyed to bagSize', () => {
    expect(errorsFor({ ...SLAB, brand: 'sakreteHighStrength', bagSize: '50' }).bagSize).toMatch(/40 lb, 60 lb, 80 lb, 90 lb/);
    expect(errorsFor({ ...SLAB, brand: 'quikrete1004', bagSize: '80' }).bagSize).toMatch(/50 lb, 60 lb/);
  });

  // Boundaries from the brief: length/width 0.1-200 ft, thickness 2-24 in,
  // diameter 4-48 in, height 6-120 in, quantity 1-50, waste 0-25 %.
  const bounds = [
    ['length', SLAB, '0.1', '200', '0.09', '200.1'],
    ['width', SLAB, '0.1', '200', '0.09', '200.1'],
    ['thickness', SLAB, '2', '24', '1', '24.1'],
    ['diameter', COLUMN, '4', '48', '3.9', '48.1'],
    ['height', COLUMN, '6', '120', '5.9', '120.1'],
    ['quantity', SLAB, '1', '50', '0', '51'],
    ['waste', SLAB, '0', '25', '-0.1', '25.1'],
  ];
  for (const [name, base, lo, hi, below, above] of bounds) {
    it(`${name}: accepts ${lo} and ${hi}, rejects ${below} and ${above}`, () => {
      expect(calculate({ ...base, [name]: lo }).ok).toBe(true);
      expect(calculate({ ...base, [name]: hi }).ok).toBe(true);
      expect(errorsFor({ ...base, [name]: below })).toHaveProperty(name);
      expect(errorsFor({ ...base, [name]: above })).toHaveProperty(name);
    });
  }

  it('largest allowed slab still returns finite results', () => {
    const r = ok({ ...SLAB, length: '200', width: '200', thickness: '24', quantity: '50', waste: '25', bagSize: '40' });
    expect(Number.isFinite(r.bags)).toBe(true);
    expect(r.cubicYards).toBeGreaterThan(70000);
  });

  it('tiniest allowed slab still needs at least 1 bag', () => {
    expect(ok({ ...SLAB, length: '0.1', width: '0.1', thickness: '2', waste: '0' }).bags).toBe(1);
  });

  it('every brand/bag-size pair from the data sheets is wired up', () => {
    expect(logic.BRANDS.quikrete1101.yields).toEqual({ 40: 0.3, 50: 0.375, 60: 0.45, 80: 0.6, 90: 0.675 });
    expect(logic.BRANDS.sakreteHighStrength.yields).toEqual({ 40: 0.3, 60: 0.45, 80: 0.6, 90: 0.66 });
    expect(logic.BRANDS.quikrete1004.yields).toEqual({ 50: 0.375, 60: 0.45 });
  });
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
