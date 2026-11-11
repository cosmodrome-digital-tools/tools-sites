// logic.test.js: Vitest tests for logic.js (Sod Calculator).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate } = logic;
const base = { areaCount: '1', area1Length: '30', area1Width: '20', subtract: '0', rollCoverage: '10', palletCoverage: '450', waste: '5' };
const run = (over = {}) => calculate({ ...base, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};

describe('known answers', () => {
  // page.md worked example. Hand math: 30 x 20 = 600; x 1.05 = 630; / 10 = 63 rolls; / 450 = 1.4 -> 2 pallets.
  it('30 x 20 ft lawn = 63 rolls, 2 pallets (page.md worked example)', () => {
    expect(ok()).toEqual({ rolls: 63, pallets: 2, lawnArea: 600, lawnSqYd: 66.67, orderArea: 630, orderSqYd: 70, exactPallets: 1.4, subtract: 0, area1: 600, area2: null, area3: null });
  });
  // Hand math: 600 + 40 x 25 = 1600 - 120 = 1480; x 1.05 = 1554; / 10 = 155.4 -> 156; / 450 = 3.45 -> 4.
  it('two areas minus 120 sq ft of beds = 156 rolls, 4 pallets (hand math)', () => {
    expect(ok({ areaCount: '2', area2Length: '40', area2Width: '25', subtract: '120' })).toMatchObject({ lawnArea: 1480, orderArea: 1554, rolls: 156, pallets: 4, area2: 1000 });
  });
  // Hand math (MSU example): 1000 sq ft x 1.05 = 1050; / 500 = 2.1 -> 3 pallets; 0% extra = 1000 / 500 = 2 pallets exactly.
  it('1,000 sq ft with 500 sq ft pallets = 3 pallets; with 0% extra exactly 2 (hand math)', () => {
    expect(ok({ area1Length: '40', area1Width: '25', palletCoverage: '500' }).pallets).toBe(3);
    expect(ok({ area1Length: '40', area1Width: '25', palletCoverage: '500', waste: '0' }).pallets).toBe(2);
  });
  it('page.md lawn-size table matches calculate()', () => {
    const md = readFileSync(new URL('./page.md', import.meta.url), 'utf8');
    for (const [l, w] of [[20, 10], [20, 20], [40, 25], [50, 30], [50, 40], [100, 50]]) {
      const r = ok({ area1Length: String(l), area1Width: String(w) });
      const r5 = ok({ area1Length: String(l), area1Width: String(w), palletCoverage: '500' });
      const row = md.split('\n').find((x) => x.startsWith(`| ${l} × ${w} |`));
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean).slice(1).map(Number);
      expect(cells).toEqual([r.lawnArea, r.orderArea, r.rolls, r.pallets, r5.pallets]);
    }
  });
  it('returns a plan diagram with one area per rectangle', () => {
    const d = run({ areaCount: '3', area2Length: '10', area2Width: '10', area3Length: '5', area3Width: '8' }).diagram;
    expect(d).toMatchObject({ type: 'plan', pattern: 'turf' });
    expect(d.areas.map((a) => a.length)).toEqual([30, 10, 5]);
  });
});

describe('edge cases', () => {
  it('rejects zero, negative, empty, and non-numeric on the right field', () => {
    expect(run({ area1Length: '0' }).errors).toHaveProperty('area1Length');
    expect(run({ area1Width: '-1' }).errors).toHaveProperty('area1Width');
    expect(run({ rollCoverage: '' }).errors).toHaveProperty('rollCoverage');
    expect(run({ palletCoverage: 'big' }).errors).toHaveProperty('palletCoverage');
    expect(calculate({}).ok).toBe(false);
  });
  it('beds and paths must leave some lawn', () => {
    expect(run({ subtract: '600' }).errors).toHaveProperty('subtract');
    expect(run({ subtract: '599' }).ok).toBe(true);
  });
  it('bounds: lengths 1 to 1,000, roll 1 to 100, pallet 50 to 2,000, extra 0 to 25', () => {
    expect(run({ area1Length: '1' }).ok).toBe(true);
    expect(run({ area1Length: '1000.1' }).errors).toHaveProperty('area1Length');
    expect(run({ rollCoverage: '100' }).ok).toBe(true);
    expect(run({ rollCoverage: '0.9' }).errors).toHaveProperty('rollCoverage');
    expect(run({ palletCoverage: '49' }).errors).toHaveProperty('palletCoverage');
    expect(run({ palletCoverage: '2000' }).ok).toBe(true);
    expect(run({ waste: '25' }).ok).toBe(true);
    expect(run({ waste: '25.1' }).errors).toHaveProperty('waste');
  });
  it('very large: three 1,000 x 1,000 ft areas', () => {
    const big = { areaCount: '3', area1Length: '1000', area1Width: '1000', area2Length: '1000', area2Width: '1000', area3Length: '1000', area3Width: '1000', waste: '0' };
    expect(ok(big).rolls).toBe(300000);
  });
  it('areas hidden by the count are ignored; bad counts rejected', () => {
    expect(ok({ area2Length: 'x' }).area2).toBe(null);
    expect(run({ areaCount: '4' }).errors).toHaveProperty('areaCount');
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
