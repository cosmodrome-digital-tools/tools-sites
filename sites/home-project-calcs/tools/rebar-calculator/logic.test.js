// logic.test.js: Vitest tests for logic.js.
// Known answers are hand math, written out in each test. Unit weights are the
// ASTM A615 / CRSI values in meta.json "sources".
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate, countAcross, sticksForRuns } = logic;

const DEFAULTS = {
  length: '20',
  width: '20',
  barSize: '4',
  spacing: '18',
  cover: '3',
  stickLength: '20',
  lap: '20',
  chairSpacing: '48',
  waste: '5',
};
const ok = (overrides = {}) => {
  const r = calculate({ ...DEFAULTS, ...overrides });
  expect(r.ok).toBe(true);
  return r.results;
};
const errorsFor = (overrides) => {
  const r = calculate({ ...DEFAULTS, ...overrides });
  expect(r.ok).toBe(false);
  return r.errors;
};

describe('known answers', () => {
  // Hand math: span = 20 x 12 - 2 x 3 = 234 in. Bars = ceil(234 / 18) + 1 = 14
  // each way, cut 234 in = 19.5 ft, one per 20 ft stick (no lap needed).
  // Sticks 14 + 14 = 28; x 1.05 = 29.4 -> 30. Weight 30 x 20 x 0.668 = 400.8 lb.
  // Ties 14 x 14 = 196. Chairs: ceil(234 / 48) + 1 = 6 per row, 6 x 6 = 36.
  // Linear feet in place 28 x 19.5 = 546.
  it('defaults: 20 x 20 ft, #4 at 18 in, 20 ft sticks, 5% waste', () => {
    expect(ok()).toEqual({
      sticksToBuy: 30,
      stickLength: 20,
      weightToBuy: 400.8,
      barsAlongLength: 14,
      cutLengthAlongLength: 19.5,
      sticksAlongLength: 14,
      barsAlongWidth: 14,
      cutLengthAlongWidth: 19.5,
      sticksAlongWidth: 14,
      lapSplices: 0,
      linearFeet: 546,
      sticksBeforeWaste: 28,
      tiePoints: 196,
      chairs: 36,
      unitWeight: 0.668,
    });
  });

  // Worked example in page.md. Hand math:
  // Lengthwise: span across width 144 - 6 = 138 in -> ceil(138/18) + 1 = 9 bars,
  //   cut 288 - 6 = 282 in (23.5 ft). Sticks per run ceil((282-20)/(240-20)) = 2,
  //   lapped 282 + 20 = 302 in; 1 full stick + 62 in piece; 3 pieces per stick
  //   -> 9 + ceil(9/3) = 12 sticks, 9 lap splices.
  // Widthwise: ceil(282/18) + 1 = 17 bars, cut 138 in (11.5 ft), 1 per stick -> 17.
  // 12 + 17 = 29; x 1.05 = 30.45 -> 31. Weight 31 x 20 x 0.668 = 414.16 -> 414.2 lb.
  // Ties 9 x 17 = 153. Chairs (ceil(282/48)+1) x (ceil(138/48)+1) = 7 x 4 = 28.
  // Linear ft 9 x 302/12 + 17 x 11.5 = 226.5 + 195.5 = 422.
  it('worked example: 24 x 12 ft slab needs lap splices on the long bars', () => {
    expect(ok({ length: '24', width: '12' })).toEqual({
      sticksToBuy: 31,
      stickLength: 20,
      weightToBuy: 414.2,
      barsAlongLength: 9,
      cutLengthAlongLength: 23.5,
      sticksAlongLength: 12,
      barsAlongWidth: 17,
      cutLengthAlongWidth: 11.5,
      sticksAlongWidth: 17,
      lapSplices: 9,
      linearFeet: 422,
      sticksBeforeWaste: 29,
      tiePoints: 153,
      chairs: 28,
      unitWeight: 0.668,
    });
  });

  // Hand math: span 120 - 4 = 116 in -> ceil(116/12) + 1 = 11 bars each way,
  // cut 116 in (9.67 ft), one per 10 ft stick -> 22 sticks, 0% waste -> 22.
  // Weight 22 x 10 x 0.376 = 82.72 -> 82.7 lb. Ties 121. Chairs (ceil(116/36)+1)^2 = 25.
  it('10 x 10 ft, #3 at 12 in, 2 in cover, 10 ft sticks, no lap, 0% waste', () => {
    const r = ok({ length: '10', width: '10', barSize: '3', spacing: '12', cover: '2', stickLength: '10', lap: '0', chairSpacing: '36', waste: '0' });
    expect(r.sticksToBuy).toBe(22);
    expect(r.weightToBuy).toBe(82.7);
    expect(r.cutLengthAlongLength).toBe(9.67);
    expect(r.tiePoints).toBe(121);
    expect(r.chairs).toBe(25);
    expect(r.linearFeet).toBe(212.7);
    expect(r.unitWeight).toBe(0.376);
  });

  // Hand math: 6 x 4 ft pad, #5 at 12 in, 3 in cover. Lengthwise: ceil(42/12)+1 = 5 bars
  // of 66 in, 3 per 20 ft stick -> 2 sticks. Widthwise: ceil(66/12)+1 = 7 bars of 42 in,
  // 5 per stick -> 2 sticks. Total 4; weight 4 x 20 x 1.043 = 83.44 -> 83.4 lb.
  it('short bars share sticks: 6 x 4 ft pad, #5 at 12 in', () => {
    const r = ok({ length: '6', width: '4', barSize: '5', spacing: '12', waste: '0' });
    expect(r.sticksAlongLength).toBe(2);
    expect(r.sticksAlongWidth).toBe(2);
    expect(r.sticksToBuy).toBe(4);
    expect(r.weightToBuy).toBe(83.4);
  });

  // Hand math: 100 x 2 ft footing, 24 in lap. Lengthwise: ceil(18/12)+1 = 3 bars of
  // 1194 in; sticks per run ceil(1170/216) = 6, lapped 1314 in, 5 full + 114 in piece,
  // 2 pieces per stick -> 15 + 2 = 17 sticks, 15 splices. Widthwise: ceil(1194/12)+1 = 101
  // bars of 18 in, 13 per stick -> 8 sticks. Total 25. #6: 25 x 20 x 1.502 = 751 lb.
  it('long footing: 100 x 2 ft, #6 at 12 in, 24 in lap', () => {
    const r = ok({ length: '100', width: '2', barSize: '6', spacing: '12', lap: '24', waste: '0' });
    expect(r.sticksAlongLength).toBe(17);
    expect(r.lapSplices).toBe(15);
    expect(r.sticksAlongWidth).toBe(8);
    expect(r.sticksToBuy).toBe(25);
    expect(r.weightToBuy).toBe(751);
    expect(r.tiePoints).toBe(303);
  });
});

describe('helpers', () => {
  it('countAcross never lets the gap exceed the spacing', () => {
    expect(countAcross(36, 18)).toBe(3); // exact fit
    expect(countAcross(37, 18)).toBe(4); // just over adds a bar
  });
  it('sticksForRuns: a run equal to one stick needs no splice', () => {
    expect(sticksForRuns(4, 240, 240, 20)).toEqual({ sticks: 4, splices: 0, lappedIn: 240 });
  });
  it('sticksForRuns: one inch longer than a stick needs a splice', () => {
    expect(sticksForRuns(1, 241, 240, 20)).toEqual({ sticks: 2, splices: 1, lappedIn: 261 });
  });
  it('sticksForRuns: a run shorter than the lap still uses one piece', () => {
    expect(sticksForRuns(2, 10, 240, 20).sticks).toBe(1);
  });
});

describe('chart', () => {
  it('shows sticks to buy at 12, 16, 18, 24, and 36 in, matching the result at 18 in', () => {
    const r = calculate(DEFAULTS);
    expect(r.chart.map((d) => d.label)).toEqual(['12 in', '16 in', '18 in', '24 in', '36 in']);
    expect(r.chart[2].value).toBe(r.results.sticksToBuy);
    // Wider spacing never needs more sticks.
    for (let i = 1; i < r.chart.length; i++) expect(r.chart[i].value).toBeLessThanOrEqual(r.chart[i - 1].value);
  });
});

describe('edge cases', () => {
  it('rejects zero and negative sizes', () => {
    expect(errorsFor({ length: '0' })).toHaveProperty('length');
    expect(errorsFor({ width: '-5' })).toHaveProperty('width');
    expect(errorsFor({ spacing: '0' })).toHaveProperty('spacing');
    expect(errorsFor({ waste: '-1' })).toHaveProperty('waste');
    expect(errorsFor({ lap: '-1' })).toHaveProperty('lap');
  });
  it('rejects very large values', () => {
    expect(errorsFor({ length: '1e7' })).toHaveProperty('length');
    expect(errorsFor({ stickLength: '1000' })).toHaveProperty('stickLength');
  });
  it('rejects empty and non-numeric input', () => {
    expect(errorsFor({ length: '' })).toHaveProperty('length');
    expect(errorsFor({ spacing: 'eighteen' })).toHaveProperty('spacing');
    expect(calculate({}).ok).toBe(false);
  });
  it('rejects an unknown bar size and accepts "#4" style input', () => {
    expect(errorsFor({ barSize: '7' })).toHaveProperty('barSize');
    expect(errorsFor({ barSize: 'abc' })).toHaveProperty('barSize');
    expect(ok({ barSize: '#4' }).unitWeight).toBe(0.668);
    expect(ok({ barSize: '5' }).unitWeight).toBe(1.043);
    expect(ok({ barSize: '6' }).unitWeight).toBe(1.502);
  });
  it('rejects edge cover that uses up the whole slab', () => {
    // 1 ft = 12 in; 2 x 6 in cover leaves nothing.
    expect(errorsFor({ width: '1', cover: '6' })).toHaveProperty('cover');
    expect(ok({ width: '1', cover: '5.9' }).barsAlongLength).toBe(2);
  });
  it('accepts a very large (max) slab', () => {
    const r = ok({ length: '100', width: '100', spacing: '6', waste: '20' });
    expect(Number.isFinite(r.sticksToBuy)).toBe(true);
    expect(r.sticksToBuy).toBeGreaterThan(0);
  });

  const BOUNDARIES = [
    ['length', '1', '100', '0.99', '100.1'],
    ['width', '1', '100', '0.99', '100.1'],
    ['spacing', '6', '36', '5.9', '36.1'],
    ['cover', '1', '6', '0.9', '6.1'],
    ['stickLength', '10', '40', '9.9', '40.1'],
    ['lap', '0', '60', '-0.1', '60.1'],
    ['chairSpacing', '12', '72', '11.9', '72.1'],
    ['waste', '0', '20', '-0.1', '20.1'],
  ];
  it.each(BOUNDARIES)('%s accepts %s and %s, rejects %s and %s', (name, lo, hi, below, above) => {
    // cover boundary tests need a slab big enough for 6 in cover; defaults are 20 ft.
    expect(calculate({ ...DEFAULTS, [name]: lo }).ok).toBe(true);
    expect(calculate({ ...DEFAULTS, [name]: hi }).ok).toBe(true);
    expect(errorsFor({ [name]: below })).toHaveProperty(name);
    expect(errorsFor({ [name]: above })).toHaveProperty(name);
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
