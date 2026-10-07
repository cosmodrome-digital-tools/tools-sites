import { describe, expect, it } from 'vitest';
import { ceilTo, formatNumber, isBlank, parseNumber, round } from './numbers.js';

describe('parseNumber', () => {
  it('parses plain and comma-grouped numbers', () => {
    expect(parseNumber('12')).toBe(12);
    expect(parseNumber(' 1,250.5 ')).toBe(1250.5);
    expect(parseNumber('.5')).toBe(0.5);
    expect(parseNumber(-3)).toBe(-3);
  });
  it('returns NaN for empty or non-numeric input', () => {
    for (const v of ['', '   ', 'abc', '12ft', '1.2.3', null, undefined, Infinity, NaN]) {
      expect(Number.isNaN(parseNumber(v))).toBe(true);
    }
  });
});

describe('isBlank', () => {
  it('detects blank values', () => {
    expect(isBlank('')).toBe(true);
    expect(isBlank('  ')).toBe(true);
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank('0')).toBe(false);
    expect(isBlank(0)).toBe(false);
  });
});

describe('round / ceilTo', () => {
  it('rounds half away from zero', () => {
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(-2.5)).toBe(-3);
    expect(round(2.345, 1)).toBe(2.3);
  });
  it('rounds up to whole steps', () => {
    expect(ceilTo(4.01)).toBe(5);
    expect(ceilTo(4)).toBe(4);
    expect(ceilTo(0.3 * 3, 0.9)).toBe(0.9);
    expect(Number.isNaN(ceilTo(1, 0))).toBe(true);
  });
});

describe('formatNumber', () => {
  it('formats US style', () => {
    expect(formatNumber(1234.567)).toBe('1,234.57');
    expect(formatNumber(2, { decimals: 2, minDecimals: 2 })).toBe('2.00');
    expect(formatNumber(NaN)).toBe('');
  });
});
