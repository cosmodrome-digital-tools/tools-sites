// logic.test.js: Vitest tests for logic.js.
// Required: at least 3 known-answer cases (each with its reference noted: a
// trusted calculator or hand math) PLUS edge cases: zero, negative, very
// large, empty, non-numeric, and the boundary values of every input.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate, referenceTable, shingleLink, slopeBand } = logic;
const ok = (raw) => {
  const r = calculate(raw);
  expect(r.ok).toBe(true);
  return r.results;
};
const rr = (rise, run, extra = {}) => ({ mode: 'riseRun', rise: String(rise), run: String(run), ...extra });
const errs = (raw) => {
  const r = calculate(raw);
  expect(r.ok).toBe(false);
  return r.errors;
};

describe('known answers', () => {
  it('6 in rise over 12 in run = 6/12, 26.57 deg, 50%, M 1.118, 13.42 in (hand math: atan(0.5) = 26.565 deg; sqrt(1.25) = 1.1180; 12 x 1.1180 = 13.416)', () => {
    expect(ok(rr(6, 12))).toEqual({ pitch: 6, angle: 26.57, percent: 50, multiplier: 1.118, rafterPerFoot: 13.42, roofArea: null });
  });

  it('page.md worked example: 7.5 in over 18 in, 1,680 sq ft footprint = 5/12, 22.62 deg, 41.7%, M 1.083, 13.00 in, 1,820 sq ft (hand math: 12 x 7.5 / 18 = 5; 5-12-13 triangle so M = 13/12; 1680 x 13/12 = 1820)', () => {
    expect(ok(rr(7.5, 18, { footprint: '1680' }))).toEqual({
      pitch: 5, angle: 22.62, percent: 41.7, multiplier: 1.083, rafterPerFoot: 13, roofArea: 1820,
    });
  });

  it('12/12 = 45 deg, 100%, M 1.414 (hand math: atan(1) = 45 deg; sqrt(2) = 1.41421)', () => {
    expect(ok({ mode: 'pitch', pitchX: '12' })).toMatchObject({ pitch: 12, angle: 45, percent: 100, multiplier: 1.414, rafterPerFoot: 16.97 });
  });

  it('angle mode 30 deg = 6.93/12, 57.7%, M 1.155 (hand math: 12 x tan 30 = 6.928; 1/cos 30 = 1.1547)', () => {
    expect(ok({ mode: 'angle', angle: '30' })).toMatchObject({ pitch: 6.93, angle: 30, percent: 57.7, multiplier: 1.155, rafterPerFoot: 13.86 });
  });

  it('4/12 with 2,000 sq ft footprint = 18.43 deg, 33.3%, 2,108.2 sq ft (hand math: sqrt(1 + 1/9) = 1.05409; 2000 x 1.05409 = 2108.19)', () => {
    expect(ok({ mode: 'pitch', pitchX: '4', footprint: '2000' })).toMatchObject({ angle: 18.43, percent: 33.3, multiplier: 1.054, roofArea: 2108.2 });
  });

  it('3 in over 8 in = 4.5/12 (hand math: 12 x 3 / 8 = 4.5)', () => {
    expect(ok(rr(3, 8)).pitch).toBe(4.5);
  });

  it('page.md tip: 2,000 sq ft at 6/12 is about 2,236 sq ft (hand math: 2000 x 1.118034)', () => {
    expect(ok({ mode: 'pitch', pitchX: '6', footprint: '2000' }).roofArea).toBe(2236.1);
  });

  it('all three modes agree for the same roof', () => {
    const a = ok(rr(9, 12));
    const b = ok({ mode: 'pitch', pitchX: '9' });
    const c = ok({ mode: 'angle', angle: '36.869897645844' });
    expect(b).toEqual(a);
    expect(c).toEqual(a);
  });
});

describe('reference table and chart', () => {
  it('has 1/12 to 12/12 with known values (hand math)', () => {
    const t = referenceTable();
    expect(t).toHaveLength(12);
    expect(t[0]).toEqual({ pitch: 1, angle: 4.76, percent: 8.3, multiplier: 1.003 });
    expect(t[3]).toEqual({ pitch: 4, angle: 18.43, percent: 33.3, multiplier: 1.054 });
    expect(t[11]).toEqual({ pitch: 12, angle: 45, percent: 100, multiplier: 1.414 });
  });

  it('page.md reference chart matches referenceTable() row for row', () => {
    const md = readFileSync(new URL('./page.md', import.meta.url), 'utf8');
    for (const r of referenceTable()) {
      const row = `| ${r.pitch}/12 | ${r.angle.toFixed(2)}° | ${r.percent.toFixed(1)}% | ${r.multiplier.toFixed(3)} |`;
      expect(md, row).toContain(row);
    }
  });

  it('chart is the angle at 1/12 to 12/12, the same for any input', () => {
    const chart = calculate(rr(6, 12)).chart;
    expect(chart).toHaveLength(12);
    expect(chart[0]).toEqual({ label: '1', value: 4.76 });
    expect(chart[11]).toEqual({ label: '12', value: 45 });
    expect(calculate({ mode: 'pitch', pitchX: '0' }).chart).toEqual(chart);
  });
});

describe('IRC 2024 asphalt shingle slope note', () => {
  it('bands: below 2/12, 2/12 up to 4/12, 4/12 and steeper', () => {
    expect(slopeBand(0)).toBe('belowMin');
    expect(slopeBand(1.99)).toBe('belowMin');
    expect(slopeBand(2)).toBe('doubleUnderlayment');
    expect(slopeBand(3.99)).toBe('doubleUnderlayment');
    expect(slopeBand(4)).toBe('standard');
    expect(slopeBand(24)).toBe('standard');
  });

  it('calculate returns the band and its note text', () => {
    const low = calculate({ mode: 'pitch', pitchX: '1.5' });
    expect(low.slopeBand).toBe('belowMin');
    expect(low.slopeNote).toMatch(/R905\.2\.2/);
    const mid = calculate(rr(3, 12));
    expect(mid.slopeBand).toBe('doubleUnderlayment');
    expect(mid.slopeNote).toMatch(/two layers/);
    expect(calculate(rr(6, 12)).slopeBand).toBe('standard');
  });

  it('an angle that rounds to exactly 4/12 (18.43 deg) counts as 4/12', () => {
    expect(calculate({ mode: 'angle', angle: '18.43' }).slopeBand).toBe('standard');
  });
});

describe('Shingle Calculator link (?pitch=)', () => {
  it('carries the pitch rounded to 2 decimals', () => {
    expect(calculate(rr(6, 12)).shingleHref).toBe('/shingle-calculator/?pitch=6');
    expect(calculate(rr(7.5, 18)).shingleHref).toBe('/shingle-calculator/?pitch=5');
    expect(calculate({ mode: 'angle', angle: '30' }).shingleHref).toBe('/shingle-calculator/?pitch=6.93');
    expect(calculate({ mode: 'pitch', pitchX: '2' }).shingleHref).toBe('/shingle-calculator/?pitch=2');
  });
  it('is null below 2/12, where asphalt shingles are not allowed', () => {
    expect(calculate({ mode: 'pitch', pitchX: '1.99' }).shingleHref).toBeNull();
    expect(calculate({ mode: 'angle', angle: '8' }).shingleHref).toBeNull();
    expect(shingleLink(0)).toBeNull();
    expect(shingleLink(Number.NaN)).toBeNull();
  });
  it('18.43 degrees (3.9993/12) hands over 4, the same band both tools use', () => {
    expect(calculate({ mode: 'angle', angle: '18.43' }).shingleHref).toBe('/shingle-calculator/?pitch=4');
  });
});

describe('edge cases', () => {
  it('zero rise, zero angle, and zero pitch are a flat roof', () => {
    const flat = { pitch: 0, angle: 0, percent: 0, multiplier: 1, rafterPerFoot: 12, roofArea: null };
    expect(ok(rr(0, 12))).toEqual(flat);
    expect(ok({ mode: 'angle', angle: '0' })).toEqual(flat);
    expect(ok({ mode: 'pitch', pitchX: '0' })).toEqual(flat);
  });

  it('rejects a zero or negative run', () => {
    expect(errs(rr(6, 0))).toHaveProperty('run');
    expect(errs(rr(6, -12))).toHaveProperty('run');
  });

  it('rejects negative rise, angle, pitch, and footprint', () => {
    expect(errs(rr(-1, 12))).toHaveProperty('rise');
    expect(errs({ mode: 'angle', angle: '-5' })).toHaveProperty('angle');
    expect(errs({ mode: 'pitch', pitchX: '-1' })).toHaveProperty('pitchX');
    expect(errs(rr(6, 12, { footprint: '-10' }))).toHaveProperty('footprint');
  });

  it('rejects very large values', () => {
    expect(errs(rr('1e9', 12))).toHaveProperty('rise');
    expect(errs({ mode: 'pitch', pitchX: '1e9' })).toHaveProperty('pitchX');
    expect(errs(rr(6, 12, { footprint: '1e9' }))).toHaveProperty('footprint');
  });

  it('rejects empty and non-numeric input for the active mode', () => {
    expect(errs(rr('', 12))).toHaveProperty('rise');
    expect(errs(rr(6, 'twelve'))).toHaveProperty('run');
    expect(errs({ mode: 'angle', angle: '' })).toHaveProperty('angle');
    expect(errs({ mode: 'pitch', pitchX: 'abc' })).toHaveProperty('pitchX');
    expect(errs(rr(6, 12, { footprint: 'lots' }))).toHaveProperty('footprint');
  });

  it('empty object defaults to rise-and-run mode and asks for rise and run', () => {
    const e = errs({});
    expect(e).toHaveProperty('rise');
    expect(e).toHaveProperty('run');
  });

  it('ignores fields for other modes (hidden fields never block results)', () => {
    expect(ok({ mode: 'pitch', pitchX: '6', rise: 'junk', run: '0', angle: '-9' }).pitch).toBe(6);
    expect(ok({ mode: 'angle', angle: '45', pitchX: '999' }).pitch).toBe(12);
  });

  it('rejects an unknown mode', () => {
    expect(errs({ mode: 'slope', rise: '6', run: '12' })).toHaveProperty('mode');
  });

  it('blank or 0 footprint means no roof area', () => {
    expect(ok(rr(6, 12, { footprint: '' })).roofArea).toBeNull();
    expect(ok(rr(6, 12, { footprint: '0' })).roofArea).toBeNull();
  });

  it('accepts commas in footprint', () => {
    expect(ok(rr(7.5, 18, { footprint: '1,680' })).roofArea).toBe(1820);
  });
});

describe('boundaries (just inside and just outside each limit)', () => {
  it('rise 0 to 36 in', () => {
    expect(calculate(rr(36, 12)).ok).toBe(true);
    expect(errs(rr(36.01, 12))).toHaveProperty('rise');
    expect(calculate(rr(0, 12)).ok).toBe(true);
    expect(errs(rr(-0.01, 12))).toHaveProperty('rise');
  });

  it('run 1 to 24 in', () => {
    expect(calculate(rr(6, 24)).ok).toBe(true);
    expect(errs(rr(6, 24.01))).toHaveProperty('run');
    expect(calculate(rr(1, 1)).ok).toBe(true);
    expect(errs(rr(1, 0.99))).toHaveProperty('run');
    expect(errs(rr(6, 0))).toHaveProperty('run');
  });

  it('angle 0 to 75 degrees', () => {
    expect(ok({ mode: 'angle', angle: '75' }).pitch).toBe(44.78);
    expect(errs({ mode: 'angle', angle: '75.01' })).toHaveProperty('angle');
    expect(errs({ mode: 'angle', angle: '-0.01' })).toHaveProperty('angle');
  });

  it('pitch 0 to 24', () => {
    expect(ok({ mode: 'pitch', pitchX: '24' })).toMatchObject({ angle: 63.43, percent: 200, multiplier: 2.236 });
    expect(errs({ mode: 'pitch', pitchX: '24.01' })).toHaveProperty('pitchX');
  });

  it('footprint 0 to 20,000 sq ft', () => {
    expect(ok({ mode: 'pitch', pitchX: '12', footprint: '20000' }).roofArea).toBe(28284.3);
    expect(errs({ mode: 'pitch', pitchX: '12', footprint: '20000.1' })).toHaveProperty('footprint');
  });

  it('rise and run steeper than 75 degrees (44.78/12) is rejected on rise', () => {
    // 36 in over 9 in = 48/12 (75.96 deg): too steep. 36 over 9.7 = 44.54/12 (74.9 deg): allowed.
    expect(errs(rr(36, 9))).toHaveProperty('rise');
    expect(errs(rr(36, 1))).toHaveProperty('rise');
    expect(ok(rr(36, 9.7)).pitch).toBe(44.54);
    expect(ok(rr(36, 24)).pitch).toBe(18);
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
