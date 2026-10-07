// logic.test.js: Vitest tests for logic.js.
// Required: at least 3 known-answer cases (each with its reference noted: a
// trusted calculator or hand math) PLUS edge cases: zero, negative, very
// large, empty, non-numeric, and the boundary values of every input.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate } = logic;
const ok = (raw) => {
  const r = calculate(raw);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};

const base = {
  length: '12',
  width: '12',
  material: 'composite',
  boardWidth: '5.5',
  boardLength: '16',
  sideGap: '0.1875',
  direction: 'perpendicular',
  joistSpacing: '16',
  chartSpan: '16',
  spanType: 'multiple',
  screwsPer: '2',
  waste: '10',
};

const run = (over = {}) => ok({ ...base, ...over });

describe('known answers', () => {
  it('12x12 worked example: 26 rows, 29 boards, 10 joists, 520 screws (hand math)', () => {
    // pitch = 5.5 + 0.1875 = 5.6875
    // rows = ceil((144 + 0.1875) / 5.6875) = ceil(25.3516) = 26
    // 25 boards cover 142 in, short of 144. 26 boards cover 147.6875 in.
    // 16 ft stick / 12 ft run = 1 row per stick. 26 * 1.10 = 28.6, buy 29.
    // joists = 144/16 + 1 = 10. screws = 26 * 10 * 2 = 520.
    // composite perpendicular chart 16: limit 16, warning 0.
    const result = run();
    expect(result).toMatchObject({
      boardRows: 26,
      boardsToBuy: 29,
      linearFeet: 464,
      joists: 10,
      screws: 520,
      screwsPerSqFt: 3.61,
      spacingLimit: 16,
      inchesOver: 0,
      spacingWarning: 0,
      threeJoistShort: 0,
      gapShort: 0,
    });
    expect(calculate(base).chart).toEqual([
      { label: 'Layout', value: 26 },
      { label: 'Extra', value: 3 },
    ]);
  });

  it('8 ft run with 16 ft sticks: one stick covers two rows (hand math)', () => {
    // width 120 in: rows = ceil(120.1875 / 5.6875) = 22
    // floor(192/96) = 2 rows per stick, so 11 sticks. 11 * 1.10 = 12.1, buy 13.
    // joists = 96/16 + 1 = 7. screws = 22 * 7 * 2 = 308.
    expect(run({ length: '8', width: '10' })).toMatchObject({
      boardRows: 22,
      boardsToBuy: 13,
      linearFeet: 208,
      joists: 7,
      screws: 308,
    });
  });

  it('10x12, 12x12, and 12x16 common-size rows match the page table (hand math)', () => {
    // 10 ft run: floor(192/120) = 1. width 144: 26 rows. 26 * 1.10 -> 29 boards.
    // joists = ceil(120/16)+1 = 9. screws = 26 * 9 * 2 = 468.
    expect(run({ length: '10', width: '12' })).toMatchObject({
      boardRows: 26,
      boardsToBuy: 29,
      linearFeet: 464,
      joists: 9,
      screws: 468,
    });
    // 12x16: width 192 in, rows = ceil(192.1875 / 5.6875) = 34.
    // 34 * 1.10 = 37.4, buy 38. joists = 10. screws = 34 * 10 * 2 = 680.
    expect(run({ length: '12', width: '16' })).toMatchObject({
      boardRows: 34,
      boardsToBuy: 38,
      linearFeet: 608,
      joists: 10,
      screws: 680,
    });
  });

  it('20 ft run on 12 ft sticks does not reuse an 8 ft offcut (hand math)', () => {
    // rows = 26. full sticks = 1, remainder 8 ft, offcut 4 ft, which is shorter than 8 ft.
    // 2 sticks per row * 26 = 52. One butt joint per row.
    // joists = 240/16 + 1 = 16. screws = 26 * (16 + 1) * 2 = 884.
    expect(run({
      length: '20',
      boardLength: '12',
      waste: '0',
    })).toMatchObject({
      boardRows: 26,
      boardsToBuy: 52,
      linearFeet: 624,
      joists: 16,
      screws: 884,
    });
  });

  it('18 ft run on 12 ft sticks shares a 6 ft offcut across two rows (hand math)', () => {
    // width 8 ft: rows = ceil(96.1875 / 5.6875) = 17.
    // remainder 6 ft equals the offcut, so 8 pairs use 3 sticks and the last row uses 2.
    // 8 * 3 + 2 = 26. joists = ceil(216/16)+1 = 15. screws = 17 * (15 + 1) * 2 = 544.
    expect(run({
      length: '18',
      width: '8',
      boardLength: '12',
      waste: '0',
    })).toMatchObject({
      boardRows: 17,
      boardsToBuy: 26,
      linearFeet: 312,
      joists: 15,
      screws: 544,
    });
  });

  it('24 ft run on 12 ft sticks is two exact sticks and one joint (hand math)', () => {
    // 26 rows * 2 = 52. joints per row = 1. joists = 288/16 + 1 = 19.
    // screws = 26 * (19 + 1) * 2 = 1040.
    expect(run({
      length: '24',
      boardLength: '12',
      waste: '0',
    })).toMatchObject({
      boardRows: 26,
      boardsToBuy: 52,
      joists: 19,
      screws: 1040,
    });
  });

  it('45 degree composite uses area/pitch and a 12 in Trex limit (hand math)', () => {
    // total board inches = 144 * 144 / 5.6875 = 3645.8901
    // boards = 3645.8901 / 192 = 18.989, round up to 19 at 0% waste.
    // projected width = 144 * sqrt(2) = 203.647, rows = ceil(35.839) = 36.
    // crossings = ceil(3645.8901 / (16 * sqrt(2))) = 162. screws = 324.
    // 2026 Trex: 45° span is 4 in under the 16 in chart, so the limit is 12.
    const result = run({ direction: 'diagonal', waste: '0' });
    expect(result).toMatchObject({
      boardRows: 36,
      boardsToBuy: 19,
      linearFeet: 304,
      joists: 10,
      screws: 324,
      screwsPerSqFt: 2.25,
      spacingLimit: 12,
      inchesOver: 4,
      spacingWarning: 1,
    });
  });

  it('wood spacing limits follow 2021 IRC Table R507.7 (hand math on the table)', () => {
    expect(run({ material: 'fiveQuarter' })).toMatchObject({ spacingLimit: 16, spacingWarning: 0, inchesOver: 0 });
    expect(run({ material: 'fiveQuarter', joistSpacing: '24' })).toMatchObject({
      spacingLimit: 16,
      spacingWarning: 1,
      inchesOver: 8,
    });
    expect(run({ material: 'fiveQuarter', direction: 'diagonal', joistSpacing: '12' })).toMatchObject({
      spacingLimit: 12,
      spacingWarning: 0,
      inchesOver: 0,
    });
    expect(run({ material: 'fiveQuarter', spanType: 'single', joistSpacing: '12' })).toMatchObject({
      spacingLimit: 12,
      spacingWarning: 0,
      threeJoistShort: 0,
    });
    expect(run({ material: 'fiveQuarter', spanType: 'single' })).toMatchObject({
      spacingLimit: 12,
      spacingWarning: 1,
      inchesOver: 4,
    });
    expect(run({ material: 'fiveQuarter', direction: 'diagonal', spanType: 'single', joistSpacing: '12' })).toMatchObject({
      spacingLimit: 8,
      spacingWarning: 1,
      inchesOver: 4,
    });
    expect(run({ material: 'twoBy', joistSpacing: '24' })).toMatchObject({
      spacingLimit: 24,
      spacingWarning: 0,
    });
    expect(run({ material: 'twoBy', direction: 'diagonal', spanType: 'single', joistSpacing: '16' })).toMatchObject({
      spacingLimit: 18,
      spacingWarning: 0,
      inchesOver: 0,
    });
    expect(run({ material: 'twoBy', direction: 'diagonal', spanType: 'single', joistSpacing: '24' })).toMatchObject({
      spacingLimit: 18,
      spacingWarning: 1,
      inchesOver: 6,
    });
  });

  it('composite 45 degree chart of 24 in allows 20 in, and two joists always warn', () => {
    expect(run({ direction: 'diagonal', chartSpan: '24', joistSpacing: '16' })).toMatchObject({
      spacingLimit: 20,
      spacingWarning: 0,
      inchesOver: 0,
    });
    expect(run({ direction: 'diagonal', chartSpan: '24', joistSpacing: '24' })).toMatchObject({
      spacingLimit: 20,
      spacingWarning: 1,
      inchesOver: 4,
    });
    expect(run({ joistSpacing: '12', spanType: 'single' })).toMatchObject({
      spacingLimit: 16,
      inchesOver: 0,
      threeJoistShort: 1,
      spacingWarning: 1,
    });
    expect(run({ material: 'fiveQuarter', sideGap: '0.125' }).gapShort).toBe(0);
    expect(run({ sideGap: '0.125' }).gapShort).toBe(1);
    expect(run({ sideGap: '0.1875' }).gapShort).toBe(0);
  });
});

describe('edge cases', () => {
  it('rejects zero and negative sizes', () => {
    expect(calculate({ ...base, length: '0' }).errors).toHaveProperty('length');
    expect(calculate({ ...base, width: '0' }).errors).toHaveProperty('width');
    expect(calculate({ ...base, length: '-5' }).errors).toHaveProperty('length');
    expect(calculate({ ...base, width: '-1' }).errors).toHaveProperty('width');
    expect(calculate({ ...base, boardWidth: '0' }).errors).toHaveProperty('boardWidth');
    expect(calculate({ ...base, sideGap: '-0.1' }).errors).toHaveProperty('sideGap');
    expect(calculate({ ...base, waste: '-1' }).errors).toHaveProperty('waste');
    expect(calculate({ ...base, screwsPer: '-1' }).errors).toHaveProperty('screwsPer');
  });

  it('rejects very large sizes', () => {
    expect(calculate({ ...base, length: '1e7' }).errors).toHaveProperty('length');
    expect(calculate({ ...base, width: '10000' }).errors).toHaveProperty('width');
    expect(calculate({ ...base, boardWidth: '80' }).errors).toHaveProperty('boardWidth');
  });

  it('rejects empty and non-numeric input', () => {
    expect(calculate({ ...base, length: '' }).errors).toHaveProperty('length');
    expect(calculate({ ...base, width: 'twelve' }).errors).toHaveProperty('width');
    expect(calculate({ ...base, boardWidth: 'wide' }).errors).toHaveProperty('boardWidth');
    expect(calculate({ ...base, sideGap: '' }).errors).toHaveProperty('sideGap');
    expect(calculate({ ...base, waste: 'ten' }).errors).toHaveProperty('waste');
    expect(calculate({ ...base, screwsPer: '' }).errors).toHaveProperty('screwsPer');
    expect(calculate({}).ok).toBe(false);
  });

  it('accepts each numeric boundary and rejects the next step outside', () => {
    expect(calculate({ ...base, length: '4', width: '4' }).ok).toBe(true);
    expect(calculate({ ...base, length: '40', width: '40' }).ok).toBe(true);
    expect(calculate({ ...base, length: '3.999' }).errors).toHaveProperty('length');
    expect(calculate({ ...base, length: '40.001' }).errors).toHaveProperty('length');
    expect(calculate({ ...base, width: '3.999' }).errors).toHaveProperty('width');
    expect(calculate({ ...base, width: '40.001' }).errors).toHaveProperty('width');

    expect(calculate({ ...base, boardWidth: '3' }).ok).toBe(true);
    expect(calculate({ ...base, boardWidth: '8' }).ok).toBe(true);
    expect(calculate({ ...base, boardWidth: '2.999' }).errors).toHaveProperty('boardWidth');
    expect(calculate({ ...base, boardWidth: '8.001' }).errors).toHaveProperty('boardWidth');

    expect(calculate({ ...base, sideGap: '0.0625' }).ok).toBe(true);
    expect(calculate({ ...base, sideGap: '0.5' }).ok).toBe(true);
    expect(calculate({ ...base, sideGap: '0.0624' }).errors).toHaveProperty('sideGap');
    expect(calculate({ ...base, sideGap: '0.5001' }).errors).toHaveProperty('sideGap');

    expect(calculate({ ...base, waste: '0' }).ok).toBe(true);
    expect(calculate({ ...base, waste: '25' }).ok).toBe(true);
    expect(calculate({ ...base, waste: '-0.01' }).errors).toHaveProperty('waste');
    expect(calculate({ ...base, waste: '25.01' }).errors).toHaveProperty('waste');

    expect(calculate({ ...base, screwsPer: '1' }).ok).toBe(true);
    expect(calculate({ ...base, screwsPer: '3' }).ok).toBe(true);
    expect(calculate({ ...base, screwsPer: '2.0' }).ok).toBe(true);
    expect(calculate({ ...base, screwsPer: '0' }).errors).toHaveProperty('screwsPer');
    expect(calculate({ ...base, screwsPer: '4' }).errors).toHaveProperty('screwsPer');
    expect(calculate({ ...base, screwsPer: '1.5' }).errors).toHaveProperty('screwsPer');
  });

  it('rejects select values outside the lists', () => {
    expect(calculate({ ...base, material: 'wood' }).errors).toHaveProperty('material');
    expect(calculate({ ...base, direction: '45' }).errors).toHaveProperty('direction');
    expect(calculate({ ...base, spanType: 'continuous' }).errors).toHaveProperty('spanType');
    expect(calculate({ ...base, boardLength: '14' }).errors).toHaveProperty('boardLength');
    expect(calculate({ ...base, joistSpacing: '18' }).errors).toHaveProperty('joistSpacing');
    expect(calculate({ ...base, chartSpan: '12' }).errors).toHaveProperty('chartSpan');
    expect(calculate({ ...base, chartSpan: '20' }).errors).toHaveProperty('chartSpan');
  });

  it('returns every invalid field at once', () => {
    const errors = calculate({ ...base, length: '', width: '-1', waste: '30' }).errors;
    expect(errors).toHaveProperty('length');
    expect(errors).toHaveProperty('width');
    expect(errors).toHaveProperty('waste');
  });

  it('a 4 ft side at 24 in spacing still has 3 joists, and 13 ft at 16 in has 11', () => {
    expect(run({ length: '4', width: '4', joistSpacing: '24', waste: '0' }).joists).toBe(3);
    expect(run({ length: '13', waste: '0' }).joists).toBe(11);
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
