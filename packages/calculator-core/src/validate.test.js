import { describe, expect, it } from 'vitest';
import { validateAll, validateNumber } from './validate.js';

describe('validateNumber', () => {
  it('accepts in-range numbers', () => {
    expect(validateNumber('10', { min: 0, max: 100 })).toEqual({ ok: true, value: 10 });
  });
  it('returns clear error codes', () => {
    expect(validateNumber('', { label: 'Length' }).code).toBe('required');
    expect(validateNumber('x', { label: 'Length' }).code).toBe('not_a_number');
    expect(validateNumber('-1', { min: 0 }).code).toBe('too_small');
    expect(validateNumber('1e9', { max: 1000 }).code).toBe('too_large');
    expect(validateNumber('0', { positive: true }).code).toBe('not_positive');
  });
  it('allows optional blanks', () => {
    expect(validateNumber('', { required: false })).toEqual({ ok: true, value: undefined });
  });
});

describe('validateAll', () => {
  it('collects every error', () => {
    const r = validateAll({ a: '', b: '2' }, { a: { label: 'A' }, b: { label: 'B', max: 1 } });
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors)).toEqual(['a', 'b']);
  });
  it('returns parsed values', () => {
    expect(validateAll({ a: '1.5' }, { a: {} })).toEqual({ ok: true, values: { a: 1.5 } });
  });
});
