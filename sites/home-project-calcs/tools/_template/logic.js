// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Input: the raw values typed or selected in the form (strings), keyed by the
//        input "name" from meta.json.
// Output: { ok: true, results: { <outputName>: number }, chart?: [{ label, value }] }
//      or { ok: false, errors: { <inputName>: 'Plain-English message' } }
//
// TEMPLATE EXAMPLE: area of a rectangle in square feet, plus a waste allowance.
// Replace everything below with your tool's real calculation.
import { round, validateAll, withWaste } from '@tools/calculator-core';

export const TEMPLATE_EXAMPLE = true; // DELETE this line when you write the real calculation.

export const RULES = {
  length: { label: 'Length', positive: true, max: 10000 },
  width: { label: 'Width', positive: true, max: 10000 },
  waste: { label: 'Waste allowance', min: 0, max: 50 },
};

export function calculate(raw) {
  const checked = validateAll(raw, RULES);
  if (!checked.ok) return checked;

  const { length, width, waste } = checked.values;
  const area = length * width;               // square feet
  const total = withWaste(area, waste);      // square feet including waste

  return {
    ok: true,
    results: {
      area: round(area, 2),
      total: round(total, 2),
    },
    chart: [
      { label: 'Area', value: round(area, 2) },
      { label: 'With waste', value: round(total, 2) },
    ],
  };
}
