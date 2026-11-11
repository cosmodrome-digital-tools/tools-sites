// logic.test.js: Vitest tests for logic.js (Stair Stringer Calculator).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate } = logic;
const base = { totalRise: '60', maxRiser: '7.75', tread: '10', nosing: '1', landing: 'no' };
const run = (over = {}) => calculate({ ...base, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};

describe('known answers', () => {
  // page.md worked example. Hand math: 60 / 7.75 = 7.74 -> 8 risers; 60 / 8 = 7.5 in;
  // 7 treads x 10 = 70 in run; sqrt(60^2 + 70^2) = sqrt(8500) = 92.195 in; atan(0.75) = 36.87 deg.
  it('60 in rise, 10 in treads = 8 risers of 7 1/2 in, 7 treads, 70 in run, 92.2 in stringer (page.md worked example)', () => {
    const r = ok();
    expect(r).toMatchObject({ risers: 8, riserHeight: 7.5, treads: 7, totalRun: 70, stringerLength: 92.2, angle: 36.9, boardLength: 8, treadBoard: 11 });
    expect(r).toMatchObject({ riserCheck: 1, treadCheck: 1, uniformityCheck: 1, layoutError: 0, flightOneRisers: null });
  });
  // Hand math: 37.5 / 7.75 = 4.84 -> 5 risers of 7.5; 4 x 10 = 40; sqrt(37.5^2 + 40^2) = 54.83.
  it('37.5 in rise = 5 risers, 40 in run, 54.83 in stringer (hand math)', () => {
    expect(ok({ totalRise: '37.5' })).toMatchObject({ risers: 5, riserHeight: 7.5, treads: 4, totalRun: 40, stringerLength: 54.83 });
  });
  // Hand math: 100 / 7.75 = 12.9 -> 13 risers of 7.6923; 12 x 11 = 132; sqrt(100^2 + 132^2) = 165.60;
  // marked at 123/16 = 7.6875 in, 13 x 7.6875 = 99.9375, so 0.0625 in left over.
  it('100 in rise, 11 in treads = 13 risers of 7.6923 in, 132 in run, 165.6 in stringer, 1/16 in left over (hand math)', () => {
    expect(ok({ totalRise: '100', tread: '11' })).toMatchObject({ risers: 13, riserHeight: 7.6923, treads: 12, totalRun: 132, stringerLength: 165.6, layoutError: 0.063, uniformityCheck: 1 });
  });
  it('page.md table: 6 risers at 7.5 in = 45 in rise, 50 in run, 67.27 in stringer; 12 risers = 142.13 in', () => {
    expect(ok({ totalRise: '45' })).toMatchObject({ risers: 6, totalRun: 50, stringerLength: 67.27, boardLength: 6 });
    expect(ok({ totalRise: '90' })).toMatchObject({ risers: 12, totalRun: 110, stringerLength: 142.13, boardLength: 12 });
  });
  it('page.md table rows match calculate() for 2 to 12 risers', () => {
    const md = readFileSync(new URL('./page.md', import.meta.url), 'utf8');
    for (let n = 2; n <= 12; n++) {
      const r = ok({ totalRise: String(7.5 * n) });
      const row = md.split('\n').find((l) => l.startsWith(`| ${n} |`));
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean).map(Number);
      expect(cells).toEqual([n, 7.5 * n, r.treads, r.totalRun, r.stringerLength, r.boardLength]);
    }
  });
});

describe('landing and code check', () => {
  // 13 risers split 7 + 6; longest flight 7 x 7.6923 = 53.85 rise, 6 x 11 = 66 run, sqrt = 85.18.
  it('landing splits 13 risers into 7 and 6; treads = risers - 2; stringer is for the longer flight (hand math)', () => {
    expect(ok({ totalRise: '100', tread: '11', landing: 'yes' })).toMatchObject({ risers: 13, flightOneRisers: 7, flightTwoRisers: 6, treads: 11, totalRun: 121, stringerLength: 85.18 });
  });
  it('local amendment 8 1/4 in: fewer risers, and the IRC riser line says No', () => {
    const r = ok({ totalRise: '66', maxRiser: '8.25' });
    expect(r.risers).toBe(8);
    expect(r.riserHeight).toBe(8.25);
    expect(r.riserCheck).toBe(0);
  });
  it('tread under 10 in fails the IRC tread line; exactly 10 passes', () => {
    expect(ok({ tread: '9.99' }).treadCheck).toBe(0);
    expect(ok({ tread: '10' }).treadCheck).toBe(1);
  });
  // 109.25 / 7.75 = 14.1 -> 15 risers of 7.2833; marked at 117/16 = 7.3125; 15 x 0.0292 = 0.4375 > 3/8.
  it('flags marking error over 3/8 in (109.25 in rise, 15 risers, 0.438 in left over)', () => {
    expect(ok({ totalRise: '109.25' })).toMatchObject({ risers: 15, uniformityCheck: 0, layoutError: 0.438 });
  });
  it('returns a stairs diagram for the longest flight', () => {
    expect(run().diagram).toMatchObject({ type: 'stairs', risers: 8, riserHeight: 7.5, treadDepth: 10, totalRun: 70, riserLabel: '7 1/2 in' });
  });
});

describe('edge cases', () => {
  it('rejects zero, negative, empty, and non-numeric input on the right field', () => {
    expect(run({ totalRise: '0' }).errors).toHaveProperty('totalRise');
    expect(run({ totalRise: '-5' }).errors).toHaveProperty('totalRise');
    expect(run({ tread: '' }).errors).toHaveProperty('tread');
    expect(run({ maxRiser: 'seven' }).errors).toHaveProperty('maxRiser');
    expect(calculate({}).ok).toBe(false);
  });
  it('total rise bounds: 6 and 200 ok, 5.9 and 200.1 rejected', () => {
    expect(run({ totalRise: '6' }).ok).toBe(true);
    expect(run({ totalRise: '200' }).ok).toBe(true);
    expect(run({ totalRise: '5.9' }).ok).toBe(false);
    expect(run({ totalRise: '200.1' }).ok).toBe(false);
  });
  it('max riser bounds 4 to 9, tread bounds 8 to 14, nosing 0 to 1.5', () => {
    expect(run({ maxRiser: '4' }).ok).toBe(true);
    expect(run({ maxRiser: '3.9' }).errors).toHaveProperty('maxRiser');
    expect(run({ maxRiser: '9.1' }).errors).toHaveProperty('maxRiser');
    expect(run({ tread: '8' }).ok).toBe(true);
    expect(run({ tread: '14.1' }).errors).toHaveProperty('tread');
    expect(run({ nosing: '1.6' }).errors).toHaveProperty('nosing');
    expect(run({ nosing: '0' }).ok).toBe(true);
  });
  it('very large: 200 in rise at a 4 in max riser needs more than 30 risers', () => {
    expect(run({ totalRise: '200', maxRiser: '4' }).errors).toHaveProperty('totalRise');
  });
  it('a landing needs at least two risers', () => {
    expect(run({ totalRise: '6', landing: 'yes' }).errors).toHaveProperty('landing');
    expect(run({ landing: 'maybe' }).errors).toHaveProperty('landing');
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
