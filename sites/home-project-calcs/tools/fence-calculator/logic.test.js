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
  expect(r.ok).toBe(true);
  return r.results;
};
const errs = (raw) => {
  const r = calculate(raw);
  expect(r.ok).toBe(false);
  return r.errors;
};

// Form defaults from meta.json (also the page.md worked example).
const D = {
  fenceLength: '100',
  fenceHeight: '6',
  postSpacing: '8',
  postSize: '4x4',
  postLength: '9',
  gates: '1',
  gateWidth: '4',
  picketWidth: '5.5',
  picketGap: '0.5',
  railsPerSection: '3',
  bagType: 'fast50',
  frostDepth: '0',
  picketWaste: '5',
};
const w = (over) => ({ ...D, ...over });

describe('known answers', () => {
  // Hand math (page.md worked example):
  // run = 100 - 1 x 4 = 96 ft; sections = ceil(96 / 8) = 12; posts = 12 + 1 + 1 gate = 14
  // rails = 12 x 3 = 36; pickets = 96 x 12 / (5.5 + 0.5) = 192; x 1.05 = 201.6 -> 202
  // hole dia = 3 x 3.5 = 10.5 in; bury = 108 / 3 = 36 in; hole depth = 36 + 6 = 42 in
  // concrete/post = (pi x 5.25^2 - 3.5^2) x 36 / 1728 = (86.590 - 12.25) x 36 / 1728 = 1.5488 cu ft
  // bags/post = 1.5488 / 0.375 = 4.13; total = 14 x 1.5488 = 21.68 cu ft / 0.375 = 57.8 -> 58 bags
  // gravel = 86.590 x 6 / 1728 = 0.30066 cu ft x 14 = 4.21 cu ft
  // above ground = 9 - 36/12 = 6 ft; min post = max(6 x 1.5, 6 + 0) = 9 ft
  it('100 ft, 6 ft tall, 8 ft spacing, 4x4x9 posts, 1 x 4 ft gate, 50 lb Fast-Setting (hand math above)', () => {
    expect(ok(D)).toEqual({
      posts: 14,
      rails: 36,
      pickets: 202,
      concreteBags: 58,
      sections: 12,
      actualSpacing: 8,
      fencedRun: 96,
      picketsBeforeWaste: 192,
      holeDiameter: 10.5,
      holeDepth: 42,
      concretePerPost: 1.549,
      bagsPerPost: 4.13,
      concreteTotal: 21.68,
      gravelTotal: 4.21,
      postAboveGround: 6,
      minPostLength: 9,
    });
  });

  // Hand math, 8 ft post (the old default): bury = 96 / 3 = 32 in; hole 38 in
  // concrete/post = (86.590 - 12.25) x 32 / 1728 = 1.3767 cu ft; 3.67 bags/post
  // 14 x 1.3767 = 19.27 cu ft / 0.375 = 51.4 -> 52 bags; above ground = 8 - 32/12 = 5.33 ft
  it('8 ft post with a 6 ft fence stands short of the fence (hand math above)', () => {
    const r = ok(w({ postLength: '8' }));
    expect(r.holeDepth).toBe(38);
    expect(r.concretePerPost).toBe(1.377);
    expect(r.bagsPerPost).toBe(3.67);
    expect(r.concreteBags).toBe(52);
    expect(r.postAboveGround).toBe(5.33);
    expect(r.minPostLength).toBe(9);
  });

  // Hand math: 6x6 post = 5.5 in; hole = 16.5 in; bury = 120 / 3 = 40 in; depth 46 in
  // concrete/post = (pi x 8.25^2 - 5.5^2) x 40 / 1728 = (213.825 - 30.25) x 40 / 1728 = 4.2494 cu ft
  // run = 60 ft, no gates; sections = ceil(60 / 6) = 10; posts = 11; rails 2 x 10 = 20
  // 80 lb Concrete Mix (0.6 cu ft): 11 x 4.2494 = 46.74 / 0.6 = 77.9 -> 78 bags; 7.08 bags/post
  // pickets 3.5 in, no gap, 0% waste: 720 / 3.5 = 205.7 -> 206
  it('60 ft, 6x6x10 posts, 6 ft spacing, no gates, 2 rails, 80 lb Concrete Mix (hand math above)', () => {
    const r = ok(w({ fenceLength: '60', postSize: '6x6', postLength: '10', postSpacing: '6', gates: '0', railsPerSection: '2', bagType: 'mix80', picketWidth: '3.5', picketGap: '0', picketWaste: '0' }));
    expect(r.posts).toBe(11);
    expect(r.rails).toBe(20);
    expect(r.pickets).toBe(206);
    expect(r.holeDiameter).toBe(16.5);
    expect(r.holeDepth).toBe(46);
    expect(r.concretePerPost).toBe(4.249);
    expect(r.bagsPerPost).toBe(7.08);
    expect(r.concreteBags).toBe(78);
  });

  // Hand math, 8 ft post, frost depth deeper than 1/3 rule: bury = max(32, 36) = 36 in; hole 42 in
  // concrete/post = (86.590 - 12.25) x 36 / 1728 = 1.5488 cu ft; 14 posts = 21.68 cu ft
  // 60 lb Fast-Setting (0.45): 21.68 / 0.45 = 48.2 -> 49 bags; above ground = 8 - 3 = 5 ft
  // min post = max(9, 6 + 3) = 9 ft
  it('frost depth 36 in pushes the hole deeper (hand math above)', () => {
    const r = ok(w({ postLength: '8', frostDepth: '36', bagType: 'fast60' }));
    expect(r.holeDepth).toBe(42);
    expect(r.concretePerPost).toBe(1.549);
    expect(r.concreteTotal).toBe(21.68);
    expect(r.concreteBags).toBe(49);
    expect(r.postAboveGround).toBe(5);
    expect(r.minPostLength).toBe(9);
  });

  // Hand math: frost 72 in, 8 ft fence -> min post = max(12, 8 + 6) = 14 ft
  it('min post length follows frost depth when it governs (max(1.5 x 8, 8 + 72/12) = 14 ft)', () => {
    expect(ok(w({ fenceHeight: '8', frostDepth: '72' })).minPostLength).toBe(14);
  });

  // Hand math, board-on-board with 1 in overlap per edge: coverage per picket = 5.5 - 1 = 4.5 in
  // 96 x 12 / 4.5 = 256 before waste; x 1.05 = 268.8 -> 269
  it('negative gap counts board-on-board overlap (hand math: 1152 / 4.5 = 256 -> 269 with 5%)', () => {
    const r = ok(w({ picketGap: '-1' }));
    expect(r.picketsBeforeWaste).toBe(256);
    expect(r.pickets).toBe(269);
  });

  // Hand math: run 50 - 2 x 4 = 42 ft; ceil(42 / 8) = 6 sections (actual spacing 7 ft); posts 6 + 1 + 2 = 9
  it('two gates add a post each and shorten the run (hand math above)', () => {
    const r = ok(w({ fenceLength: '50', gates: '2' }));
    expect(r.fencedRun).toBe(42);
    expect(r.sections).toBe(6);
    expect(r.actualSpacing).toBe(7);
    expect(r.posts).toBe(9);
  });

  // bags = ceil(posts x 1.5488 / 0.375): 8 -> 33.04 -> 34; 21 -> 86.7 -> 87; 27 -> 111.5 -> 112
  it('page.md length table rows (hand math: posts = ceil((L-4)/8)+2, pickets = ceil((L-4) x 2 x 1.05))', () => {
    const row = (L) => {
      const r = ok(w({ fenceLength: String(L) }));
      return [r.posts, r.rails, r.pickets, r.concreteBags];
    };
    expect(row(50)).toEqual([8, 18, 97, 34]);
    expect(row(100)).toEqual([14, 36, 202, 58]);
    expect(row(150)).toEqual([21, 57, 307, 87]);
    expect(row(200)).toEqual([27, 75, 412, 112]);
  });

  // Hand math, 9 ft 4x4: buried post = 3.5 x 3.5 x 36 / 1728 = 0.2552 cu ft
  it('donut chart lists concrete, gravel, and buried post volume for one hole', () => {
    const { chart } = calculate(D);
    expect(chart.map((c) => c.value)).toEqual([1.549, 0.301, 0.255]);
    expect(chart.map((c) => c.label)).toEqual(['Concrete 1.55', 'Gravel 0.30', 'Post 0.26']);
  });
});

describe('edge cases', () => {
  it('rejects zero and negative sizes', () => {
    expect(errs(w({ fenceLength: '0' }))).toHaveProperty('fenceLength');
    expect(errs(w({ fenceLength: '-100' }))).toHaveProperty('fenceLength');
    expect(errs(w({ postSpacing: '0' }))).toHaveProperty('postSpacing');
    expect(errs(w({ picketWidth: '-5' }))).toHaveProperty('picketWidth');
    expect(errs(w({ gates: '-1' }))).toHaveProperty('gates');
  });
  it('rejects very large values', () => {
    expect(errs(w({ fenceLength: '1e7' }))).toHaveProperty('fenceLength');
    expect(errs(w({ frostDepth: '9999' }))).toHaveProperty('frostDepth');
  });
  it('rejects empty and non-numeric input', () => {
    expect(errs(w({ fenceLength: '' }))).toHaveProperty('fenceLength');
    expect(errs(w({ postLength: 'eight' }))).toHaveProperty('postLength');
    expect(errs(w({ picketWaste: 'abc' }))).toHaveProperty('picketWaste');
    expect(calculate({}).ok).toBe(false);
    expect(calculate().ok).toBe(false);
  });
  it('rejects unknown select values', () => {
    expect(errs(w({ postSize: '2x4' }))).toHaveProperty('postSize');
    expect(errs(w({ bagType: 'mix40' }))).toHaveProperty('bagType');
    expect(errs(w({ railsPerSection: '4' }))).toHaveProperty('railsPerSection');
  });
  it('rejects fractional gate counts and gates wider than the fence', () => {
    expect(errs(w({ gates: '1.5' }))).toHaveProperty('gates');
    expect(errs(w({ fenceLength: '10', gates: '1', gateWidth: '10' }))).toHaveProperty('gates');
    expect(calculate(w({ fenceLength: '10', gates: '1', gateWidth: '9' })).ok).toBe(true);
  });
  it('rejects an overlap of half the picket width or more', () => {
    expect(errs(w({ picketWidth: '3', picketGap: '-1.5' }))).toHaveProperty('picketGap');
    expect(calculate(w({ picketWidth: '3', picketGap: '-1.4' })).ok).toBe(true);
  });

  const bounds = [
    ['fenceLength', 10, 1000, 9.9, 1000.1],
    ['fenceHeight', 3, 8, 2.9, 8.1],
    ['postSpacing', 4, 10, 3.9, 10.1],
    ['postLength', 5, 12, 4.9, 12.1],
    ['gates', 0, 10, -1, 11],
    ['gateWidth', 2, 12, 1.9, 12.1],
    ['picketWidth', 3, 8, 2.9, 8.1],
    ['picketGap', -2, 2, -2.1, 2.1],
    ['frostDepth', 0, 72, -0.1, 72.1],
    ['picketWaste', 0, 15, -0.1, 15.1],
  ];
  // Base big enough that 10 gates x 12 ft still leave a fenced run.
  const roomy = w({ fenceLength: '500', gates: '0', picketWidth: '8' });
  it.each(bounds)('%s accepts %d and %d, rejects %d and %d', (name, lo, hi, below, above) => {
    expect(calculate({ ...roomy, [name]: String(lo) }).ok).toBe(true);
    expect(calculate({ ...roomy, [name]: String(hi) }).ok).toBe(true);
    expect(calculate({ ...roomy, [name]: String(below) }).errors).toHaveProperty(name);
    expect(calculate({ ...roomy, [name]: String(above) }).errors).toHaveProperty(name);
  });

  it('handles the largest allowed job without overflow', () => {
    const r = ok(w({ fenceLength: '1000', postSpacing: '4', gates: '0', picketWidth: '3', picketGap: '0', picketWaste: '15', postSize: '6x6', postLength: '12', frostDepth: '72' }));
    // 250 sections -> 251 posts; 12000 / 3 = 4000 x 1.15 = 4600 pickets
    expect(r.posts).toBe(251);
    expect(r.pickets).toBe(4600);
    expect(Number.isFinite(r.concreteBags)).toBe(true);
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
