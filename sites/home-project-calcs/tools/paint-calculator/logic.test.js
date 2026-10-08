// logic.test.js: Vitest tests for logic.js.
// Required: at least 3 known-answer cases (each with its reference noted: a
// trusted calculator or hand math) PLUS edge cases: zero, negative, very
// large, empty, non-numeric, and the boundary values of every input.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate, containerMix } = logic;

const fields = (over = {}) => ({
  length: '12',
  width: '12',
  height: '8',
  includeCeiling: 'yes',
  doors: '1',
  doorSize: '20',
  windows: '2',
  windowSize: '15',
  coats: '2',
  product: 'sw-350',
  coverage: '350',
  includePrimer: 'no',
  ...over,
});

const ok = (over = {}) => {
  const result = calculate(fields(over));
  expect(result.ok, JSON.stringify(result)).toBe(true);
  return result;
};

describe('known answers (hand math)', () => {
  it('12x12x8 worked example, 2 coats at 350: walls 334/350x2 = 1.909 gal, buy 2 gal; ceiling 1 gal', () => {
    // Gross walls 2*(12+12)*8 = 384. Openings 20+30 = 50. Walls 334.
    // Per coat 334/350 = 0.9543 shown 0.95. Total 1.9086 shown 1.91. Next quart 2.00 = 2 x 1-gal.
    // Ceiling 144/350*2 = 0.8229 gal, next quart 1.00 = 1 gallon. Sherwin-Williams SuperPaint low end.
    const result = ok();
    expect(result.results).toEqual({
      wallArea: 334,
      ceilingArea: 144,
      gallonsPerCoat: 0.95,
      totalGallons: 1.91,
      fiveGallon: 0,
      oneGallon: 2,
      quarts: 0,
      ceilingBuy: 1,
      primerBuy: 0,
    });
    expect(result.chart).toEqual([
      { label: 'Walls 2 gal', value: 2 },
      { label: 'Ceiling 1 gal', value: 1 },
    ]);
  });

  it('10x10x8, no openings, no ceiling, 1 coat at 400: 320/400 = 0.8 gal, buy 1 gallon', () => {
    // Gross walls 2*(10+10)*8 = 320. 320/400 = 0.8. 0.8 gal rounds up to 1 gallon (4 quarts).
    const result = ok({
      length: '10',
      width: '10',
      includeCeiling: 'no',
      doors: '0',
      windows: '0',
      coats: '1',
      product: 'custom',
      coverage: '400',
    });
    expect(result.results).toEqual({
      wallArea: 320,
      ceilingArea: 0,
      gallonsPerCoat: 0.8,
      totalGallons: 0.8,
      fiveGallon: 0,
      oneGallon: 1,
      quarts: 0,
      ceilingBuy: 0,
      primerBuy: 0,
    });
    expect(result.chart).toEqual([{ label: 'Walls 1 gal', value: 1 }]);
  });

  it('same 12x12 room at SuperPaint 400, with primer over walls + ceiling', () => {
    // Walls 334/400 = 0.835 shown 0.84; x2 = 1.67 -> 1.75 = 1 gal + 3 qt -> 3 qt become a gallon = 2 gal.
    // Ceiling 144/400*2 = 0.72 -> 0.75 (3 qt) -> 1 gallon.
    // Primer one coat over 334 + 144 = 478 sq ft: 478/400 = 1.195 -> 1.25 gal (1 gal + 1 qt).
    const result = ok({ product: 'sw-400', includePrimer: 'yes', coverage: '999' });
    expect(result.results).toEqual({
      wallArea: 334,
      ceilingArea: 144,
      gallonsPerCoat: 0.84,
      totalGallons: 1.67,
      fiveGallon: 0,
      oneGallon: 2,
      quarts: 0,
      ceilingBuy: 1,
      primerBuy: 1.25,
    });
    expect(result.chart).toEqual([
      { label: 'Walls 2 gal', value: 2 },
      { label: 'Ceiling 1 gal', value: 1 },
      { label: 'Primer 1.25 gal', value: 1.25 },
    ]);
  });

  it('20x24x12, no openings, no ceiling: 1056x2/350 = 6.034 gal, buy 1 bucket + 1 gal + 1 qt', () => {
    // Walls 2*(20+24)*12 = 1056. 1056/350 = 3.0171 shown 3.02; x2 = 6.0343 shown 6.03.
    // Next quart 6.25 = 25 quarts = one 5-gal (20) + 1 gal (4) + 1 qt.
    const result = ok({ length: '20', width: '24', height: '12', doors: '0', windows: '0', includeCeiling: 'no' });
    expect(result.results).toMatchObject({
      wallArea: 1056,
      gallonsPerCoat: 3.02,
      totalGallons: 6.03,
      fiveGallon: 1,
      oneGallon: 1,
      quarts: 1,
      ceilingBuy: 0,
    });
    expect(result.chart).toEqual([{ label: 'Walls 6.25 gal', value: 6.25 }]);
  });

  it('20x20x10 walls: 800x2/350 = 4.571 gal -> 4 gal + 3 qt -> 5 gal -> one 5-gallon bucket', () => {
    const result = ok({ length: '20', width: '20', height: '10', doors: '0', windows: '0' });
    expect(result.results).toMatchObject({ wallArea: 800, totalGallons: 4.57, fiveGallon: 1, oneGallon: 0, quarts: 0 });
    // Ceiling 400/350*2 = 2.2857 -> 2.5 gal (2 gal + 2 qt).
    expect(result.results.ceilingBuy).toBe(2.5);
  });
});

describe('shopping table (hand math, 8 ft, ceiling, 50 sq ft openings, 2 coats, 350)', () => {
  const rows = [
    ['10', '10', { wallArea: 270, ceilingArea: 100, totalGallons: 1.54, fiveGallon: 0, oneGallon: 2, quarts: 0, ceilingBuy: 1 }],
    ['10', '12', { wallArea: 302, ceilingArea: 120, totalGallons: 1.73, fiveGallon: 0, oneGallon: 2, quarts: 0, ceilingBuy: 1 }],
    ['12', '12', { wallArea: 334, ceilingArea: 144, totalGallons: 1.91, fiveGallon: 0, oneGallon: 2, quarts: 0, ceilingBuy: 1 }],
    ['12', '14', { wallArea: 366, ceilingArea: 168, totalGallons: 2.09, fiveGallon: 0, oneGallon: 2, quarts: 1, ceilingBuy: 1 }],
    ['14', '16', { wallArea: 430, ceilingArea: 224, totalGallons: 2.46, fiveGallon: 0, oneGallon: 2, quarts: 2, ceilingBuy: 1.5 }],
    ['16', '20', { wallArea: 526, ceilingArea: 320, totalGallons: 3.01, fiveGallon: 0, oneGallon: 3, quarts: 1, ceilingBuy: 2 }],
  ];
  for (const [length, width, expected] of rows) {
    it(`${length} x ${width} matches the page table`, () => {
      expect(ok({ length, width }).results).toMatchObject(expected);
    });
  }
});

describe('container mix (4 quarts = 1 gallon, 20 quarts = 5 gallons, 3 leftover quarts = 1 gallon)', () => {
  it('rolls exact quarts into larger cans and rounds leftovers up', () => {
    expect(containerMix(5)).toEqual({ fiveGallon: 1, oneGallon: 0, quarts: 0 });
    expect(containerMix(2.5)).toEqual({ fiveGallon: 0, oneGallon: 2, quarts: 2 });
    expect(containerMix(2.26)).toEqual({ fiveGallon: 0, oneGallon: 2, quarts: 2 });
    expect(containerMix(0.8)).toEqual({ fiveGallon: 0, oneGallon: 1, quarts: 0 });
    expect(containerMix(0.5)).toEqual({ fiveGallon: 0, oneGallon: 0, quarts: 2 });
    expect(containerMix(0.25)).toEqual({ fiveGallon: 0, oneGallon: 0, quarts: 1 });
    expect(containerMix(0.01)).toEqual({ fiveGallon: 0, oneGallon: 0, quarts: 1 });
    expect(containerMix(0)).toEqual({ fiveGallon: 0, oneGallon: 0, quarts: 0 });
    expect(containerMix(-1)).toEqual({ fiveGallon: 0, oneGallon: 0, quarts: 0 });
  });

  it('buys a gallon instead of 3 quarts, and a bucket instead of 5 gallons', () => {
    expect(containerMix(0.55)).toEqual({ fiveGallon: 0, oneGallon: 1, quarts: 0 });
    expect(containerMix(2.75)).toEqual({ fiveGallon: 0, oneGallon: 3, quarts: 0 });
    expect(containerMix(4.5)).toEqual({ fiveGallon: 0, oneGallon: 4, quarts: 2 });
    expect(containerMix(4.51)).toEqual({ fiveGallon: 1, oneGallon: 0, quarts: 0 });
    expect(containerMix(9.75)).toEqual({ fiveGallon: 2, oneGallon: 0, quarts: 0 });
    expect(containerMix(10.5)).toEqual({ fiveGallon: 2, oneGallon: 0, quarts: 2 });
    expect(logic.mixGallons({ fiveGallon: 2, oneGallon: 1, quarts: 2 })).toBe(11.5);
  });

  it('buys from the exact gallons when the on-screen hundredths would under-buy', () => {
    // Walls 384 - 20 - 2*6.9125 = 350.175 sq ft. 350.175/350*2 = 2.001 gal, shown as 2.00.
    // 2.001 rounds up to 2.25 gal (2 gallons + 1 quart), not to 2.00.
    const result = ok({ windowSize: '6.9125' });
    expect(result.results.totalGallons).toBe(2);
    expect(result.results.oneGallon).toBe(2);
    expect(result.results.quarts).toBe(1);
  });
});

describe('edge cases', () => {
  it('rejects zero where the minimum is above zero, and accepts zero doors and windows', () => {
    expect(calculate(fields({ length: '0' })).errors).toHaveProperty('length');
    expect(calculate(fields({ height: '0' })).errors).toHaveProperty('height');
    expect(ok({ doors: '0', windows: '0' }).results.wallArea).toBe(384);
  });

  it('rejects negative values', () => {
    expect(calculate(fields({ width: '-1' })).errors).toHaveProperty('width');
    expect(calculate(fields({ doors: '-1' })).errors).toHaveProperty('doors');
    expect(calculate(fields({ coats: '-1' })).errors).toHaveProperty('coats');
    expect(calculate(fields({ coverage: '-5', product: 'custom' })).errors).toHaveProperty('coverage');
  });

  it('rejects very large values above each maximum', () => {
    expect(calculate(fields({ length: '1e7' })).errors).toHaveProperty('length');
    expect(calculate(fields({ width: '100000' })).errors).toHaveProperty('width');
    expect(calculate(fields({ height: '80' })).errors).toHaveProperty('height');
    expect(calculate(fields({ doors: '100' })).errors).toHaveProperty('doors');
    expect(calculate(fields({ coverage: '5000', product: 'custom' })).errors).toHaveProperty('coverage');
  });

  it('rejects empty and non-numeric input', () => {
    expect(calculate({}).ok).toBe(false);
    const empty = calculate({});
    expect(empty.errors).toHaveProperty('length');
    expect(empty.errors).toHaveProperty('includeCeiling');
    expect(empty.errors).toHaveProperty('product');
    expect(empty.errors).toHaveProperty('includePrimer');
    expect(calculate(fields({ length: '' })).errors).toHaveProperty('length');
    expect(calculate(fields({ length: 'ten' })).errors).toHaveProperty('length');
    expect(calculate(fields({ width: '12ft' })).errors).toHaveProperty('width');
    expect(calculate(fields({ coats: 'two' })).errors).toHaveProperty('coats');
    expect(calculate(fields({ product: 'custom', coverage: '' })).errors).toHaveProperty('coverage');
    expect(calculate(fields({ product: 'custom', coverage: 'lots' })).errors).toHaveProperty('coverage');
    expect(calculate(fields({ includeCeiling: '' })).errors).toHaveProperty('includeCeiling');
    expect(calculate(fields({ product: 'behr' })).errors).toHaveProperty('product');
  });

  it('accepts each numeric minimum and maximum, and rejects just outside', () => {
    const samples = [
      ['length', '4', '50', '3.99', '50.01'],
      ['width', '4', '50', '3.99', '50.01'],
      ['height', '7', '12', '6.99', '12.01'],
      ['doors', '0', '10', '-0.1', '11'],
      ['doorSize', '10', '40', '9.99', '40.01'],
      ['windows', '0', '20', '-1', '21'],
      ['windowSize', '4', '40', '3.99', '40.01'],
      ['coats', '1', '3', '0', '4'],
    ];
    const tiny = { doors: '0', windows: '0', includeCeiling: 'yes' };
    for (const [name, min, max, under, over] of samples) {
      expect(calculate(fields({ ...tiny, [name]: min })).ok, name + ' min').toBe(true);
      expect(calculate(fields({ ...tiny, [name]: max })).ok, name + ' max').toBe(true);
      expect(calculate(fields({ [name]: under })).ok, name + ' under').toBe(false);
      expect(calculate(fields({ [name]: over })).errors, name + ' over').toHaveProperty(name);
    }
    expect(ok({ product: 'custom', coverage: '200' }).ok).toBe(true);
    expect(ok({ product: 'custom', coverage: '450' }).ok).toBe(true);
    expect(calculate(fields({ product: 'custom', coverage: '199' })).errors).toHaveProperty('coverage');
    expect(calculate(fields({ product: 'custom', coverage: '451' })).errors).toHaveProperty('coverage');
  });

  it('rejects fractional door, window, and coat counts inside the range', () => {
    expect(calculate(fields({ doors: '1.5' })).errors.doors).toMatch(/whole number/);
    expect(calculate(fields({ windows: '2.2' })).errors.windows).toMatch(/whole number/);
    expect(calculate(fields({ coats: '2.5' })).errors.coats).toMatch(/whole number/);
    expect(ok({ doors: '10.0', windows: '0' }).results.wallArea).toBe(384 - 200);
  });

  it('accepts the top of every range together', () => {
    // 50x50x12, ceiling, no openings, 3 coats, custom 200 sq ft/gal.
    // Walls 2400/200 = 12 per coat, x3 = 36 gal = 7 buckets + 1 gal.
    // Ceiling 2500/200*3 = 37.5 gal bought as 37.5.
    const result = ok({
      length: '50',
      width: '50',
      height: '12',
      doors: '0',
      windows: '0',
      coats: '3',
      product: 'custom',
      coverage: '200',
    });
    expect(result.results).toMatchObject({
      wallArea: 2400,
      ceilingArea: 2500,
      gallonsPerCoat: 12,
      totalGallons: 36,
      fiveGallon: 7,
      oneGallon: 1,
      quarts: 0,
      ceilingBuy: 37.5,
    });
  });

  it('errors when openings are larger than the walls, on the counts that caused it', () => {
    const both = calculate(fields({
      length: '4',
      width: '4',
      height: '7',
      doors: '4',
      doorSize: '40',
      windows: '2',
    }));
    expect(both.ok).toBe(false);
    expect(both.errors).toHaveProperty('doors');
    expect(both.errors).toHaveProperty('windows');

    const windowsOnly = calculate(fields({
      length: '4',
      width: '4',
      height: '7',
      doors: '0',
      windows: '10',
      windowSize: '40',
    }));
    expect(windowsOnly.errors).toHaveProperty('windows');
    expect(windowsOnly.errors).not.toHaveProperty('doors');
  });

  it('errors when openings cover the walls and the ceiling is off', () => {
    const blocked = calculate(fields({
      length: '4',
      width: '4',
      height: '7',
      includeCeiling: 'no',
      doors: '2',
      doorSize: '40',
      windows: '2',
      windowSize: '16',
    }));
    expect(blocked.errors).toHaveProperty('includeCeiling');
  });

  it('paints only the ceiling when the openings equal the walls', () => {
    // Walls 2*(4+4)*7 = 112. Openings 2*40 + 2*16 = 112. Ceiling 16.
    // No wall paint. Ceiling 16/350*2 = 0.0914 gal, bought as 1 quart (0.25).
    const result = ok({
      length: '4',
      width: '4',
      height: '7',
      doors: '2',
      doorSize: '40',
      windows: '2',
      windowSize: '16',
    });
    expect(result.results).toMatchObject({
      wallArea: 0,
      ceilingArea: 16,
      gallonsPerCoat: 0,
      totalGallons: 0,
      fiveGallon: 0,
      oneGallon: 0,
      quarts: 0,
      ceilingBuy: 0.25,
    });
    expect(result.chart).toEqual([{ label: 'Ceiling 0.25 gal', value: 0.25 }]);
  });

  it('ignores the coverage box unless Product is Custom, and trims a normal number', () => {
    expect(ok({ coverage: '200' }).results.totalGallons).toBe(1.91);
    expect(ok({ length: ' 12 ' }).results.wallArea).toBe(334);
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
