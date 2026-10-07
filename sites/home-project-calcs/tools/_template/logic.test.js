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

describe('known answers', () => {
  it('10 ft x 12 ft, 0% waste = 120 sq ft (hand math: 10 x 12)', () => {
    expect(ok({ length: '10', width: '12', waste: '0' })).toEqual({ area: 120, total: 120 });
  });
  it('10 ft x 12 ft, 10% waste = 132 sq ft (hand math: 120 x 1.10)', () => {
    expect(ok({ length: '10', width: '12', waste: '10' }).total).toBe(132);
  });
  it('12.5 ft x 8 ft, 5% waste = 105 sq ft (hand math: 100 x 1.05)', () => {
    expect(ok({ length: '12.5', width: '8', waste: '5' })).toEqual({ area: 100, total: 105 });
  });
});

describe('edge cases', () => {
  it('rejects zero and negative sizes', () => {
    expect(calculate({ length: '0', width: '12', waste: '0' }).errors).toHaveProperty('length');
    expect(calculate({ length: '10', width: '-1', waste: '0' }).errors).toHaveProperty('width');
  });
  it('rejects very large sizes', () => {
    expect(calculate({ length: '1e7', width: '12', waste: '0' }).errors).toHaveProperty('length');
  });
  it('rejects empty and non-numeric input', () => {
    expect(calculate({ length: '', width: '12', waste: '0' }).errors).toHaveProperty('length');
    expect(calculate({ length: 'ten', width: '12', waste: '0' }).errors).toHaveProperty('length');
    expect(calculate({}).ok).toBe(false);
  });
  it('accepts waste boundaries 0 and 50, rejects 50.1 and -1', () => {
    expect(calculate({ length: '1', width: '1', waste: '50' }).ok).toBe(true);
    expect(calculate({ length: '1', width: '1', waste: '0' }).ok).toBe(true);
    expect(calculate({ length: '1', width: '1', waste: '50.1' }).ok).toBe(false);
    expect(calculate({ length: '1', width: '1', waste: '-1' }).ok).toBe(false);
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
