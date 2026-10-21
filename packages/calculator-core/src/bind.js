/**
 * Browser-side glue used by each tool's ui.js. Generic only: it reads the
 * shared frame's form, calls the tool's calculate(), shows validation
 * messages, fills the results area, and draws the chart.
 *
 * Contract for calculate(rawInputs):
 *   rawInputs: { [inputName]: string }  (exactly what the user typed/selected)
 *   returns { ok: true, results: { [outputName]: number }, chart?: [{label, value}] }
 *        or { ok: false, errors: { [inputName]: message } }
 */
import { formatNumber } from './numbers.js';
import { renderChart } from './chart.js';
import { visibleFields } from './visibility.js';

const readShowIf = (field) => {
  try {
    return field.dataset.showIf ? JSON.parse(field.dataset.showIf) : undefined;
  } catch {
    return undefined;
  }
};

export function bindCalculator({ calculate, root = document.querySelector('[data-tool]') } = {}) {
  if (!root || typeof calculate !== 'function') return;
  const form = root.querySelector('form[data-calc-form]');
  const resultsBox = root.querySelector('[data-calc-results]');
  const chartBox = root.querySelector('[data-calc-chart]');
  if (!form || !resultsBox) return;
  const chartStyle = root.dataset.chartStyle || 'none';
  const advanced = form.querySelector('details[data-calc-advanced]');
  const fields = [...form.querySelectorAll('[data-field]')];
  const conditional = fields.filter((f) => f.dataset.showIf);
  const control = (field) => field.querySelector('input, select');

  // Conditional fields (meta.json "showIf"): hidden fields are hidden with the
  // `hidden` attribute (gone for screen readers too) and their control is
  // disabled, so FormData leaves them out of validation and calculation. The
  // typed value stays in the control and comes back when the field re-shows.
  // Without JavaScript every field shows, as before.
  const syncVisibility = () => {
    if (!conditional.length) return;
    const values = {};
    for (const f of fields) {
      const c = control(f);
      if (c) values[f.dataset.field] = c.value;
    }
    const inputs = fields.map((f) => ({ name: f.dataset.field, showIf: readShowIf(f) }));
    const visible = visibleFields(inputs, values);
    for (const f of conditional) {
      const show = visible.has(f.dataset.field);
      f.hidden = !show;
      const c = control(f);
      if (c) c.disabled = !show;
    }
    // A group (fieldset or Advanced group) whose fields are all hidden hides too.
    for (const set of form.querySelectorAll('fieldset, .calc-advanced__group')) {
      const own = [...set.querySelectorAll('[data-field]')];
      if (!own.some((f) => f.dataset.showIf)) continue;
      set.hidden = own.every((f) => f.hidden);
    }
  };

  // Advanced section: opens on load if any advanced field differs from its
  // meta.json default (a value restored by the browser or prefilled from the URL).
  const openAdvancedIfChanged = () => {
    if (!advanced) return;
    for (const f of advanced.querySelectorAll('[data-field]')) {
      const c = control(f);
      if (!c || c.disabled || f.dataset.default === undefined) continue;
      if (String(c.value).trim() !== f.dataset.default) {
        advanced.open = true;
        return;
      }
    }
  };

  const showErrors = (errors = {}) => {
    for (const field of form.querySelectorAll('[data-field]')) {
      const name = field.dataset.field;
      const input = field.querySelector('input, select');
      const msg = field.querySelector('[data-error]');
      const text = errors[name] || '';
      if (msg) msg.textContent = text;
      if (input) input.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (text && advanced && !field.hidden && advanced.contains(field)) advanced.open = true;
    }
  };

  const run = () => {
    syncVisibility();
    const raw = Object.fromEntries(new FormData(form).entries());
    let out;
    try {
      out = calculate(raw);
    } catch {
      out = { ok: false, errors: {} };
    }
    if (!out || !out.ok) {
      showErrors(out?.errors);
      resultsBox.dataset.state = 'invalid';
      if (chartBox) chartBox.innerHTML = '';
      return;
    }
    showErrors({});
    resultsBox.dataset.state = 'ok';
    for (const el of resultsBox.querySelectorAll('[data-output]')) {
      const value = out.results?.[el.dataset.output];
      const decimals = Number(el.dataset.decimals ?? 2);
      el.textContent = Number.isFinite(value) ? formatNumber(value, { decimals }) : '–';
    }
    if (chartBox) chartBox.innerHTML = renderChart(chartStyle, out.chart, { title: chartBox.dataset.title || 'Chart' });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
  });
  form.addEventListener('input', run);
  form.addEventListener('change', run);
  syncVisibility();
  openAdvancedIfChanged();
  run();
}
