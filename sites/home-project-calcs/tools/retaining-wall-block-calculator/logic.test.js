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

const base = (over = {}) => ({
  wallShape: 'straight',
  length: '20',
  exposedHeight: '24',
  buriedDepth: '6',
  blockFaceLength: '16',
  blockFaceHeight: '6',
  blockDepth: '10',
  capLength: '16',
  surcharge: 'off',
  blockWaste: '5',
  density: '1.40',
  ...over,
});

describe('known answers', () => {
  it('opening straight wall: 79 blocks, 0.68 pad yd, 1.86 drainage yd (hand math, worked example)', () => {
    // 5 courses × 15 blocks = 75; × 1.05 = 78.75 → 79. Caps 15.
    // Pad 20 × 22/12 × 0.5 = 18.333… ft³ = 0.67901… yd³ → 0.68. × 1.40 = 0.9506… t → 0.96.
    // Drainage 20 × 2.5 = 50 ft³ = 1.85185… yd³ → 1.86. Built exposed 24 ≤ 48.
    const r = ok(base());
    expect(r).toMatchObject({
      courses: 5,
      stackHeight: 30,
      builtExposed: 24,
      blocksPerCourse: 15,
      blocksToBuy: 79,
      capsToBuy: 15,
      padYards: 0.68,
      padTons: 0.96,
      drainageYards: 1.86,
      drainpipeFt: 20,
      citedLimitIn: 48,
      inchesOver: 0,
      engineerCheck: 0,
    });
    expect(calculate(base()).chart).toEqual([
      { label: 'Blocks', value: 79 },
      { label: 'Caps', value: 15 },
    ]);
  });

  it('27 ft wall, 12 in block depth, 0% waste: pad is 1 yd³ and drainage is 2 yd³ (hand math)', () => {
    // Pad ft³ = 27 × (12+12)/12 × 0.5 = 27. Drainage = 27 × 2 ft stack = 54 ft³ = 2 yd³.
    // Blocks 27 × 4 courses = 108. Caps 27. Tons 1 × 1.40 = 1.40.
    expect(ok(base({
      length: '27',
      exposedHeight: '18',
      blockFaceLength: '12',
      blockDepth: '12',
      capLength: '12',
      blockWaste: '0',
    }))).toMatchObject({
      courses: 4,
      blocksPerCourse: 27,
      blocksToBuy: 108,
      capsToBuy: 27,
      padYards: 1,
      padTons: 1.4,
      drainageYards: 2,
      drainpipeFt: 27,
      builtExposed: 18,
      engineerCheck: 0,
    });
  });

  it('4 ft inside circle, exposed 12 in: 32 blocks and 18 ft of pipe (hand math with π)', () => {
    // Inside run = π × 48 in ≈ 150.796. ÷ 16 → 10 blocks and 10 caps. 3 courses.
    // 30 × 1.05 = 31.5 → 32 blocks. Back radius = 2 + 10/12. Pipe = 2π × that ≈ 17.80 → 18 ft.
    // Pad ≈ 0.5155 yd³ → 0.52. × 1.40 ≈ 0.7217 t → 0.73. Drainage ≈ 1.1636 yd³ → 1.17.
    expect(ok(base({
      wallShape: 'circle',
      length: '4',
      exposedHeight: '12',
    }))).toMatchObject({
      courses: 3,
      stackHeight: 18,
      builtExposed: 12,
      blocksPerCourse: 10,
      blocksToBuy: 32,
      capsToBuy: 10,
      padYards: 0.52,
      padTons: 0.73,
      drainageYards: 1.17,
      drainpipeFt: 18,
      engineerCheck: 0,
    });
  });

  it('40 ft straight run doubles the opening wall (hand math)', () => {
    // 30 blocks × 5 courses = 150; × 1.05 = 157.5 → 158. Drainage 100 ft³ → 3.71 yd³.
    expect(ok(base({ length: '40' }))).toMatchObject({
      blocksPerCourse: 30,
      blocksToBuy: 158,
      capsToBuy: 30,
      padYards: 1.36,
      padTons: 1.91,
      drainageYards: 3.71,
      drainpipeFt: 40,
      courses: 5,
    });
  });

  it('exposed 25 in rounds up to 6 courses and 95 blocks (hand math)', () => {
    // 31 / 6 → 6 courses, stack 36, built exposed 30. 90 × 1.05 = 94.5 → 95.
    // Drainage 60 ft³ → 2.23 yd³. Pad is unchanged.
    expect(ok(base({ exposedHeight: '25' }))).toMatchObject({
      courses: 6,
      stackHeight: 36,
      builtExposed: 30,
      blocksToBuy: 95,
      capsToBuy: 15,
      drainageYards: 2.23,
      padYards: 0.68,
      engineerCheck: 0,
    });
  });

  it('10 ft run, 16 in face, 5% waste, cap 10 in: 34 blocks and 12 caps (hand math)', () => {
    // 120 / 16 → 8 per course. 4 courses. 32 × 1.05 = 33.6 → 34. Caps 120 / 10 → 12.
    expect(ok(base({
      length: '10',
      exposedHeight: '20',
      buriedDepth: '4',
      capLength: '10',
      density: '1',
    }))).toMatchObject({
      courses: 4,
      blocksPerCourse: 8,
      blocksToBuy: 34,
      capsToBuy: 12,
      builtExposed: 20,
      padYards: 0.34,
      padTons: 0.34,
      drainageYards: 0.75,
      drainpipeFt: 10,
    });
  });
});

describe('height check from the 2015 R404.4 excerpt', () => {
  it('48 in of stack exposure with surcharge off stays at 0 (not in excess of 48)', () => {
    expect(ok(base({ exposedHeight: '48' }))).toMatchObject({
      builtExposed: 48,
      citedLimitIn: 48,
      inchesOver: 0,
      engineerCheck: 0,
      courses: 9,
      blocksToBuy: 142,
    });
  });

  it('54 in of stack exposure with surcharge off is 6 in over, flag 1', () => {
    expect(ok(base({ exposedHeight: '54' }))).toMatchObject({
      builtExposed: 54,
      citedLimitIn: 48,
      inchesOver: 6,
      engineerCheck: 1,
      courses: 10,
      blocksToBuy: 158,
    });
  });

  it('surcharge on at a 24 in stack stays at 0 (not exceeding 24)', () => {
    expect(ok(base({ surcharge: 'on' }))).toMatchObject({
      builtExposed: 24,
      citedLimitIn: 24,
      inchesOver: 0,
      engineerCheck: 0,
      blocksToBuy: 79,
    });
  });

  it('surcharge on at a 30 in stack is 6 in over, flag 1', () => {
    expect(ok(base({ exposedHeight: '30', surcharge: 'on' }))).toMatchObject({
      builtExposed: 30,
      citedLimitIn: 24,
      inchesOver: 6,
      engineerCheck: 1,
      courses: 6,
      blocksToBuy: 95,
      drainageYards: 2.23,
    });
  });

  it('typed 46 in with 8 in blocks builds a 50 in face and turns the flag on', () => {
    // (46 + 6) / 8 = 6.5 → 7 courses. Stack 56. Built exposed 50. Over 48 by 2 in.
    // 15 × 7 × 1.05 = 110.25 → 111 blocks.
    expect(ok(base({ exposedHeight: '46', blockFaceHeight: '8' }))).toMatchObject({
      courses: 7,
      stackHeight: 56,
      builtExposed: 50,
      inchesOver: 2,
      engineerCheck: 1,
      blocksToBuy: 111,
      citedLimitIn: 48,
    });
  });
});

describe('edge cases', () => {
  it('rejects zero and negative values', () => {
    expect(calculate(base({ length: '0' })).errors).toHaveProperty('length');
    expect(calculate(base({ length: '-4' })).errors).toHaveProperty('length');
    expect(calculate(base({ exposedHeight: '0' })).errors).toHaveProperty('exposedHeight');
    expect(calculate(base({ buriedDepth: '-1' })).errors).toHaveProperty('buriedDepth');
    expect(calculate(base({ blockWaste: '-0.1' })).errors).toHaveProperty('blockWaste');
    expect(calculate(base({ density: '0' })).errors).toHaveProperty('density');
  });

  it('rejects empty and non-numeric input', () => {
    expect(calculate(base({ length: '' })).errors).toHaveProperty('length');
    expect(calculate(base({ exposedHeight: 'tall' })).errors).toHaveProperty('exposedHeight');
    expect(calculate(base({ blockFaceLength: '16 in' })).errors).toHaveProperty('blockFaceLength');
    expect(calculate(base({ density: 'heavy' })).errors).toHaveProperty('density');
    expect(calculate(base({ capLength: '' })).errors).toHaveProperty('capLength');
    const all = calculate({});
    expect(all.ok).toBe(false);
    expect(all.errors).toHaveProperty('wallShape');
    expect(all.errors).toHaveProperty('length');
    expect(all.errors).toHaveProperty('surcharge');
    expect(all.errors).toHaveProperty('blockWaste');
  });

  it('rejects a very large length and accepts the top of the range', () => {
    expect(calculate(base({ length: '1e7' })).errors).toHaveProperty('length');
    expect(calculate(base({ length: '10000' })).errors).toHaveProperty('length');
    expect(ok(base({ length: '200' })).blocksPerCourse).toBe(150);
  });

  it('accepts each minimum and maximum and rejects the next step outside', () => {
    expect(calculate(base({ length: '2' })).ok).toBe(true);
    expect(calculate(base({ length: '200' })).ok).toBe(true);
    expect(calculate(base({ length: '1.99' })).ok).toBe(false);
    expect(calculate(base({ length: '200.01' })).ok).toBe(false);

    expect(calculate(base({ exposedHeight: '6' })).ok).toBe(true);
    expect(calculate(base({ exposedHeight: '96' })).ok).toBe(true);
    expect(calculate(base({ exposedHeight: '5.99' })).errors).toHaveProperty('exposedHeight');
    expect(calculate(base({ exposedHeight: '96.01' })).errors).toHaveProperty('exposedHeight');

    expect(calculate(base({ buriedDepth: '4' })).ok).toBe(true);
    expect(calculate(base({ buriedDepth: '12' })).ok).toBe(true);
    expect(calculate(base({ buriedDepth: '3.99' })).errors).toHaveProperty('buriedDepth');
    expect(calculate(base({ buriedDepth: '12.01' })).errors).toHaveProperty('buriedDepth');

    expect(calculate(base({ blockFaceLength: '6' })).ok).toBe(true);
    expect(calculate(base({ blockFaceLength: '24' })).ok).toBe(true);
    expect(calculate(base({ blockFaceLength: '5.99' })).errors).toHaveProperty('blockFaceLength');
    expect(calculate(base({ blockFaceLength: '24.01' })).errors).toHaveProperty('blockFaceLength');

    expect(calculate(base({ blockFaceHeight: '3' })).ok).toBe(true);
    expect(calculate(base({ blockFaceHeight: '12' })).ok).toBe(true);
    expect(calculate(base({ blockFaceHeight: '2.99' })).errors).toHaveProperty('blockFaceHeight');
    expect(calculate(base({ blockFaceHeight: '12.01' })).errors).toHaveProperty('blockFaceHeight');

    expect(calculate(base({ blockDepth: '6' })).ok).toBe(true);
    expect(calculate(base({ blockDepth: '18' })).ok).toBe(true);
    expect(calculate(base({ blockDepth: '5.99' })).errors).toHaveProperty('blockDepth');
    expect(calculate(base({ blockDepth: '18.01' })).errors).toHaveProperty('blockDepth');

    expect(calculate(base({ capLength: '6' })).ok).toBe(true);
    expect(calculate(base({ capLength: '24' })).ok).toBe(true);
    expect(calculate(base({ capLength: '5.99' })).errors).toHaveProperty('capLength');
    expect(calculate(base({ capLength: '24.01' })).errors).toHaveProperty('capLength');

    expect(calculate(base({ blockWaste: '0' })).ok).toBe(true);
    expect(calculate(base({ blockWaste: '15' })).ok).toBe(true);
    expect(calculate(base({ blockWaste: '-0.01' })).errors).toHaveProperty('blockWaste');
    expect(calculate(base({ blockWaste: '15.01' })).errors).toHaveProperty('blockWaste');

    expect(calculate(base({ density: '1' })).ok).toBe(true);
    expect(calculate(base({ density: '2' })).ok).toBe(true);
    expect(calculate(base({ density: '0.99' })).errors).toHaveProperty('density');
    expect(calculate(base({ density: '2.01' })).errors).toHaveProperty('density');
  });

  it('rejects an unknown shape or surcharge and trims a valid choice', () => {
    expect(calculate(base({ wallShape: 'curve' })).errors).toHaveProperty('wallShape');
    expect(calculate(base({ surcharge: 'maybe' })).errors).toHaveProperty('surcharge');
    expect(ok(base({ wallShape: ' circle ', surcharge: ' on ' })).engineerCheck).toBe(0);
  });

  it('accepts a comma in a number and a tall wall still returns a count', () => {
    expect(ok(base({ length: '20' })).blocksToBuy).toBe(79);
    expect(calculate(base({ length: '1,000' })).errors).toHaveProperty('length');
    const tall = ok(base({
      length: '200',
      exposedHeight: '96',
      buriedDepth: '12',
      blockFaceLength: '6',
      blockFaceHeight: '3',
      blockDepth: '18',
      capLength: '6',
      blockWaste: '15',
      density: '2',
    }));
    expect(tall.courses).toBe(36);
    expect(tall.blocksToBuy).toBe(16560);
    expect(tall.engineerCheck).toBe(1);
  });

  it('a 2 ft circle with an 18 in block still returns a pad', () => {
    const r = ok(base({
      wallShape: 'circle',
      length: '2',
      blockDepth: '18',
      blockWaste: '0',
    }));
    expect(r.padYards).toBeGreaterThan(0);
    expect(r.blocksPerCourse).toBeGreaterThan(0);
    expect(r.drainpipeFt).toBeGreaterThan(0);
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
