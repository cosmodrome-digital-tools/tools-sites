// logic.test.js: Vitest tests for the mulch calculator.
// Known answers are hand math. Unit facts (12 in = 1 ft, 27 cu ft = 1 cu yd)
// are from NIST Handbook 44 (2026), Appendix C. Depth and trunk-gap guidance
// is from University of Illinois Extension, Proper Mulching Techniques.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate } = logic;

const defaults = {
  shape: 'rectangle',
  length: '20',
  width: '10',
  outerDiameter: '6',
  area: '200',
  depth: '3',
  existingDepth: '0',
  bagSize: '2',
  clearanceRadius: '0.33',
};

const run = (overrides = {}) => calculate({ ...defaults, ...overrides });

const ok = (overrides = {}) => {
  const result = run(overrides);
  expect(result.ok, JSON.stringify(result.errors)).toBe(true);
  return result;
};

describe('known answers', () => {
  it('20 ft x 10 ft x 3 in, 2 cu ft bags = 50 cu ft, 1.85 cu yd, 25 bags (hand math, the worked example)', () => {
    // 20 × 10 = 200 sq ft. 200 × 3 / 12 = 50 cu ft. 50 / 27 = 1.85185… cu yd. 50 / 2 = 25 bags.
    const result = ok();
    expect(result.results).toEqual({
      bags: 25,
      cubicYards: 1.85,
      cubicFeet: 50,
      bagsPerYard: 13.5,
      areaSqFt: 200,
      netDepth: 3,
      openSqFt: 0,
    });
    // Bare-soil chart at 2, 3, and 4 inches: ceil(33.333/2)=17, 25, ceil(66.667/2)=34.
    expect(result.chart).toEqual([
      { label: '2 in', value: 17 },
      { label: '3 in', value: 25 },
      { label: '4 in', value: 34 },
    ]);
  });

  it('top-up: same bed with 2 in already down needs 1 in more, 16.67 cu ft, 9 bags (hand math)', () => {
    // Net depth = 3 − 2 = 1. 200 × 1 / 12 = 16.666… cu ft. 16.666… / 27 = 0.61728… cu yd.
    // Bags = ceil(16.666… / 2) = ceil(8.333…) = 9. The chart still uses a bare bed.
    const result = ok({ existingDepth: '2' });
    expect(result.results).toEqual({
      bags: 9,
      cubicYards: 0.62,
      cubicFeet: 16.67,
      bagsPerYard: 13.5,
      areaSqFt: 200,
      netDepth: 1,
      openSqFt: 0,
    });
    expect(result.chart.map((row) => row.value)).toEqual([17, 25, 34]);
  });

  it('54 sq ft at 6 in is 1 cu yd; 2 cu ft bags round 13.5 up to 14 (hand math, NIST 27 cu ft)', () => {
    // 54 × 6 / 12 = 27 cu ft = 1 cu yd. 27 / 2 = 13.5, so bags to buy = 14. Bags in one yard stays 13.5.
    expect(ok({ shape: 'sqft', area: '54', depth: '6' }).results).toMatchObject({
      bags: 14,
      cubicYards: 1,
      cubicFeet: 27,
      bagsPerYard: 13.5,
      areaSqFt: 54,
      netDepth: 6,
      openSqFt: 0,
    });
  });

  it('54 sq ft at 6 in with a 3 cu ft bag is 9 bags exactly (hand math: 27 / 3 = 9)', () => {
    expect(ok({ shape: 'sqft', area: '54', depth: '6', bagSize: '3' }).results).toMatchObject({
      bags: 9,
      cubicYards: 1,
      cubicFeet: 27,
      bagsPerYard: 9,
    });
  });

  it('circle diameter 10 ft at 3 in is 25π sq ft, 19.63 cu ft, 10 bags (hand math)', () => {
    // Area = π × 5² = 25π ≈ 78.53981634, shown as 78.5.
    // Cubic feet = 25π × 3 / 12 ≈ 19.63495408, shown as 19.63.
    // Cubic yards ≈ 0.72722052, shown as 0.73. Bags = ceil(19.63495408 / 2) = 10.
    const result = ok({ shape: 'circle', length: '10' });
    expect(result.results).toEqual({
      bags: 10,
      cubicYards: 0.73,
      cubicFeet: 19.63,
      bagsPerYard: 13.5,
      areaSqFt: 78.5,
      netDepth: 3,
      openSqFt: 0,
    });
    expect(result.chart.map((row) => row.value)).toEqual([7, 10, 14]);
  });

  it('tree ring 6 ft across with 0.33 ft clearance at 3 in is 4 bags (hand math)', () => {
    // Outer radius 3. Open area = π × 0.33² ≈ 0.342119, shown as 0.3.
    // Mulched area = π × (9 − 0.1089) ≈ 27.932214, shown as 27.9.
    // Cubic feet ≈ 6.983054, shown as 6.98. Cubic yards ≈ 0.258632, shown as 0.26.
    // Bags = ceil(6.983054 / 2) = 4.
    const result = ok({ shape: 'treeRing' });
    expect(result.results).toEqual({
      bags: 4,
      cubicYards: 0.26,
      cubicFeet: 6.98,
      bagsPerYard: 13.5,
      areaSqFt: 27.9,
      netDepth: 3,
      openSqFt: 0.3,
    });
    expect(result.chart.map((row) => row.value)).toEqual([3, 4, 5]);
  });

  it('1.5 cu ft bags on the opening bed need 34 bags, and one yard holds 18 (hand math: 50 / 1.5)', () => {
    const result = ok({ bagSize: '1.5' });
    expect(result.results.bags).toBe(34);
    expect(result.results.bagsPerYard).toBe(18);
    expect(result.chart.map((row) => row.value)).toEqual([23, 34, 45]);
  });

  it('matches the common-bed table: 100, 200, and 300 sq ft at 2, 3, and 4 inches (hand math)', () => {
    const table = [
      { area: '100', depth: '2', cubicYards: 0.62, cubicFeet: 16.67, bags: 9 },
      { area: '100', depth: '3', cubicYards: 0.93, cubicFeet: 25, bags: 13 },
      { area: '100', depth: '4', cubicYards: 1.23, cubicFeet: 33.33, bags: 17 },
      { area: '200', depth: '2', cubicYards: 1.23, cubicFeet: 33.33, bags: 17 },
      { area: '200', depth: '3', cubicYards: 1.85, cubicFeet: 50, bags: 25 },
      { area: '200', depth: '4', cubicYards: 2.47, cubicFeet: 66.67, bags: 34 },
      { area: '300', depth: '2', cubicYards: 1.85, cubicFeet: 50, bags: 25 },
      { area: '300', depth: '3', cubicYards: 2.78, cubicFeet: 75, bags: 38 },
      { area: '300', depth: '4', cubicYards: 3.7, cubicFeet: 100, bags: 50 },
    ];
    for (const row of table) {
      expect(ok({ shape: 'sqft', area: row.area, depth: row.depth }).results).toMatchObject({
        cubicYards: row.cubicYards,
        cubicFeet: row.cubicFeet,
        bags: row.bags,
        bagsPerYard: 13.5,
      });
    }
  });

  it('accepts a comma in a typed area: 1,200 sq ft at 3 in is 300 cu ft and 150 bags', () => {
    // 1,200 × 3 / 12 = 300. 300 / 27 = 11.111… shown as 11.11. 300 / 2 = 150.
    expect(ok({ shape: 'sqft', area: '1,200' }).results).toMatchObject({
      areaSqFt: 1200,
      cubicFeet: 300,
      cubicYards: 11.11,
      bags: 150,
    });
  });
});

describe('shapes skip the boxes they do not use', () => {
  it('a rectangle ignores a broken circle, ring, and area', () => {
    expect(ok({ width: '10', outerDiameter: 'nope', area: '', clearanceRadius: '9' }).results.areaSqFt).toBe(200);
  });

  it('a circle uses length as the diameter and ignores width', () => {
    const result = ok({ shape: 'circle', length: '10', width: '', outerDiameter: '-4', area: 'abc' });
    expect(result.results.areaSqFt).toBe(78.5);
    expect(result.results.openSqFt).toBe(0);
  });

  it('enter sq ft ignores length, width, and the ring', () => {
    expect(ok({ shape: 'sqft', area: '200', length: '', width: '0', outerDiameter: '', clearanceRadius: '' }).results.bags).toBe(25);
  });

  it('a tree ring ignores length, width, and area', () => {
    const result = ok({ shape: 'treeRing', length: 'bad', width: '', area: '-1' });
    expect(result.results.bags).toBe(4);
    expect(result.results.openSqFt).toBe(0.3);
  });

  it('trims a shape value', () => {
    expect(ok({ shape: '  rectangle  ' }).results.bags).toBe(25);
  });
});

describe('edge cases', () => {
  it('rejects an unknown shape', () => {
    expect(run({ shape: 'triangle' }).errors).toEqual(expect.objectContaining({
      shape: 'Choose rectangle, circle, tree ring, or enter sq ft.',
    }));
    expect(run({ shape: 'Rectangle' }).ok).toBe(false);
  });

  it('rejects an empty form on the fields that are always required', () => {
    const result = calculate({});
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveProperty('shape');
    expect(result.errors).toHaveProperty('depth');
    expect(result.errors).toHaveProperty('existingDepth');
    expect(result.errors).toHaveProperty('bagSize');
    expect(result.errors).not.toHaveProperty('length');
  });

  it('rejects zero, negative, empty, and non-numeric size', () => {
    expect(run({ length: '0' }).errors).toHaveProperty('length');
    expect(run({ width: '-1' }).errors).toHaveProperty('width');
    expect(run({ length: '' }).errors.length).toBe('Enter length / diameter.');
    expect(run({ length: '   ' }).errors).toHaveProperty('length');
    expect(run({ length: 'ten' }).errors.length).toBe('Length / diameter must be a number.');
    expect(run({ length: '20ft' }).errors).toHaveProperty('length');
  });

  it('rejects a very large length and a non-finite number', () => {
    expect(run({ length: '1e7' }).errors.length).toBe('Length / diameter must be 200 or less.');
    expect(run({ length: '1e309' }).errors).toHaveProperty('length');
  });

  it('accepts length 1 and 200, and rejects just outside that range', () => {
    expect(ok({ length: '1', width: '1' }).results.areaSqFt).toBe(1);
    // 200 × 100 = 20,000 sq ft. At the default 3 inches: 20,000 × 3 / 12 = 5,000 cu ft.
    // 5,000 / 27 = 185.185… cu yd, shown as 185.19. 5,000 / 2 = 2,500 bags exactly.
    expect(ok({ length: '200', width: '100' }).results).toMatchObject({
      areaSqFt: 20000,
      cubicFeet: 5000,
      cubicYards: 185.19,
      bags: 2500,
    });
    expect(run({ length: '0.999' }).ok).toBe(false);
    expect(run({ length: '200.001' }).ok).toBe(false);
    expect(ok({ shape: 'circle', length: '1' }).ok).toBe(true);
    expect(ok({ shape: 'circle', length: '200' }).ok).toBe(true);
    expect(run({ shape: 'circle', length: '0.999' }).ok).toBe(false);
    expect(run({ shape: 'circle', length: '200.001' }).ok).toBe(false);
  });

  it('accepts width 1 and 100, and rejects just outside that range', () => {
    expect(ok({ width: '1' }).ok).toBe(true);
    expect(ok({ width: '100' }).ok).toBe(true);
    expect(run({ width: '0.999' }).errors.width).toBe('Width must be at least 1.');
    expect(run({ width: '100.001' }).errors.width).toBe('Width must be 100 or less.');
  });

  it('accepts a typed area of 1 and 20,000, and rejects just outside that range', () => {
    expect(ok({ shape: 'sqft', area: '1' }).results.bags).toBe(1);
    expect(ok({ shape: 'sqft', area: '20000' }).results.areaSqFt).toBe(20000);
    expect(ok({ shape: 'sqft', area: '20,000' }).results.areaSqFt).toBe(20000);
    expect(run({ shape: 'sqft', area: '0.999' }).ok).toBe(false);
    expect(run({ shape: 'sqft', area: '20001' }).errors.area).toBe('Area must be 20000 or less.');
    expect(run({ shape: 'sqft', area: '' }).errors).toHaveProperty('area');
    expect(run({ shape: 'sqft', area: 'lots' }).errors).toHaveProperty('area');
  });

  it('accepts depth 1 and 6, and rejects just outside that range', () => {
    expect(ok({ depth: '1' }).results.netDepth).toBe(1);
    expect(ok({ depth: '6' }).results.netDepth).toBe(6);
    expect(run({ depth: '0' }).errors.depth).toBe('Depth must be at least 1.');
    expect(run({ depth: '0.999' }).ok).toBe(false);
    expect(run({ depth: '6.001' }).errors.depth).toBe('Depth must be 6 or less.');
    expect(run({ depth: '' }).errors).toHaveProperty('depth');
    expect(run({ depth: 'deep' }).errors).toHaveProperty('depth');
  });

  it('accepts existing depth 0 and 6, and rejects just outside that range', () => {
    expect(ok({ existingDepth: '0' }).results.netDepth).toBe(3);
    expect(ok({ depth: '6', existingDepth: '6' }).results).toMatchObject({
      bags: 0,
      cubicFeet: 0,
      cubicYards: 0,
      netDepth: 0,
    });
    expect(run({ existingDepth: '-0.001' }).errors.existingDepth).toBe('Existing depth must be at least 0.');
    expect(run({ existingDepth: '6.001' }).errors.existingDepth).toBe('Existing depth must be 6 or less.');
    expect(run({ existingDepth: '' }).errors).toHaveProperty('existingDepth');
    expect(run({ existingDepth: 'none' }).errors).toHaveProperty('existingDepth');
  });

  it('rejects an existing depth above the depth you want', () => {
    const result = run({ depth: '3', existingDepth: '3.1' });
    expect(result.ok).toBe(false);
    expect(result.errors.existingDepth).toBe(
      'Existing depth must be the depth you want or less. A higher number would mean removing mulch.',
    );
  });

  it('accepts bag size 0.5 and 3, and rejects just outside that range', () => {
    expect(ok({ bagSize: '0.5' }).results.bagsPerYard).toBe(54);
    expect(ok({ bagSize: '3' }).results).toMatchObject({ bags: 17, bagsPerYard: 9 });
    expect(run({ bagSize: '0.499' }).errors.bagSize).toBe('Bag size must be at least 0.5.');
    expect(run({ bagSize: '0' }).ok).toBe(false);
    expect(run({ bagSize: '-2' }).ok).toBe(false);
    expect(run({ bagSize: '3.001' }).errors.bagSize).toBe('Bag size must be 3 or less.');
    expect(run({ bagSize: '' }).errors).toHaveProperty('bagSize');
    expect(run({ bagSize: 'two' }).errors).toHaveProperty('bagSize');
  });

  it('accepts outer diameter 2 and 30, and rejects just outside that range', () => {
    expect(ok({ shape: 'treeRing', outerDiameter: '2', clearanceRadius: '0.25' }).results.areaSqFt).toBe(2.9);
    expect(ok({ shape: 'treeRing', outerDiameter: '30', clearanceRadius: '1' }).ok).toBe(true);
    expect(run({ shape: 'treeRing', outerDiameter: '1.999' }).errors.outerDiameter).toBe('Outer diameter must be at least 2.');
    expect(run({ shape: 'treeRing', outerDiameter: '30.001' }).errors.outerDiameter).toBe('Outer diameter must be 30 or less.');
    expect(run({ shape: 'treeRing', outerDiameter: '' }).errors).toHaveProperty('outerDiameter');
    expect(run({ shape: 'treeRing', outerDiameter: 'wide' }).errors).toHaveProperty('outerDiameter');
  });

  it('accepts trunk clearance 0.25 and 1, and rejects just outside that range', () => {
    expect(ok({ shape: 'treeRing', outerDiameter: '30', clearanceRadius: '0.25' }).ok).toBe(true);
    expect(ok({ shape: 'treeRing', outerDiameter: '30', clearanceRadius: '1' }).ok).toBe(true);
    expect(run({ shape: 'treeRing', outerDiameter: '30', clearanceRadius: '0.249' }).errors.clearanceRadius).toBe(
      'Trunk clearance must be at least 0.25.',
    );
    expect(run({ shape: 'treeRing', clearanceRadius: '0' }).ok).toBe(false);
    expect(run({ shape: 'treeRing', clearanceRadius: '-1' }).ok).toBe(false);
    expect(run({ shape: 'treeRing', outerDiameter: '30', clearanceRadius: '1.001' }).errors.clearanceRadius).toBe(
      'Trunk clearance must be 1 or less.',
    );
    expect(run({ shape: 'treeRing', clearanceRadius: '' }).errors).toHaveProperty('clearanceRadius');
    expect(run({ shape: 'treeRing', clearanceRadius: 'four' }).errors).toHaveProperty('clearanceRadius');
  });

  it('rejects a trunk clearance that eats the whole ring', () => {
    const result = run({ shape: 'treeRing', outerDiameter: '2', clearanceRadius: '1' });
    expect(result.ok).toBe(false);
    expect(result.errors.clearanceRadius).toBe(
      'Trunk clearance must be less than half the outer diameter, or the ring has no mulch area.',
    );
    expect(ok({ shape: 'treeRing', outerDiameter: '2', clearanceRadius: '0.99' }).results.bags).toBe(1);
  });

  it('reports more than one bad field at once', () => {
    const result = run({ length: '0', width: '-5', depth: '', bagSize: '9' });
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveProperty('length');
    expect(result.errors).toHaveProperty('width');
    expect(result.errors).toHaveProperty('depth');
    expect(result.errors).toHaveProperty('bagSize');
  });

  it('keeps an exact bag count from rounding up an extra bag', () => {
    // 16 × 12 × 3 / 12 = 48 cu ft. 48 / 2 = 24 exactly, so the order is 24 bags, not 25.
    expect(ok({ length: '16', width: '12' }).results.bags).toBe(24);
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
