import { isBlank, parseNumber } from './numbers.js';

/**
 * Validate one numeric input.
 * Returns { ok: true, value } or { ok: false, code, message }.
 * Codes: 'required', 'not_a_number', 'too_small', 'too_large', 'not_positive'.
 */
export function validateNumber(raw, { label = 'Value', min, max, required = true, positive = false } = {}) {
  if (isBlank(raw)) {
    return required ? { ok: false, code: 'required', message: `Enter ${label.toLowerCase()}.` } : { ok: true, value: undefined };
  }
  const value = parseNumber(raw);
  if (Number.isNaN(value)) return { ok: false, code: 'not_a_number', message: `${label} must be a number.` };
  if (positive && !(value > 0)) return { ok: false, code: 'not_positive', message: `${label} must be greater than 0.` };
  if (min !== undefined && value < min) return { ok: false, code: 'too_small', message: `${label} must be at least ${min}.` };
  if (max !== undefined && value > max) return { ok: false, code: 'too_large', message: `${label} must be ${max} or less.` };
  return { ok: true, value };
}

/**
 * Validate several inputs at once.
 * `rules` maps input name -> validateNumber options.
 * Returns { ok: true, values } or { ok: false, errors } where errors maps name -> message.
 */
export function validateAll(rawInputs, rules) {
  const values = {};
  const errors = {};
  for (const [name, opts] of Object.entries(rules)) {
    const result = validateNumber(rawInputs?.[name], opts);
    if (result.ok) values[name] = result.value;
    else errors[name] = result.message;
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values };
}
