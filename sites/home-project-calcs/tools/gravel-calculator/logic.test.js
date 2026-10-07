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

// Shared starting point. Individual tests override the fields they care about.
const form = (over = {}) => ({
  mode: 'single',
  shape: 'rectangle',
  length: '50',
  width: '12',
  area: '600',
  depth: '4',
  surfaceDepth: '2',
  density: '1.4',
  surfaceDensity: '1.4',
  densitySource: 'estimate',
  waste: '10',
  ...over,
});

describe('known answers', () => {
  it('worked example: 50 ft x 12 ft x 4 in, 10% allowance, 1.40 tons/yd³ (hand math: 600 sq ft x 4/12 = 200 cu ft; x 1.10 = 220; 220/27 = 8.148148 yd; x 1.40 = 11.407407 tons)', () => {
    const results = ok(form());
    expect(results).toMatchObject({
      areaSqFt: 600,
      cubicFeet: 220,
      cubicYards: 8.15,
      tons: 11.41,
      yardsToOrder: 8.2,
      tonsToOrder: 11.5,
      baseCubicFeet: 220,
      baseYards: 8.15,
      baseTons: 11.41,
      surfaceCubicFeet: 0,
      surfaceYards: 0,
      surfaceTons: 0,
      densityUsed: 1.4,
    });
    expect(calculate(form()).chart).toEqual([
      { label: 'Stone', value: 10.37 },
      { label: 'Allowance', value: 1.04 },
    ]);
  });

  it('9 ft x 12 ft x 12 in, 0% allowance, 1.40 tons/yd³ = 4 cu yd and 5.6 tons (hand math: 108 sq ft x 12/12 = 108 cu ft = 4 cu yd; x 1.40 = 5.6)', () => {
    expect(ok(form({
      length: '9',
      width: '12',
      depth: '12',
      waste: '0',
    }))).toMatchObject({
      areaSqFt: 108,
      cubicFeet: 108,
      cubicYards: 4,
      tons: 5.6,
      yardsToOrder: 4,
      tonsToOrder: 5.6,
    });
  });

  it('27 sq ft x 12 in, 0% allowance, density 1 = 1 cu yd and 1 ton (hand math: 27 x 12/12 = 27 cu ft = 1 cu yd)', () => {
    expect(ok(form({
      shape: 'sqft',
      area: '27',
      depth: '12',
      waste: '0',
      density: '1',
      length: '',
      width: '',
    }))).toMatchObject({
      areaSqFt: 27,
      cubicFeet: 27,
      cubicYards: 1,
      tons: 1,
      yardsToOrder: 1,
      tonsToOrder: 1,
    });
  });

  it('circle diameter 10 ft x 12 in, 0% allowance, density 1 (hand math: area = 25π = 78.539816 sq ft; cu yd = 25π/27 = 2.909623)', () => {
    expect(ok(form({
      shape: 'circle',
      width: '10',
      depth: '12',
      waste: '0',
      density: '1',
      length: '',
    }))).toMatchObject({
      areaSqFt: 78.5,
      cubicFeet: 78.5,
      cubicYards: 2.91,
      tons: 2.91,
      yardsToOrder: 3,
      tonsToOrder: 3,
    });
  });

  it('layered 50 ft x 12 ft, base 4 in at 1.40 and surface 2 in at 1.60, 0% allowance (hand math: base 200/27 yd x 1.40 = 10.370370 tons; surface 100/27 yd x 1.60 = 5.925926 tons)', () => {
    const out = calculate(form({
      mode: 'layered',
      depth: '4',
      surfaceDepth: '2',
      density: '1.4',
      surfaceDensity: '1.6',
      waste: '0',
    }));
    expect(out.ok).toBe(true);
    expect(out.results).toMatchObject({
      areaSqFt: 600,
      cubicFeet: 300,
      cubicYards: 11.11,
      tons: 16.3,
      yardsToOrder: 11.2,
      tonsToOrder: 16.3,
      baseCubicFeet: 200,
      baseYards: 7.41,
      baseTons: 10.37,
      surfaceCubicFeet: 100,
      surfaceYards: 3.7,
      surfaceTons: 5.93,
      densityUsed: 1.4,
    });
    expect(out.chart).toEqual([
      { label: 'Base', value: 10.37 },
      { label: 'Surface', value: 5.93 },
    ]);
  });

  it('12.5 ft x 8 ft x 6 in, 5% allowance, 1.35 tons/yd³ (hand math: 100 sq ft x 0.5 = 50 cu ft; x 1.05 = 52.5; 52.5/27 x 1.35 = 2.625 tons)', () => {
    expect(ok(form({
      length: '12.5',
      width: '8',
      depth: '6',
      waste: '5',
      density: '1.35',
    }))).toMatchObject({
      areaSqFt: 100,
      cubicFeet: 52.5,
      cubicYards: 1.94,
      tons: 2.63,
      yardsToOrder: 2,
      tonsToOrder: 2.7,
    });
  });

  it('table row 10 ft x 20 ft x 4 in, 10%, 1.40 (hand math: 200 x 4/12 x 1.10 = 73.333 cu ft; /27 = 2.716049 yd; x 1.40 = 3.802469 tons, order 3.9)', () => {
    expect(ok(form({ length: '10', width: '20' }))).toMatchObject({
      cubicFeet: 73.3,
      cubicYards: 2.72,
      tons: 3.8,
      yardsToOrder: 2.8,
      tonsToOrder: 3.9,
    });
  });

  it('table row 12 ft x 30 ft x 4 in, 10%, 1.40 (hand math: 132 cu ft / 27 = 4.888889 yd x 1.40 = 6.844444 tons)', () => {
    expect(ok(form({ length: '12', width: '30' }))).toMatchObject({
      cubicFeet: 132,
      cubicYards: 4.89,
      tons: 6.84,
      yardsToOrder: 4.9,
      tonsToOrder: 6.9,
    });
  });

  it('table row 20 ft x 40 ft x 4 in, 10%, 1.40 (hand math: 293.333 cu ft / 27 = 10.864198 yd x 1.40 = 15.209877 tons)', () => {
    expect(ok(form({ length: '20', width: '40' }))).toMatchObject({
      cubicYards: 10.86,
      tons: 15.21,
      yardsToOrder: 10.9,
      tonsToOrder: 15.3,
    });
  });

  it('table row 24 ft x 40 ft x 4 in, 10%, 1.40 (hand math: 352 cu ft / 27 = 13.037037 yd x 1.40 = 18.251852 tons)', () => {
    expect(ok(form({ length: '24', width: '40' }))).toMatchObject({
      cubicFeet: 352,
      cubicYards: 13.04,
      tons: 18.25,
      yardsToOrder: 13.1,
      tonsToOrder: 18.3,
    });
  });

  it('table row layered 12 ft x 50 ft, 4 in + 2 in, both 1.40, 10% (hand math: 330 cu ft / 27 = 12.222222 yd x 1.40 = 17.111111 tons)', () => {
    const out = calculate(form({ mode: 'layered', length: '12', width: '50' }));
    expect(out.ok).toBe(true);
    expect(out.results).toMatchObject({
      cubicFeet: 330,
      cubicYards: 12.22,
      tons: 17.11,
      yardsToOrder: 12.3,
      tonsToOrder: 17.2,
      baseTons: 11.41,
      surfaceTons: 5.7,
      baseYards: 8.15,
      surfaceYards: 4.07,
    });
    expect(out.chart).toEqual([
      { label: 'Base', value: 11.41 },
      { label: 'Surface', value: 5.7 },
    ]);
  });
});

describe('mode, shape, and source behavior', () => {
  it('uses the same tons for estimate and supplier; the source label does not change the math', () => {
    const estimate = ok(form({ densitySource: 'estimate' }));
    const supplier = ok(form({ densitySource: 'supplier', density: '1.55' }));
    const estimateAtSupplierDensity = ok(form({ densitySource: 'estimate', density: '1.55' }));
    expect(supplier.tons).toBe(estimateAtSupplierDensity.tons);
    expect(supplier.tons).not.toBe(estimate.tons);
  });

  it('ignores surface depth and surface density in single-layer mode', () => {
    const clean = ok(form());
    const messy = ok(form({ surfaceDepth: '0', surfaceDensity: 'nope' }));
    expect(messy).toEqual(clean);
  });

  it('ignores length on a circle and ignores length and width when square feet are entered', () => {
    expect(calculate(form({ shape: 'circle', width: '10', depth: '12', waste: '0', density: '1', length: '-8' })).ok).toBe(true);
    expect(calculate(form({ shape: 'sqft', area: '27', depth: '12', waste: '0', density: '1', length: '', width: '0' })).ok).toBe(true);
  });

  it('ignores a blank area box on a rectangle', () => {
    expect(calculate(form({ area: '' })).ok).toBe(true);
  });

  it('accepts a comma in a square-foot area (hand math: 1,000 x 12/12 = 1,000 cu ft = 37.037037 yd)', () => {
    expect(ok(form({
      shape: 'sqft',
      area: '1,000',
      depth: '12',
      waste: '0',
      density: '1',
    }))).toMatchObject({
      areaSqFt: 1000,
      cubicFeet: 1000,
      cubicYards: 37.04,
      tons: 37.04,
      yardsToOrder: 37.1,
      tonsToOrder: 37.1,
    });
  });

  it('drops the allowance bar when compaction / waste is 0', () => {
    expect(calculate(form({ waste: '0' })).chart).toEqual([{ label: 'Stone', value: 10.37 }]);
  });

  it('rounds a 1 sq ft by 1 in job up to 0.1 ton and 0.1 cu yd (hand math: 1/12/27 = 0.003086 tons)', () => {
    const out = calculate(form({
      shape: 'sqft',
      area: '1',
      depth: '1',
      waste: '0',
      density: '1',
    }));
    expect(out.ok).toBe(true);
    expect(out.results).toMatchObject({
      cubicFeet: 0.1,
      cubicYards: 0,
      tons: 0,
      yardsToOrder: 0.1,
      tonsToOrder: 0.1,
    });
    expect(out.chart).toEqual([]);
  });
});

describe('edge cases', () => {
  it('rejects an empty form on the fields a blank form must fill', () => {
    const result = calculate({});
    expect(result.ok).toBe(false);
    for (const name of ['mode', 'shape', 'densitySource', 'depth', 'density', 'waste']) {
      expect(result.errors).toHaveProperty(name);
    }
  });

  it('rejects null, undefined, and whitespace-only input', () => {
    expect(calculate(null).ok).toBe(false);
    expect(calculate(undefined).ok).toBe(false);
    expect(calculate(form({ length: '   ' })).errors).toHaveProperty('length');
  });

  it('rejects unknown choices', () => {
    expect(calculate(form({ mode: 'double' })).errors.mode).toBe('Choose single layer or layered driveway.');
    expect(calculate(form({ shape: 'triangle' })).errors.shape).toBe('Choose rectangle, circle, or enter sq ft.');
    expect(calculate(form({ densitySource: 'lab' })).errors.densitySource).toBe('Choose a density source.');
  });

  it('rejects zero and negative length, width, area, and depth', () => {
    expect(calculate(form({ length: '0' })).errors).toHaveProperty('length');
    expect(calculate(form({ length: '-1' })).errors).toHaveProperty('length');
    expect(calculate(form({ width: '0' })).errors).toHaveProperty('width');
    expect(calculate(form({ width: '-4' })).errors).toHaveProperty('width');
    expect(calculate(form({ shape: 'sqft', area: '0' })).errors).toHaveProperty('area');
    expect(calculate(form({ shape: 'sqft', area: '-10' })).errors).toHaveProperty('area');
    expect(calculate(form({ depth: '0' })).errors).toHaveProperty('depth');
    expect(calculate(form({ depth: '-2' })).errors).toHaveProperty('depth');
  });

  it('rejects zero, negative, empty, and non-numeric surface fields in layered mode', () => {
    expect(calculate(form({ mode: 'layered', surfaceDepth: '0' })).errors).toHaveProperty('surfaceDepth');
    expect(calculate(form({ mode: 'layered', surfaceDepth: '-1' })).errors).toHaveProperty('surfaceDepth');
    expect(calculate(form({ mode: 'layered', surfaceDepth: '' })).errors).toHaveProperty('surfaceDepth');
    expect(calculate(form({ mode: 'layered', surfaceDepth: 'deep' })).errors).toHaveProperty('surfaceDepth');
    expect(calculate(form({ mode: 'layered', surfaceDensity: '0' })).errors).toHaveProperty('surfaceDensity');
    expect(calculate(form({ mode: 'layered', surfaceDensity: '-1' })).errors).toHaveProperty('surfaceDensity');
    expect(calculate(form({ mode: 'layered', surfaceDensity: '' })).errors.surfaceDensity).toBe('Enter surface density.');
    expect(calculate(form({ mode: 'layered', surfaceDensity: 'heavy' })).errors).toHaveProperty('surfaceDensity');
  });

  it('rejects zero and negative density, and negative compaction / waste', () => {
    expect(calculate(form({ density: '0' })).errors.density).toBe('Density must be at least 1.');
    expect(calculate(form({ density: '-1' })).errors).toHaveProperty('density');
    expect(calculate(form({ waste: '-1' })).errors.waste).toBe('Compaction / waste must be at least 0.');
    expect(calculate(form({ waste: '-0.1' })).errors).toHaveProperty('waste');
  });

  it('rejects very large values on every numeric input', () => {
    expect(calculate(form({ length: '1e7' })).errors).toHaveProperty('length');
    expect(calculate(form({ width: '1e7' })).errors).toHaveProperty('width');
    expect(calculate(form({ shape: 'sqft', area: '1e7' })).errors).toHaveProperty('area');
    expect(calculate(form({ depth: '1e7' })).errors).toHaveProperty('depth');
    expect(calculate(form({ mode: 'layered', surfaceDepth: '1e7' })).errors).toHaveProperty('surfaceDepth');
    expect(calculate(form({ density: '1e7' })).errors).toHaveProperty('density');
    expect(calculate(form({ mode: 'layered', surfaceDensity: '1e7' })).errors).toHaveProperty('surfaceDensity');
    expect(calculate(form({ waste: '1e7' })).errors).toHaveProperty('waste');
  });

  it('rejects empty and non-numeric input on every required number', () => {
    const blanks = [
      ['length', 'rectangle', 'single'],
      ['width', 'rectangle', 'single'],
      ['area', 'sqft', 'single'],
      ['depth', 'rectangle', 'single'],
      ['density', 'rectangle', 'single'],
      ['waste', 'rectangle', 'single'],
      ['surfaceDepth', 'rectangle', 'layered'],
      ['surfaceDensity', 'rectangle', 'layered'],
    ];
    for (const [name, shape, mode] of blanks) {
      expect(calculate(form({ shape, mode, [name]: '' })).errors, name).toHaveProperty(name);
      expect(calculate(form({ shape, mode, [name]: 'ten' })).errors, name).toHaveProperty(name);
    }
    expect(calculate(form({ length: '' })).errors.length).toBe('Enter length.');
    expect(calculate(form({ length: 'ten' })).errors.length).toBe('Length must be a number.');
  });

  it('accepts length 1 and 500, and rejects 0.999 and 500.001', () => {
    expect(calculate(form({ length: '1', width: '1' })).ok).toBe(true);
    expect(calculate(form({ length: '500' })).ok).toBe(true);
    expect(calculate(form({ length: '0.999' })).ok).toBe(false);
    expect(calculate(form({ length: '500.001' })).errors.length).toBe('Length must be 500 or less.');
  });

  it('accepts width 1 and 100, and rejects 0.999 and 100.001', () => {
    expect(calculate(form({ width: '1', length: '1' })).ok).toBe(true);
    expect(calculate(form({ shape: 'circle', width: '1', depth: '1', waste: '0', density: '1' })).ok).toBe(true);
    expect(calculate(form({ width: '100' })).ok).toBe(true);
    expect(calculate(form({ shape: 'circle', width: '100' })).ok).toBe(true);
    expect(calculate(form({ width: '0.999' })).ok).toBe(false);
    expect(calculate(form({ width: '100.001' })).errors.width).toBe('Width must be 100 or less.');
  });

  it('accepts area 1 and 50000, and rejects 0.999 and 50000.001', () => {
    expect(calculate(form({ shape: 'sqft', area: '1', depth: '1', waste: '0', density: '1' })).ok).toBe(true);
    expect(calculate(form({ shape: 'sqft', area: '50000' })).ok).toBe(true);
    expect(calculate(form({ shape: 'sqft', area: '0.999' })).errors.area).toBe('Area must be at least 1.');
    expect(calculate(form({ shape: 'sqft', area: '50000.001' })).errors.area).toBe('Area must be 50000 or less.');
  });

  it('accepts depth 1 and 24, and rejects 0.999 and 24.001', () => {
    expect(calculate(form({ depth: '1' })).ok).toBe(true);
    expect(calculate(form({ depth: '24' })).ok).toBe(true);
    expect(calculate(form({ depth: '0.999' })).errors.depth).toBe('Depth must be at least 1.');
    expect(calculate(form({ depth: '24.001' })).errors.depth).toBe('Depth must be 24 or less.');
  });

  it('accepts surface depth 1 and 12, and rejects 0.999 and 12.001', () => {
    expect(calculate(form({ mode: 'layered', surfaceDepth: '1' })).ok).toBe(true);
    expect(calculate(form({ mode: 'layered', surfaceDepth: '12' })).ok).toBe(true);
    expect(calculate(form({ mode: 'layered', surfaceDepth: '0.999' })).errors.surfaceDepth).toBe('Surface depth must be at least 1.');
    expect(calculate(form({ mode: 'layered', surfaceDepth: '12.001' })).errors.surfaceDepth).toBe('Surface depth must be 12 or less.');
  });

  it('accepts density 1 and 2, and rejects 0.999 and 2.001', () => {
    expect(calculate(form({ density: '1' })).ok).toBe(true);
    expect(calculate(form({ density: '2' })).ok).toBe(true);
    expect(calculate(form({ density: '1.0' })).ok).toBe(true);
    expect(calculate(form({ density: '0.999' })).errors.density).toBe('Density must be at least 1.');
    expect(calculate(form({ density: '2.001' })).errors.density).toBe('Density must be 2 or less.');
  });

  it('accepts surface density 1 and 2, and rejects 0.999 and 2.001', () => {
    expect(calculate(form({ mode: 'layered', surfaceDensity: '1' })).ok).toBe(true);
    expect(calculate(form({ mode: 'layered', surfaceDensity: '2' })).ok).toBe(true);
    expect(calculate(form({ mode: 'layered', surfaceDensity: '0.999' })).errors.surfaceDensity).toBe('Surface density must be at least 1.');
    expect(calculate(form({ mode: 'layered', surfaceDensity: '2.001' })).errors.surfaceDensity).toBe('Surface density must be 2 or less.');
  });

  it('accepts compaction / waste 0 and 30, and rejects 30.1', () => {
    expect(calculate(form({ waste: '0' })).ok).toBe(true);
    expect(calculate(form({ waste: '30' })).ok).toBe(true);
    expect(calculate(form({ waste: '30.1' })).errors.waste).toBe('Compaction / waste must be 30 or less.');
    expect(calculate(form({ waste: '' })).errors.waste).toBe('Enter compaction / waste.');
    expect(calculate(form({ waste: 'ten' })).errors.waste).toBe('Compaction / waste must be a number.');
  });

  it('reports length and width errors together', () => {
    const result = calculate(form({ length: '0', width: '-1' }));
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveProperty('length');
    expect(result.errors).toHaveProperty('width');
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
