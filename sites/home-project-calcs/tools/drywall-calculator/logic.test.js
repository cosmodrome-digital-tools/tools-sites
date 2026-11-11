// logic.test.js: Vitest tests for logic.js (Drywall Calculator).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate, screwsPerSheet, SHEETS } = logic;
const base = { length: '12', width: '12', height: '8', includeCeiling: 'yes', openings: '30', sheetSize: '4x8', framing: '16', waste: '10' };
const run = (over = {}) => calculate({ ...base, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};

describe('known answers', () => {
  // page.md worked example. Hand math: walls 2 x 24 x 8 - 30 = 354; ceiling 144;
  // 354 x 1.1 / 32 = 12.17 -> 13; 144 x 1.1 / 32 = 4.95 -> 5; mud 498 x 0.01 = 4.98 -> 5;
  // tape 498 x 0.37 = 184.26 -> 185; screws 13 x 28 + 5 x 35 = 539.
  it('12 x 12 x 8 room with ceiling = 18 sheets, 5 gal, 185 ft tape, 539 screws (page.md worked example)', () => {
    expect(ok()).toEqual({
      sheets: 18, compound: 5, tape: 185, screws: 539,
      wallArea: 354, wallSheets: 13, wallScrews: 364, wallPerSheet: 28, wallSpacing: 16,
      ceilingArea: 144, ceilingSheets: 5, ceilingScrews: 175, ceilingPerSheet: 35, ceilingSpacing: 12,
      boardArea: 498,
    });
  });
  // Hand math: 24 in framing -> walls 12 in screws; 4x12: members 144/24+1 = 7, per member 48/12+1 = 5 -> 35 (walls and ceiling).
  // wall sheets 354 x 1.1 / 48 = 8.11 -> 9; ceiling 158.4 / 48 = 3.3 -> 4; screws 13 x 35 = 455.
  it('4x12 sheets on 24 in framing = 13 sheets, 35 screws per sheet, 455 screws (hand math)', () => {
    expect(ok({ sheetSize: '4x12', framing: '24' })).toMatchObject({ sheets: 13, wallSheets: 9, ceilingSheets: 4, wallPerSheet: 35, ceilingPerSheet: 35, screws: 455, wallSpacing: 12 });
  });
  // Hand math: 10 x 10 x 8, no openings, walls only, 0% waste: 320 sq ft / 32 = 10 sheets; mud 3.2 -> 4; tape 118.4 -> 119; 10 x 28 = 280.
  it('10 x 10 x 8 walls only, no openings, 0% waste = 10 sheets, 4 gal, 119 ft, 280 screws (hand math)', () => {
    const r = ok({ length: '10', width: '10', includeCeiling: 'no', openings: '0', waste: '0' });
    expect(r).toMatchObject({ sheets: 10, compound: 4, tape: 119, screws: 280, ceilingArea: null, ceilingSheets: null });
  });
  it('screws per sheet from IRC spacing: 4x8 wall @16 = 28, ceiling @16 = 35, wall @24 = 25, 4x10 wall @16 = 32', () => {
    expect(screwsPerSheet(SHEETS['4x8'], 16, 16)).toBe(28);
    expect(screwsPerSheet(SHEETS['4x8'], 16, 12)).toBe(35);
    expect(screwsPerSheet(SHEETS['4x8'], 24, 12)).toBe(25);
    expect(screwsPerSheet(SHEETS['4x10'], 16, 16)).toBe(32);
  });
  it('page.md room-size table matches calculate()', () => {
    const md = readFileSync(new URL('./page.md', import.meta.url), 'utf8');
    for (const [l, w] of [[10, 10], [10, 12], [12, 12], [12, 14], [14, 16]]) {
      const r = ok({ length: String(l), width: String(w) });
      const row = md.split('\n').find((x) => x.startsWith(`| ${l} × ${w} |`));
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean).slice(1).map(Number);
      expect(cells).toEqual([r.wallArea, r.ceilingArea, r.sheets, r.compound, r.tape, r.screws]);
    }
  });
  it('returns a room diagram with the wall and ceiling areas', () => {
    expect(run().diagram).toMatchObject({ type: 'room', length: 12, width: 12, height: 8, ceiling: true, wallLabel: 'Walls 354 sq ft' });
  });
});

describe('edge cases', () => {
  it('rejects zero, negative, empty, and non-numeric sizes on the right field', () => {
    expect(run({ length: '0' }).errors).toHaveProperty('length');
    expect(run({ width: '-3' }).errors).toHaveProperty('width');
    expect(run({ height: '' }).errors).toHaveProperty('height');
    expect(run({ openings: 'some' }).errors).toHaveProperty('openings');
    expect(calculate({}).ok).toBe(false);
  });
  it('openings must be smaller than the wall area', () => {
    expect(run({ openings: '384' }).errors).toHaveProperty('openings');
    expect(run({ openings: '383' }).ok).toBe(true);
  });
  it('bounds: length 2 to 100, height 4 to 20, waste 0 to 30', () => {
    expect(run({ length: '2' }).ok).toBe(true);
    expect(run({ length: '1.9' }).ok).toBe(false);
    expect(run({ length: '100' }).ok).toBe(true);
    expect(run({ length: '100.1' }).ok).toBe(false);
    expect(run({ height: '4' }).ok).toBe(true);
    expect(run({ height: '20.1' }).errors).toHaveProperty('height');
    expect(run({ waste: '30' }).ok).toBe(true);
    expect(run({ waste: '30.1' }).errors).toHaveProperty('waste');
    expect(run({ waste: '-1' }).errors).toHaveProperty('waste');
  });
  it('very large room stays finite', () => {
    const r = ok({ length: '100', width: '100', height: '20', openings: '0' });
    expect(r.sheets).toBe(ceil(8000 * 1.1 / 32) + ceil(10000 * 1.1 / 32));
  });
  it('rejects unknown sheet size, framing, and ceiling choice', () => {
    expect(run({ sheetSize: '4x9' }).errors).toHaveProperty('sheetSize');
    expect(run({ framing: '19.2' }).errors).toHaveProperty('framing');
    expect(run({ includeCeiling: 'maybe' }).errors).toHaveProperty('includeCeiling');
  });
});

function ceil(x) {
  return Math.ceil(Number(x.toPrecision(15)));
}

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
