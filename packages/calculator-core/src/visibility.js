/**
 * Conditional fields ("showIf" in meta.json inputs). Pure helpers so the
 * rules can be unit-tested without a DOM; bind.js applies them in the page.
 *
 * A condition names another input and the value(s) that make this field show:
 *   { "field": "product", "equals": "batts" }
 *   { "field": "shape", "in": ["rectangle", "area"] }
 *   { "field": "mode", "notEquals": "simple" }
 * An array of conditions means all must be true.
 */
export function conditionsOf(showIf) {
  if (!showIf) return [];
  return Array.isArray(showIf) ? showIf : [showIf];
}

function one(cond, values) {
  if (!cond || typeof cond.field !== 'string') return true;
  const v = values[cond.field];
  if (v === undefined) return false; // controlling field is itself hidden or missing
  const s = String(v);
  if ('equals' in cond) return s === String(cond.equals);
  if ('notEquals' in cond) return s !== String(cond.notEquals);
  if (Array.isArray(cond.in)) return cond.in.map(String).includes(s);
  return true;
}

/** True when the field should be shown for the current form values. */
export function isShown(showIf, values = {}) {
  return conditionsOf(showIf).every((c) => one(c, values));
}

/**
 * Resolves which inputs are visible, in declaration order, so a field whose
 * controller is hidden is hidden too. inputs: [{ name, showIf? }],
 * values: { name: string }. Returns a Set of visible input names.
 */
export function visibleFields(inputs, values = {}) {
  let shown = new Set(inputs.map((i) => i.name));
  // Repeat until stable so declaration order doesn't matter (lists are small).
  for (let pass = 0; pass <= inputs.length; pass++) {
    const visibleValues = Object.fromEntries(Object.entries(values).filter(([k]) => shown.has(k)));
    const next = new Set(inputs.filter((i) => isShown(i.showIf, visibleValues)).map((i) => i.name));
    const same = next.size === shown.size && [...next].every((n) => shown.has(n));
    shown = next;
    if (same) break;
  }
  return shown;
}

/** Drops hidden inputs from a raw form object (what calculate() receives). */
export function onlyVisible(raw, visible) {
  return Object.fromEntries(Object.entries(raw).filter(([k]) => visible.has(k)));
}
