// logic.test.js: Vitest tests for logic.js (Asphalt Calculator).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate, orderTons } = logic;
const base = { length: '40', width: '12', layers: 'one', thickness: '3', rate: '110', waste: '5' };
const run = (over = {}) => calculate({ ...base, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};

describe('known answers', () => {
  // page.md worked example. Hand math: 480 / 9 = 53.33 sq yd x 3 x 110 = 17,600 lb x 1.05 = 18,480 lb = 9.24 tons -> 9.5.
  it('40 x 12 ft, 3 in, 5% extra = 9.24 tons, order 9.5 (page.md worked example)', () => {
    expect(ok()).toEqual({ tonsToOrder: 9.5, tons: 9.24, cubicYards: 4.67, cubicFeet: 126, area: 480, sqYd: 53.33, baseTons: null, surfaceTons: null, densityLbCuFt: 146.7 });
  });
  it('same driveway with no extra = exactly 8.8 tons, order 9 (hand math: 17,600 / 2,000)', () => {
    expect(ok({ waste: '0' })).toMatchObject({ tons: 8.8, tonsToOrder: 9, cubicYards: 4.44 });
  });
  // Hand math: base 53.33 x 2 x 110 x 1.05 / 2000 = 6.16; surface x 1.5 = 4.62; total 10.78 -> 11.
  it('two layers, 2 in base + 1.5 in surface = 6.16 + 4.62 = 10.78 tons, order 11 (hand math)', () => {
    expect(ok({ layers: 'two', thickness: '2', surfaceThickness: '1.5' })).toMatchObject({ baseTons: 6.16, surfaceTons: 4.62, tons: 10.78, tonsToOrder: 11 });
  });
  // Hand math: one ton covers 2000 / 110 = 18.18 sq yd at 1 in; 9 x 18.18 = 163.6 sq ft.
  it('page.md coverage FAQ: 164 sq ft at 1 in is just about one ton (hand math)', () => {
    expect(ok({ length: '163.64', width: '1', thickness: '1', waste: '0' }).tons).toBe(1);
  });
  it('page.md driveway table matches calculate()', () => {
    const md = readFileSync(new URL('./page.md', import.meta.url), 'utf8');
    for (const [l, w] of [[20, 10], [40, 12], [50, 20], [60, 24], [100, 12]]) {
      const two = ok({ length: String(l), width: String(w), thickness: '2' });
      const three = ok({ length: String(l), width: String(w) });
      const row = md.split('\n').find((x) => x.startsWith(`| ${l} × ${w} |`));
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean).slice(1).map(Number);
      expect(cells).toEqual([three.area, two.tons, two.tonsToOrder, three.tons, three.tonsToOrder]);
    }
  });
  it('orders round up to the next half ton', () => {
    expect([orderTons(8.8), orderTons(9), orderTons(9.01), orderTons(9.5)]).toEqual([9, 9, 9.5, 9.5]);
  });
  it('chart highlights your thickness; diagram is a box with layers when two', () => {
    expect(run().chart.find((p) => p.highlight).label).toBe('3 in');
    expect(run({ layers: 'two', thickness: '2', surfaceThickness: '1.5' }).diagram).toMatchObject({ type: 'box', depth: 3.5, layers: [{ label: 'Surface', depth: 1.5 }, { label: 'Base', depth: 2 }] });
  });
});

describe('edge cases', () => {
  it('rejects zero, negative, empty, and non-numeric on the right field', () => {
    expect(run({ length: '0' }).errors).toHaveProperty('length');
    expect(run({ width: '-3' }).errors).toHaveProperty('width');
    expect(run({ thickness: '' }).errors).toHaveProperty('thickness');
    expect(run({ rate: 'heavy' }).errors).toHaveProperty('rate');
    expect(calculate({}).ok).toBe(false);
  });
  it('bounds: thickness 0.5 to 12, surface 0.5 to 6, rate 90 to 130, extra 0 to 20', () => {
    expect(run({ thickness: '0.5' }).ok).toBe(true);
    expect(run({ thickness: '12.1' }).errors).toHaveProperty('thickness');
    expect(run({ layers: 'two', surfaceThickness: '6.1' }).errors).toHaveProperty('surfaceThickness');
    expect(run({ rate: '90' }).ok).toBe(true);
    expect(run({ rate: '89' }).errors).toHaveProperty('rate');
    expect(run({ rate: '131' }).errors).toHaveProperty('rate');
    expect(run({ waste: '20' }).ok).toBe(true);
    expect(run({ waste: '20.1' }).errors).toHaveProperty('waste');
  });
  it('very large lot stays finite', () => {
    expect(ok({ length: '2000', width: '500', thickness: '12', waste: '0' }).tons).toBe(73333.33);
  });
  it('surface field is ignored with one layer; unknown layer choice rejected', () => {
    expect(ok({ surfaceThickness: 'x' }).surfaceTons).toBe(null);
    expect(run({ layers: 'three' }).errors).toHaveProperty('layers');
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
