// logic.test.js: Vitest tests for logic.js.
// Required: at least 3 known-answer cases (each with its reference noted: a
// trusted calculator or hand math) PLUS edge cases: zero, negative, very
// large, empty, non-numeric, and the boundary values of every input.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate, ENERGY_STAR_ATTIC, ATTICAT_ROWS, BATT_THICKNESS } = logic;
const ok = (raw) => {
  const r = calculate(raw);
  expect(r.ok).toBe(true);
  return r;
};

const base = (over = {}) => ({
  area: '1000',
  climateZone: '4ab',
  existing: 'none',
  product: 'blown',
  battR: '38',
  battCoverage: '64',
  targetR: '',
  extraWaste: '0',
  ...over,
});

describe('known answers', () => {
  it('worked example: 1,000 sq ft, zone 4A/4B, uninsulated, AttiCat, 0% waste = 32 bags at R-60 (ENERGY STAR R60; AttiCat 31.5 bags/1,000 rounds up; min 20.5 in)', () => {
    // Hand math: 31.5 x (1000/1000) x 1.00 = 31.5, ceil = 32.
    const out = ok(base());
    expect(out.results).toEqual({
      energyStarR: 60,
      packages: 32,
      beforeRounding: 31.5,
      blownThickness: 20.5,
      battThickness: null,
      chartR: 60,
      rShortfall: 0,
    });
    expect(out.chart).toEqual([
      { label: 'R30', value: 15 },
      { label: 'R38', value: 19 },
      { label: 'R49', value: 25 },
      { label: 'R60', value: 32 },
    ]);
  });

  it('zone 1 with 3-4 in adds ENERGY STAR R-25 with the next AttiCat row, R-26 (12.6 bags -> 13; 9.5 in)', () => {
    // Hand math: no R-25 row; smallest published row >= 25 is R-26 (May 2026
    // AttiCat sheet). 12.6 x (1000/1000) = 12.6, ceil = 13. Min thickness 9.5 in.
    const out = ok(base({ climateZone: '1', existing: 'some' }));
    expect(out.results.energyStarR).toBe(25);
    expect(out.results.chartR).toBe(26);
    expect(out.results.beforeRounding).toBe(12.6);
    expect(out.results.packages).toBe(13);
    expect(out.results.blownThickness).toBe(9.5);
    expect(out.results.rShortfall).toBe(0);
  });

  it('every published AttiCat row at 1,000 sq ft matches the May 2026 data sheet', () => {
    // Sheet columns: R-value, bags per 1,000 sq ft, minimum thickness (in).
    const sheet = [
      [13, 5.9, 5], [19, 9, 7], [22, 10.5, 8], [26, 12.6, 9.5], [30, 14.6, 10.75],
      [38, 19, 13.5], [44, 22.4, 15.5], [49, 25, 17], [60, 31.5, 20.5],
    ];
    for (const [r, bags, inches] of sheet) {
      const out = ok(base({ targetR: String(r) }));
      expect(out.results.chartR).toBe(r);
      expect(out.results.beforeRounding).toBe(bags);
      expect(out.results.packages).toBe(Math.ceil(bags));
      expect(out.results.blownThickness).toBe(inches);
    }
  });

  it('2,000 sq ft, zone 2, uninsulated AttiCat R-49 = 50 bags exactly (25 bags/1,000 x 2)', () => {
    const out = ok(base({ area: '2000', climateZone: '2' }));
    expect(out.results).toMatchObject({
      energyStarR: 49,
      chartR: 49,
      beforeRounding: 50,
      packages: 50,
      blownThickness: 17,
      rShortfall: 0,
    });
  });

  it('batts: 1,000 sq ft / 64 sq ft per package = 15.625, buy 16; thickness 12 in; 22 R short of R-60', () => {
    // Hand math: 1000/64 = 15.625, displayed 15.63, ceil = 16. Shortfall 60 - 38 = 22.
    // 64 sq ft is the EcoTouch fact-sheet package: R-38, 12 in, 24 in x 48 in, 8 pieces.
    const out = ok(base({ product: 'batts' }));
    expect(out.results).toEqual({
      energyStarR: 60,
      packages: 16,
      beforeRounding: 15.63,
      blownThickness: null,
      battThickness: 12,
      chartR: null,
      rShortfall: 22,
    });
    expect(out.chart.map((point) => point.value)).toEqual([15, 19, 25, 32]);
  });

  it('10% extra waste on an exact AttiCat R-38 count: 19 x 1.10 = 20.9, buy 21', () => {
    const out = ok(base({ climateZone: '2', existing: 'some', extraWaste: '10' }));
    expect(out.results.energyStarR).toBe(38);
    expect(out.results.chartR).toBe(38);
    expect(out.results.beforeRounding).toBe(20.9);
    expect(out.results.packages).toBe(21);
    expect(out.results.blownThickness).toBe(13.5);
  });

  it('a target override of 30 in zone 4A/4B still reports ENERGY STAR R-60 and buys the R-30 row', () => {
    const out = ok(base({ targetR: '30' }));
    expect(out.results.energyStarR).toBe(60);
    expect(out.results.chartR).toBe(30);
    expect(out.results.packages).toBe(15);
    // Shortfall is against the typed goal (30), which the R-30 row meets.
    // The ENERGY STAR line stays 60 so the two results can be compared.
    expect(out.results.rShortfall).toBe(0);
    expect(out.results.blownThickness).toBe(10.75);
  });
});

describe('climate zones and products', () => {
  it('matches every ENERGY STAR attic cell at 1,000 sq ft', () => {
    for (const [zone, levels] of Object.entries(ENERGY_STAR_ATTIC)) {
      for (const existing of ['none', 'some']) {
        const out = ok(base({ climateZone: zone, existing }));
        expect(out.results.energyStarR).toBe(levels[existing]);
        const row = ATTICAT_ROWS.find((item) => item.r >= levels[existing]);
        expect(out.results.chartR).toBe(row.r);
        expect(out.results.blownThickness).toBe(row.minInches);
      }
    }
  });

  it('uses the published EcoTouch thickness for each batt R-value', () => {
    for (const [battR, inches] of Object.entries(BATT_THICKNESS)) {
      const out = ok(base({ product: 'batts', battR, climateZone: '1' }));
      expect(out.results.battThickness).toBe(inches);
      expect(out.results.blownThickness).toBeNull();
      expect(out.results.chartR).toBeNull();
    }
  });

  it('batt package count follows coverage, not the climate zone', () => {
    const warm = ok(base({ product: 'batts', climateZone: '1' }));
    const cold = ok(base({ product: 'batts', climateZone: '78' }));
    expect(warm.results.packages).toBe(cold.results.packages);
    expect(warm.results.energyStarR).toBe(30);
    expect(cold.results.energyStarR).toBe(60);
    expect(warm.results.rShortfall).toBe(0);
    expect(cold.results.rShortfall).toBe(22);
  });

  it('blown bag count ignores batt coverage', () => {
    const low = ok(base({ battCoverage: '10' }));
    const high = ok(base({ battCoverage: '400' }));
    expect(low.results.packages).toBe(high.results.packages);
  });

  it('a goal between published rows uses the next higher AttiCat row', () => {
    expect(ok(base({ targetR: '14' })).results.chartR).toBe(19);
    expect(ok(base({ targetR: '20' })).results.chartR).toBe(22);
    expect(ok(base({ targetR: '25' })).results.chartR).toBe(26);
    expect(ok(base({ targetR: '27' })).results.chartR).toBe(30);
    expect(ok(base({ targetR: '31' })).results.chartR).toBe(38);
    expect(ok(base({ targetR: '39' })).results.chartR).toBe(44);
    expect(ok(base({ targetR: '45' })).results.chartR).toBe(49);
    expect(ok(base({ targetR: '50' })).results.chartR).toBe(60);
    expect(ok(base({ targetR: '13' })).results.chartR).toBe(13);
  });

  it('the line chart stays on the four IECC attic levels whichever row is bought', () => {
    const out = ok(base({ targetR: '44' }));
    expect(out.results.chartR).toBe(44);
    expect(out.chart.map((point) => point.label)).toEqual(['R30', 'R38', 'R49', 'R60']);
  });
});

describe('edge cases', () => {
  it('rejects zero and negative area, waste, and coverage', () => {
    expect(calculate(base({ area: '0' })).errors).toHaveProperty('area');
    expect(calculate(base({ area: '-5' })).errors).toHaveProperty('area');
    expect(calculate(base({ extraWaste: '-1' })).errors).toHaveProperty('extraWaste');
    expect(calculate(base({ battCoverage: '0' })).errors).toHaveProperty('battCoverage');
    expect(calculate(base({ battCoverage: '-10' })).errors).toHaveProperty('battCoverage');
  });

  it('rejects very large area and coverage', () => {
    expect(calculate(base({ area: '1e7' })).errors).toHaveProperty('area');
    expect(calculate(base({ area: '5001' })).errors).toHaveProperty('area');
    expect(calculate(base({ battCoverage: '401' })).errors).toHaveProperty('battCoverage');
    expect(calculate(base({ targetR: '61' })).errors).toHaveProperty('targetR');
  });

  it('rejects empty and non-numeric input', () => {
    expect(calculate(base({ area: '' })).errors).toHaveProperty('area');
    expect(calculate(base({ area: 'ten' })).errors).toHaveProperty('area');
    expect(calculate(base({ extraWaste: '' })).errors).toHaveProperty('extraWaste');
    expect(calculate(base({ extraWaste: 'none' })).errors).toHaveProperty('extraWaste');
    expect(calculate(base({ battCoverage: 'sixty four' })).errors).toHaveProperty('battCoverage');
    expect(calculate(base({ targetR: 'R-49' })).errors).toHaveProperty('targetR');
    expect(calculate({}).ok).toBe(false);
  });

  it('accepts area boundaries 100 and 5000 and rejects just outside', () => {
    expect(calculate(base({ area: '100' })).ok).toBe(true);
    expect(calculate(base({ area: '5000' })).ok).toBe(true);
    expect(calculate(base({ area: '99.9' })).errors).toHaveProperty('area');
    expect(calculate(base({ area: '5000.1' })).errors).toHaveProperty('area');
  });

  it('accepts target boundaries blank, 13, and 60, and rejects just outside', () => {
    expect(calculate(base({ targetR: '' })).ok).toBe(true);
    expect(calculate(base({ targetR: '13' })).ok).toBe(true);
    expect(calculate(base({ targetR: '60' })).ok).toBe(true);
    expect(calculate(base({ targetR: '12.9' })).errors).toHaveProperty('targetR');
    expect(calculate(base({ targetR: '60.1' })).errors).toHaveProperty('targetR');
  });

  it('accepts waste boundaries 0 and 15 and rejects just outside', () => {
    expect(calculate(base({ extraWaste: '0' })).ok).toBe(true);
    expect(calculate(base({ extraWaste: '15' })).ok).toBe(true);
    expect(calculate(base({ extraWaste: '-0.1' })).errors).toHaveProperty('extraWaste');
    expect(calculate(base({ extraWaste: '15.1' })).errors).toHaveProperty('extraWaste');
  });

  it('accepts coverage boundaries 10 and 400 and rejects just outside', () => {
    expect(calculate(base({ product: 'batts', battCoverage: '10' })).results.packages).toBe(100);
    expect(calculate(base({ product: 'batts', battCoverage: '400' })).results.packages).toBe(3);
    expect(calculate(base({ battCoverage: '9.9' })).errors).toHaveProperty('battCoverage');
    expect(calculate(base({ battCoverage: '400.1' })).errors).toHaveProperty('battCoverage');
  });

  it('rejects unknown select values', () => {
    expect(calculate(base({ climateZone: '4A' })).errors).toHaveProperty('climateZone');
    expect(calculate(base({ climateZone: '' })).errors).toHaveProperty('climateZone');
    expect(calculate(base({ existing: '4 inches' })).errors).toHaveProperty('existing');
    expect(calculate(base({ product: 'cellulose' })).errors).toHaveProperty('product');
    expect(calculate(base({ battR: '49' })).errors).toHaveProperty('battR');
  });

  it('reports every invalid field at once', () => {
    const errors = calculate(base({
      area: '',
      climateZone: 'nope',
      existing: '',
      product: '',
      battR: '',
      battCoverage: '',
      extraWaste: '',
    })).errors;
    expect(Object.keys(errors).sort()).toEqual([
      'area',
      'battCoverage',
      'battR',
      'climateZone',
      'existing',
      'extraWaste',
      'product',
    ]);
  });

  it('rounds a fractional bag up at the area minimum', () => {
    // 100 sq ft at R-60: 31.5 x 0.1 = 3.15, buy 4.
    const out = ok(base({ area: '100' }));
    expect(out.results.beforeRounding).toBe(3.15);
    expect(out.results.packages).toBe(4);
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
