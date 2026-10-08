// logic.test.js: Vitest tests for logic.js.
// Known answers are hand math, written out in each test. Purchase counts
// always round up. Multiplier for x/12 = sqrt(1 + (x/12)^2).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate, multiplierToPitch, pitchFromQuery, pitchToMultiplier, PRODUCTS, shoppingList } = logic;

// The form defaults (meta.json), GAF accessory preset.
const DEFAULTS = {
  length: '40',
  width: '30',
  pitchMode: 'pitch',
  pitch: '6',
  multiplier: '1.118',
  eave: '80',
  rake: '60',
  ridgeHip: '40',
  bundlesPerSquare: '3',
  waste: '10',
  product: 'gaf',
  starterCoverage: '120.33',
  ridgeCoverage: '25',
  underlaymentCoverage: '937.5',
  nailsPerSquare: '256',
};
const run = (over = {}) => calculate({ ...DEFAULTS, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok).toBe(true);
  return r.results;
};
const errorsFor = (over) => {
  const r = run(over);
  expect(r.ok).toBe(false);
  return r.errors;
};

describe('known answers', () => {
  it('worked example in page.md: 40 x 30 ft footprint, 6/12, GAF preset (hand math)', () => {
    // M = sqrt(1 + 0.5^2) = 1.118034; area = 1,200 x 1.118034 = 1,341.64 sq ft
    // squares = 13.4164; with 10% waste = 14.7580
    // field before waste = ceil(13.4164 x 3 = 40.25) = 41; with waste = ceil(44.27) = 45
    // starter = ceil((80 + 60) / 120.33 = 1.16) = 2; ridge cap = ceil(40 / 25 = 1.6) = 2
    // underlayment = ceil(1,341.64 / 937.5 = 1.43) = 2; nails = ceil(14.7580 x 256 = 3,778.06) = 3,779
    expect(ok()).toEqual({
      fieldBundles: 45,
      fieldBundlesBeforeWaste: 41,
      roofArea: 1341.6,
      multiplier: 1.118,
      squares: 13.42,
      squaresWithWaste: 14.76,
      starterLength: 140,
      starterBundles: 2,
      ridgeCapBundles: 2,
      underlaymentRolls: 2,
      nails: 3779,
    });
  });

  it('30 x 20 ft, 12/12, 15% waste, Owens Corning preset (hand math)', () => {
    // M = sqrt(2) = 1.414214; area = 600 x 1.414214 = 848.53 sq ft; squares = 8.4853
    // with 15% = 9.7581; before = ceil(25.46) = 26; with = ceil(29.27) = 30
    // starter = ceil(60 / 105) = 1; ridge = ceil(30 / 33) = 1; underlayment = ceil(848.53 / 929) = 1
    // nails = ceil(9.7581 x 256 = 2,498.07) = 2,499
    const r = ok({
      length: '30', width: '20', pitch: '12', waste: '15', eave: '60', rake: '0', ridgeHip: '30',
      starterCoverage: '105', ridgeCoverage: '33', underlaymentCoverage: '929',
    });
    expect(r).toMatchObject({
      roofArea: 848.5, squares: 8.49, fieldBundlesBeforeWaste: 26, fieldBundles: 30,
      starterBundles: 1, ridgeCapBundles: 1, underlaymentRolls: 1, nails: 2499,
    });
  });

  it('multiplier mode 1.25 on 50 x 40 ft, 4 bundles/square (hand math, round numbers)', () => {
    // area = 2,000 x 1.25 = 2,500 sq ft = 25 squares; with 10% = 27.5
    // before = 25 x 4 = 100; with = 27.5 x 4 = 110; starter = ceil(100 / 100) = 1; ridge = 0
    // underlayment = ceil(2,500 / 400 = 6.25) = 7; nails = 27.5 x 320 = 8,800
    // 1.25 is a 9/12 roof (12 x sqrt(1.25^2 - 1) = 9), so single underlayment
    const r = ok({
      length: '50', width: '40', pitchMode: 'multiplier', multiplier: '1.25', pitch: 'not used',
      eave: '100', rake: '0', ridgeHip: '0', bundlesPerSquare: '4',
      starterCoverage: '100', ridgeCoverage: '20', underlaymentCoverage: '400', nailsPerSquare: '320',
    });
    expect(r).toMatchObject({
      roofArea: 2500, squares: 25, squaresWithWaste: 27.5, fieldBundlesBeforeWaste: 100, fieldBundles: 110,
      starterBundles: 1, ridgeCapBundles: 0, underlaymentRolls: 7, nails: 8800, multiplier: 1.25,
    });
  });

  it('FAQ: a 2,000 sq ft roof is 20 squares = 60 bundles, 66 with 10% waste (hand math)', () => {
    // flat-pitch equivalent via multiplier 1.0 is not allowed, so use 1.25 x 40 x 40 = 2,000 sq ft
    const r = ok({ length: '40', width: '40', pitchMode: 'multiplier', multiplier: '1.25' });
    expect(r.squares).toBe(20);
    expect(r.fieldBundlesBeforeWaste).toBe(60);
    expect(r.fieldBundles).toBe(66);
  });

  it('pitch multiplier helpers match the formula', () => {
    expect(pitchToMultiplier(6)).toBeCloseTo(1.118034, 6);
    expect(pitchToMultiplier(12)).toBeCloseTo(Math.SQRT2, 9);
    expect(multiplierToPitch(1.25)).toBeCloseTo(9, 9);
  });
});

describe('low-slope rules (2024 IRC R905.2.2, Table R905.1.1(2))', () => {
  it('3/12 doubles the underlayment and adds a note', () => {
    // M = sqrt(1 + 0.0625) = 1.030776; area = 1,236.93; 2 layers = 2,473.86 / 937.5 = 2.64 -> 3
    const r = run({ pitch: '3' });
    expect(r.results.underlaymentRolls).toBe(3);
    expect(r.slopeNote).toMatch(/two layers of underlayment/);
    expect(r.slopeNote).toMatch(/2024 IRC/);
  });
  it('exactly 4/12 is single underlayment with no note', () => {
    // area = 1,200 x 1.054093 = 1,264.91 / 937.5 = 1.35 -> 2
    const r = run({ pitch: '4' });
    expect(r.results.underlaymentRolls).toBe(2);
    expect(r.slopeNote).toBe('');
  });
  it('accepts 2/12, rejects 1.9/12 and 0 on the pitch field', () => {
    expect(run({ pitch: '2' }).ok).toBe(true);
    expect(errorsFor({ pitch: '1.9' })).toHaveProperty('pitch');
    expect(errorsFor({ pitch: '0' })).toHaveProperty('pitch');
  });
  it('rounds pitch to 2 decimals before choosing a band, like the Roof Pitch Calculator', () => {
    // 3.999 rounds to 4.00 -> single layer; 3.99 stays double; 1.996 rounds to 2.00 -> allowed
    expect(run({ pitch: '3.999' }).slopeNote).toBe('');
    expect(run({ pitch: '3.99' }).slopeNote).not.toBe('');
    expect(run({ pitch: '1.996' }).ok).toBe(true);
    expect(errorsFor({ pitch: '1.994' }).pitch).toMatch(/2024 IRC/);
  });
  it('multiplier below the 2/12 equivalent is rejected on the multiplier field', () => {
    expect(errorsFor({ pitchMode: 'multiplier', multiplier: '1' })).toHaveProperty('multiplier');
    expect(errorsFor({ pitchMode: 'multiplier', multiplier: '1.01' })).toHaveProperty('multiplier');
    expect(run({ pitchMode: 'multiplier', multiplier: '1.014' }).ok).toBe(true);
  });
});

describe('edge cases', () => {
  it('rejects zero and negative sizes', () => {
    expect(errorsFor({ length: '0' })).toHaveProperty('length');
    expect(errorsFor({ width: '-5' })).toHaveProperty('width');
    expect(errorsFor({ eave: '-1' })).toHaveProperty('eave');
  });
  it('rejects very large values', () => {
    expect(errorsFor({ length: '1e9' })).toHaveProperty('length');
    expect(errorsFor({ ridgeHip: '100000' })).toHaveProperty('ridgeHip');
  });
  it('rejects empty and non-numeric input', () => {
    expect(errorsFor({ length: '' })).toHaveProperty('length');
    expect(errorsFor({ waste: 'ten' })).toHaveProperty('waste');
    expect(calculate({}).ok).toBe(false);
    expect(calculate(undefined).ok).toBe(false);
  });
  it('only validates the pitch field that is in use', () => {
    expect(run({ pitchMode: 'pitch', multiplier: 'junk' }).ok).toBe(true);
    expect(run({ pitchMode: 'multiplier', pitch: '' }).ok).toBe(true);
    expect(errorsFor({ pitchMode: 'multiplier', multiplier: '' })).toHaveProperty('multiplier');
  });
  it('zero edge lengths give zero accessory bundles', () => {
    const r = ok({ eave: '0', rake: '0', ridgeHip: '0' });
    expect(r.starterBundles).toBe(0);
    expect(r.ridgeCapBundles).toBe(0);
  });
  it('accepts commas in numbers', () => {
    expect(ok({ nailsPerSquare: '1,00' }).nails).toBeGreaterThan(0);
  });
});

describe('input boundaries (just inside / just outside)', () => {
  const cases = [
    ['length', '10', '200', '9.9', '200.1'],
    ['width', '10', '100', '9.9', '100.1'],
    ['pitch', '2', '24', '1.99', '24.1'],
    ['eave', '0', '500', '-0.1', '500.1'],
    ['rake', '0', '500', '-0.1', '500.1'],
    ['ridgeHip', '0', '500', '-0.1', '500.1'],
    ['bundlesPerSquare', '3', '5', '2.9', '5.1'],
    ['waste', '5', '25', '4.9', '25.1'],
    ['starterCoverage', '50', '200', '49.9', '200.1'],
    ['ridgeCoverage', '15', '45', '14.9', '45.1'],
    ['underlaymentCoverage', '200', '1000', '199', '1000.1'],
    ['nailsPerSquare', '100', '400', '99', '401'],
  ];
  for (const [name, lo, hi, below, above] of cases) {
    it(`${name}: accepts ${lo} and ${hi}, rejects ${below} and ${above}`, () => {
      expect(run({ [name]: lo }).ok).toBe(true);
      expect(run({ [name]: hi }).ok).toBe(true);
      expect(errorsFor({ [name]: below })).toHaveProperty(name);
      expect(errorsFor({ [name]: above })).toHaveProperty(name);
    });
  }
  it('multiplier: accepts 2.5, rejects 2.51', () => {
    expect(run({ pitchMode: 'multiplier', multiplier: '2.5' }).ok).toBe(true);
    expect(errorsFor({ pitchMode: 'multiplier', multiplier: '2.51' })).toHaveProperty('multiplier');
  });
});

describe('pitch handed over by the Roof Pitch Calculator (?pitch=)', () => {
  it('reads the pitch parameter and rounds it to 2 decimals', () => {
    expect(pitchFromQuery('?pitch=6')).toBe('6');
    expect(pitchFromQuery('?pitch=4.5')).toBe('4.5');
    expect(pitchFromQuery('?pitch=7.33333')).toBe('7.33');
    expect(pitchFromQuery('pitch=12&utm=x')).toBe('12');
  });
  it('ignores a missing, empty, negative, or non-numeric value', () => {
    for (const q of ['', '?', '?other=1', '?pitch=', '?pitch=%20', '?pitch=-3', '?pitch=abc', '?pitch=Infinity', '?pitch=1234567890123', undefined]) {
      expect(pitchFromQuery(q), String(q)).toBeNull();
    }
  });
  it('passes out-of-range numbers through so validation can explain them', () => {
    expect(pitchFromQuery('?pitch=1.5')).toBe('1.5');
    expect(errorsFor({ pitch: pitchFromQuery('?pitch=1.5') })).toHaveProperty('pitch');
  });
  it('a handed-over 6/12 gives the worked-example numbers', () => {
    expect(ok({ pitch: pitchFromQuery('?pitch=6') }).fieldBundles).toBe(45);
  });
});

describe('product presets and shopping list', () => {
  it('presets match the meta.json defaults and stay in range', () => {
    const meta = JSON.parse(readFileSync(new URL('./meta.json', import.meta.url), 'utf8'));
    const def = Object.fromEntries(meta.inputs.map((i) => [i.name, i.default]));
    expect(def.product).toBe('gaf');
    for (const key of ['starterCoverage', 'ridgeCoverage', 'underlaymentCoverage']) {
      expect(Number(def[key])).toBe(PRODUCTS.gaf[key]);
      for (const p of Object.values(PRODUCTS)) expect(run({ [key]: String(p[key]) }).ok).toBe(true);
    }
  });
  it('every results key is a meta.json output', () => {
    const meta = JSON.parse(readFileSync(new URL('./meta.json', import.meta.url), 'utf8'));
    const outputs = meta.outputs.map((o) => o.name).sort();
    expect(Object.keys(ok()).sort()).toEqual(outputs);
  });
  it('groups the list into field / accessories / fasteners', () => {
    const list = shoppingList(ok());
    expect(list.map((g) => g.group)).toEqual(['Field shingles', 'Accessories', 'Fasteners']);
    expect(list[0].items[0].qty).toBe(45);
    expect(list[1].items.map((i) => i.qty)).toEqual([2, 2, 2]);
    expect(list[2].items[0].qty).toBe(3779);
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
