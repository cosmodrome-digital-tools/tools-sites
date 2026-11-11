// logic.test.js: Vitest tests for logic.js (Siding Calculator).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate } = logic;
const base = { mode: 'house', houseLength: '40', houseWidth: '30', wallHeight: '9', gables: '2', gableRise: '7.5', openings: '0', cartonCoverage: '200', waste: '10' };
const run = (over = {}) => calculate({ ...base, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};

describe('known answers', () => {
  // page.md worked example. Hand math (VSI method): walls 2 x 70 x 9 = 1260; gables 2 x 30 x 7.5 / 2 = 225;
  // 1485 x 1.1 = 1633.5; / 100 = 16.34 -> 17 squares; / 200 = 8.17 -> 9 cartons.
  it('40 x 30 ft house, 9 ft walls, two 7.5 ft gables = 17 squares, 9 cartons (page.md worked example)', () => {
    expect(ok()).toEqual({ squares: 17, cartons: 9, wallsArea: 1260, gableArea: 225, openings: 0, netArea: 1485, areaWithWaste: 1633.5, exactSquares: 16.34 });
  });
  // Hand math: 1485 - 150 = 1335; x 1.1 = 1468.5 -> 14.69 -> 15 squares.
  it('deducting 150 sq ft of openings = 15 squares; blank carton coverage skips cartons (hand math)', () => {
    expect(ok({ openings: '150', cartonCoverage: '' })).toMatchObject({ netArea: 1335, squares: 15, cartons: null });
  });
  // Hand math: hip roof, 0 gables: 2 x (60 + 40) x 10 = 2000; x 1.1 = 2200 -> 22 squares (gable height not needed).
  it('hip roof (0 gables) 60 x 40 x 10 = 22 squares, gable height ignored (hand math)', () => {
    expect(ok({ houseLength: '60', houseWidth: '40', wallHeight: '10', gables: '0', gableRise: undefined })).toMatchObject({ gableArea: 0, squares: 22 });
  });
  it('entered wall area: 1,200 sq ft + 10% = 13.2 -> 14 squares (hand math)', () => {
    expect(calculate({ mode: 'area', wallArea: '1200', openings: '0', waste: '10' }).results).toMatchObject({ squares: 14, gableArea: null, cartons: null });
  });
  it('page.md house-size table matches calculate()', () => {
    const md = readFileSync(new URL('./page.md', import.meta.url), 'utf8');
    for (const [l, w, h] of [[30, 24, 8], [40, 30, 9], [50, 30, 9], [60, 40, 10]]) {
      const r = ok({ houseLength: String(l), houseWidth: String(w), wallHeight: String(h), gableRise: String(w / 4) });
      const row = md.split('\n').find((x) => x.startsWith(`| ${l} × ${w} |`));
      const cells = row.split('|').map((c) => c.trim().replace(/,/g, '')).filter(Boolean).slice(1).map(Number);
      expect(cells).toEqual([h, r.wallsArea, r.gableArea, r.areaWithWaste, r.squares]);
    }
  });
  it('returns a gable-end wall diagram', () => {
    expect(run().diagram).toMatchObject({ type: 'wall', length: 30, height: 9, gableRise: 7.5, pattern: 'siding' });
  });
});

describe('edge cases', () => {
  it('rejects zero, negative, empty, and non-numeric on the right field', () => {
    expect(run({ houseLength: '0' }).errors).toHaveProperty('houseLength');
    expect(run({ houseWidth: '-2' }).errors).toHaveProperty('houseWidth');
    expect(run({ wallHeight: '' }).errors).toHaveProperty('wallHeight');
    expect(run({ gableRise: 'tall' }).errors).toHaveProperty('gableRise');
    expect(calculate({}).ok).toBe(false);
  });
  it('openings must be smaller than the wall area', () => {
    expect(run({ openings: '1485' }).errors).toHaveProperty('openings');
    expect(run({ openings: '1484' }).ok).toBe(true);
  });
  it('bounds: length 4 to 300, gables whole 0 to 4, waste 0 to 30, wall area 10 to 50,000', () => {
    expect(run({ houseLength: '4' }).ok).toBe(true);
    expect(run({ houseLength: '300.1' }).errors).toHaveProperty('houseLength');
    expect(run({ gables: '4' }).ok).toBe(true);
    expect(run({ gables: '5' }).errors).toHaveProperty('gables');
    expect(run({ gables: '1.5' }).errors).toHaveProperty('gables');
    expect(run({ waste: '30' }).ok).toBe(true);
    expect(run({ waste: '30.1' }).errors).toHaveProperty('waste');
    expect(calculate({ mode: 'area', wallArea: '9.9', openings: '0', waste: '10' }).errors).toHaveProperty('wallArea');
    expect(calculate({ mode: 'area', wallArea: '50000', openings: '0', waste: '10' }).ok).toBe(true);
  });
  it('very large house stays finite', () => {
    expect(ok({ houseLength: '300', houseWidth: '200', wallHeight: '40', gableRise: '40' }).squares).toBe(528); // hand math: (40,000 + 8,000) x 1.1 = 52,800 sq ft / 100
  });
  it('house fields are ignored in area mode (hidden by the frame)', () => {
    expect(calculate({ mode: 'area', wallArea: '500', houseLength: 'x', openings: '0', waste: '0' }).results.squares).toBe(5);
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
