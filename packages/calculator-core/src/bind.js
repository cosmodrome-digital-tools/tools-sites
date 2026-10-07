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

export function bindCalculator({ calculate, root = document.querySelector('[data-tool]') } = {}) {
  if (!root || typeof calculate !== 'function') return;
  const form = root.querySelector('form[data-calc-form]');
  const resultsBox = root.querySelector('[data-calc-results]');
  const chartBox = root.querySelector('[data-calc-chart]');
  if (!form || !resultsBox) return;
  const chartStyle = root.dataset.chartStyle || 'none';

  const showErrors = (errors = {}) => {
    for (const field of form.querySelectorAll('[data-field]')) {
      const name = field.dataset.field;
      const input = field.querySelector('input, select');
      const msg = field.querySelector('[data-error]');
      const text = errors[name] || '';
      if (msg) msg.textContent = text;
      if (input) input.setAttribute('aria-invalid', text ? 'true' : 'false');
    }
  };

  const run = () => {
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
  run();
}
