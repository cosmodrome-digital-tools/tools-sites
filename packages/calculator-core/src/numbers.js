/**
 * Parse a user-typed value into a finite number.
 * Accepts numbers or strings like "1,250.5" and " 12 ". Returns NaN for
 * empty or non-numeric input so callers can tell "empty" from "bad" via isBlank().
 */
export function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value !== 'string') return NaN;
  const cleaned = value.trim().replace(/,/g, '');
  if (cleaned === '' || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

/** True for undefined, null, or a string that is empty after trimming. */
export function isBlank(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

/** Round half away from zero to a number of decimals (avoids 1.005 -> 1.00 float surprises). */
export function round(value, decimals = 0) {
  if (!Number.isFinite(value)) return NaN;
  const factor = 10 ** decimals;
  const shifted = Math.abs(value) * factor;
  const rounded = Math.round(Number((shifted).toPrecision(15))) / factor;
  return Math.sign(value) * rounded || 0;
}

/** Round up to the next multiple of `step` (e.g. whole bags). */
export function ceilTo(value, step = 1) {
  if (!Number.isFinite(value) || !(step > 0)) return NaN;
  return Math.ceil(Number((value / step).toPrecision(15))) * step;
}

/** Format a number for display in US English, e.g. 1234.5 -> "1,234.5". */
export function formatNumber(value, { decimals = 2, minDecimals = 0 } = {}) {
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: Math.min(minDecimals, decimals),
  }).format(value);
}

/**
 * Inches as a tape-measure reading to the nearest 1/16 in, e.g. 7.4375 -> "7 7/16".
 * Whole numbers stay plain ("8"); fractions are reduced ("7 1/2").
 */
export function formatFraction(value, { denominator = 16 } = {}) {
  if (!Number.isFinite(value)) return '';
  const sign = value < 0 ? '-' : '';
  let whole = Math.floor(Math.abs(value));
  let num = Math.round((Math.abs(value) - whole) * denominator);
  let den = denominator;
  if (num === den) {
    whole += 1;
    num = 0;
  }
  while (num && num % 2 === 0 && den % 2 === 0) {
    num /= 2;
    den /= 2;
  }
  if (!num) return `${sign}${formatNumber(whole, { decimals: 0 })}`;
  return `${sign}${whole ? `${formatNumber(whole, { decimals: 0 })} ` : ''}${num}/${den}`;
}
