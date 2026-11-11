// logic.test.js: Vitest tests for logic.js (Brick Calculator).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate } = logic;
const base = { length: '20', height: '4', openings: '0', wythes: '1', brickType: 'modular', brickWaste: '5', mortarWaste: '20' };
const run = (over = {}) => calculate({ ...base, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};

describe('known answers', () => {
  // page.md worked example. Hand math (BIA TN 10): 80 x 6.75 = 540; x 1.05 = 567; 540 / 1000 x 8.1 = 4.374; x 1.2 = 5.2488.
  it('20 x 4 ft wall, modular, one wythe = 567 bricks, 5.25 cu ft mortar (page.md worked example)', () => {
    expect(ok()).toEqual({ bricks: 567, mortarCuFt: 5.25, mortarCuYd: 0.194, wallArea: 80, bricksNet: 540, mortarNet: 4.37, perSqFt: 6.75 });
  });
  // Hand math: (10 x 8 - 20) = 60 x 6.75 x 2 = 810; x 1.05 = 850.5 -> 851; mortar 810 / 1000 x 8.1 = 6.561 x 1.2 = 7.87.
  it('two wythes, 10 x 8 ft with 20 sq ft of openings = 851 bricks, 7.87 cu ft mortar (hand math)', () => {
    expect(ok({ length: '10', height: '8', openings: '20', wythes: '2' })).toMatchObject({ wallArea: 60, bricksNet: 810, bricks: 851, mortarCuFt: 7.87 });
  });
  // Hand math: custom 4.5 per sq ft, 6.0 cu ft per 1000; 100 sq ft -> 450; 0% waste -> 450 bricks, 2.7 cu ft.
  it('custom figures 4.5 per sq ft and 6.0 cu ft per 1,000 with no waste = 450 bricks, 2.7 cu ft (hand math)', () => {
    expect(ok({ length: '25', height: '4', brickType: 'custom', bricksPerSqFt: '4.5', mortarPer1000: '6', brickWaste: '0', mortarWaste: '0' })).toMatchObject({ bricks: 450, mortarCuFt: 2.7, perSqFt: 4.5 });
  });
  it('page.md wall-size table matches calculate()', () => {
    const md = readFileSync(new URL('./page.md', import.meta.url), 'utf8');
    for (const [l, h] of [[10, 3], [20, 4], [30, 6], [40, 8]]) {
      const r = ok({ length: String(l), height: String(h) });
      const row = md.split('\n').find((x) => x.startsWith(`| ${l} × ${h} |`));
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean).slice(1).map(Number);
      expect(cells).toEqual([r.wallArea, r.bricksNet, r.bricks, r.mortarCuFt]);
    }
  });
  it('custom fields are ignored for modular brick (hidden by the frame)', () => {
    expect(ok({ bricksPerSqFt: 'x' }).perSqFt).toBe(6.75);
  });
  it('returns a brick wall diagram', () => {
    expect(run().diagram).toMatchObject({ type: 'wall', length: 20, height: 4, pattern: 'brick' });
  });
});

describe('edge cases', () => {
  it('rejects zero, negative, empty, and non-numeric on the right field', () => {
    expect(run({ length: '0' }).errors).toHaveProperty('length');
    expect(run({ height: '-1' }).errors).toHaveProperty('height');
    expect(run({ openings: '' }).errors).toHaveProperty('openings');
    expect(run({ brickType: 'custom', bricksPerSqFt: 'lots', mortarPer1000: '8' }).errors).toHaveProperty('bricksPerSqFt');
    expect(calculate({}).ok).toBe(false);
  });
  it('openings must be smaller than the wall', () => {
    expect(run({ openings: '80' }).errors).toHaveProperty('openings');
    expect(run({ openings: '79.9' }).ok).toBe(true);
  });
  it('bounds: length 1 to 500, height 0.5 to 40, brick waste 0 to 25, mortar waste 0 to 50', () => {
    expect(run({ length: '1' }).ok).toBe(true);
    expect(run({ length: '500.1' }).errors).toHaveProperty('length');
    expect(run({ height: '0.5' }).ok).toBe(true);
    expect(run({ height: '0.4' }).errors).toHaveProperty('height');
    expect(run({ brickWaste: '25' }).ok).toBe(true);
    expect(run({ brickWaste: '25.1' }).errors).toHaveProperty('brickWaste');
    expect(run({ mortarWaste: '50.1' }).errors).toHaveProperty('mortarWaste');
  });
  it('very large wall stays finite', () => {
    expect(ok({ length: '500', height: '40', wythes: '2', brickWaste: '0' }).bricks).toBe(270000);
  });
  it('rejects unknown wythes and brick types', () => {
    expect(run({ wythes: '3' }).errors).toHaveProperty('wythes');
    expect(run({ brickType: 'roman' }).errors).toHaveProperty('brickType');
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
