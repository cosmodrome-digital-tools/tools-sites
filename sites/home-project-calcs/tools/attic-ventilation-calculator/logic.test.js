// logic.test.js: Vitest tests for logic.js (Attic Ventilation Calculator).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate } = logic;
const base = { atticArea: '1200', rule: '150', exhaustShare: '50', intakeKind: 'continuous', intakeNfa: '9', exhaustKind: 'ridge', exhaustNfa: '18' };
const run = (over = {}) => calculate({ ...base, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};

describe('known answers', () => {
  // page.md worked example. Hand math (IRC R806.2): 1200 / 150 = 8 sq ft x 144 = 1152 sq in; 576 each; 576 / 9 = 64 ft; 576 / 18 = 32 ft.
  it('1,200 sq ft at 1/150 = 1,152 sq in, 64 ft soffit, 32 ft ridge (page.md worked example)', () => {
    expect(ok()).toEqual({ requiredSqIn: 1152, requiredSqFt: 8, intakeFt: 64, intakeVents: null, exhaustFt: 32, exhaustVents: null, intakeSqIn: 576, exhaustSqIn: 576, providedSqIn: 1152, ratio: 150 });
  });
  it('same attic at 1/300 = 576 sq in, 32 ft soffit, 16 ft ridge (hand math: halves)', () => {
    expect(ok({ rule: '300' })).toMatchObject({ requiredSqIn: 576, intakeFt: 32, exhaustFt: 16 });
  });
  // Hand math: 576 / 56 = 10.3 -> 11 vents; provided 11 x 56 + 32 x 18 = 616 + 576 = 1192.
  it('individual soffit vents of 56 sq in each = 11 vents, 1,192 sq in provided (hand math)', () => {
    expect(ok({ intakeKind: 'each', intakeNfa: '56' })).toMatchObject({ intakeVents: 11, intakeFt: null, providedSqIn: 1192 });
  });
  // Hand math: 1000 / 300 x 144 = 480; 40% exhaust = 192 / 50 = 3.84 -> 4 vents; intake 288 / 9 = 32 ft.
  it('1/300 with 40% exhaust through 50 sq in box vents = 4 vents, 32 ft soffit (hand math)', () => {
    expect(ok({ atticArea: '1000', rule: '300', exhaustShare: '40', exhaustKind: 'each', exhaustNfa: '50' })).toMatchObject({ requiredSqIn: 480, exhaustVents: 4, intakeFt: 32 });
  });
  it('local ratio 1/200: 1,200 sq ft = 6 sq ft = 864 sq in (hand math)', () => {
    expect(ok({ rule: 'custom', customRatio: '200' })).toMatchObject({ requiredSqFt: 6, requiredSqIn: 864, ratio: 200 });
  });
  it('page.md attic-size table matches calculate()', () => {
    const md = readFileSync(new URL('./page.md', import.meta.url), 'utf8');
    for (const a of [800, 1000, 1200, 1500, 2000, 2500]) {
      const r = ok({ atticArea: String(a) });
      const r3 = ok({ atticArea: String(a), rule: '300' });
      const row = md.split('\n').find((x) => x.startsWith(`| ${a} |`));
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean).slice(1).map(Number);
      expect(cells).toEqual([r.requiredSqIn, r.intakeFt, r.exhaustFt, r3.requiredSqIn, r3.intakeFt, r3.exhaustFt]);
    }
  });
  it('returns an attic diagram with intake and exhaust labels', () => {
    expect(run().diagram).toMatchObject({ type: 'attic', intakeLabel: 'Intake 576 sq in: 64 ft of soffit vent', exhaustLabel: 'Exhaust 576 sq in: 32 ft of ridge vent' });
  });
});

describe('edge cases', () => {
  it('1/300 needs a 40 to 50% exhaust share (exception condition)', () => {
    expect(run({ rule: '300', exhaustShare: '39.9' }).errors).toHaveProperty('exhaustShare');
    expect(run({ rule: '300', exhaustShare: '50.1' }).errors).toHaveProperty('exhaustShare');
    expect(run({ rule: '300', exhaustShare: '40' }).ok).toBe(true);
    expect(run({ rule: '150', exhaustShare: '0' }).ok).toBe(true);
    expect(run({ rule: '150', exhaustShare: '100' }).ok).toBe(true);
  });
  it('rejects zero, negative, empty, and non-numeric on the right field', () => {
    expect(run({ atticArea: '0' }).errors).toHaveProperty('atticArea');
    expect(run({ intakeNfa: '-9' }).errors).toHaveProperty('intakeNfa');
    expect(run({ exhaustNfa: '' }).errors).toHaveProperty('exhaustNfa');
    expect(run({ exhaustShare: 'half' }).errors).toHaveProperty('exhaustShare');
    expect(calculate({}).ok).toBe(false);
  });
  it('bounds: area 50 to 20,000, NFA 1 to 500, custom ratio 50 to 600', () => {
    expect(run({ atticArea: '50' }).ok).toBe(true);
    expect(run({ atticArea: '49' }).errors).toHaveProperty('atticArea');
    expect(run({ atticArea: '20000.1' }).errors).toHaveProperty('atticArea');
    expect(run({ intakeNfa: '500' }).ok).toBe(true);
    expect(run({ intakeNfa: '500.1' }).errors).toHaveProperty('intakeNfa');
    expect(run({ rule: 'custom', customRatio: '49' }).errors).toHaveProperty('customRatio');
    expect(run({ rule: 'custom', customRatio: '600' }).ok).toBe(true);
  });
  it('very large attic stays finite', () => {
    expect(ok({ atticArea: '20000' }).requiredSqIn).toBe(19200);
  });
  it('custom ratio field is ignored unless "Other ratio" is chosen; unknown choices rejected', () => {
    expect(ok({ customRatio: 'x' }).ratio).toBe(150);
    expect(run({ rule: '250' }).errors).toHaveProperty('rule');
    expect(run({ intakeKind: 'gable' }).errors).toHaveProperty('intakeKind');
    expect(run({ exhaustKind: 'turbine' }).errors).toHaveProperty('exhaustKind');
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
