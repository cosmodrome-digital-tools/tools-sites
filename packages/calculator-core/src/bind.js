/**
 * Browser-side glue used by each tool's ui.js. Generic only: it reads the
 * shared frame's form, calls the tool's calculate(), shows validation
 * messages, fills the results card, and draws the chart and diagram.
 *
 * Contract for calculate(rawInputs):
 *   rawInputs: { [inputName]: string }  (exactly what the user typed/selected)
 *   returns { ok: true, results: { [outputName]: number|null },
 *             chart?: [{label, value}], chartUnit?, chartXLabel?, diagram?: {type, ...} }
 *        or { ok: false, errors: { [inputName]: message } }
 *
 * Progressive enhancements (all optional, nothing is lost without them):
 *  - inputs prefill from the URL query (?length=12&width=10), so shared links reopen the same estimate;
 *  - unit toggle for rows that show one quantity in two US units;
 *  - Copy (plain-text summary), Share (Web Share API, else copies the link), Print;
 *  - a small sticky summary of the headline number on phones while the form is on screen;
 *  - in-page links into a closed <details> section open it.
 */
import { formatFraction, formatNumber } from './numbers.js';
import { renderChart } from './chart.js';
import { renderDiagram } from './diagram.js';
import { visibleFields } from './visibility.js';

const readShowIf = (field) => {
  try {
    return field.dataset.showIf ? JSON.parse(field.dataset.showIf) : undefined;
  } catch {
    return undefined;
  }
};

/** Display text for one output value (shared with tests). */
export function formatOutput(value, { decimals = 2, format } = {}) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '–';
  if (format === 'yesno') return value ? 'Yes' : 'No';
  if (format === 'fraction') return formatFraction(value);
  return formatNumber(value, { decimals });
}

/** Opens every closed <details> that contains the element (for #anchors and find-in-page). */
export function openAncestors(el) {
  for (let d = el?.closest?.('details'); d; d = d.parentElement?.closest('details')) d.open = true;
}

export function bindCalculator({ calculate, root = document.querySelector('[data-tool]') } = {}) {
  if (!root || typeof calculate !== 'function') return;
  const form = root.querySelector('form[data-calc-form]');
  const resultsBox = root.querySelector('[data-calc-results]');
  const chartBox = root.querySelector('[data-calc-chart]');
  const diagramBox = root.querySelector('[data-calc-diagram]');
  if (!form || !resultsBox) return;
  const chartStyle = root.dataset.chartStyle || 'none';
  const advanced = form.querySelector('details[data-calc-advanced]');
  const fields = [...form.querySelectorAll('[data-field]')];
  const conditional = fields.filter((f) => f.dataset.showIf);
  const control = (field) => field.querySelector('input, select');
  const title = root.querySelector('h1')?.textContent?.trim() || document.title;

  // Prefill from the URL (?name=value) for links made with Share. Unknown names are ignored.
  try {
    const params = new URLSearchParams(window.location.search);
    for (const f of fields) {
      const c = control(f);
      const v = params.get(f.dataset.field);
      if (!c || v === null || v.length > 40) continue;
      if (c.tagName === 'SELECT' && ![...c.options].some((o) => o.value === v)) continue;
      c.value = v;
    }
  } catch {
    /* no URL support: keep defaults */
  }

  // Conditional fields (meta.json "showIf"): hidden fields are hidden with the
  // `hidden` attribute (gone for screen readers too) and their control is
  // disabled, so FormData leaves them out of validation and calculation.
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
    for (const set of form.querySelectorAll('fieldset, .calc-advanced__group')) {
      const own = [...set.querySelectorAll('[data-field]')];
      if (!own.some((f) => f.dataset.showIf)) continue;
      set.hidden = own.every((f) => f.hidden);
    }
  };

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

  // Sticky phone summary of the headline number (created here, so no JS = no bar).
  const head = resultsBox.querySelector('.calc-primary');
  let sticky;
  if (head && 'IntersectionObserver' in window) {
    sticky = document.createElement('a');
    sticky.className = 'calc-sticky';
    sticky.href = '#results';
    sticky.hidden = true;
    root.append(sticky);
    let formOn = false;
    let resultsOn = true;
    const update = () => {
      sticky.hidden = !(formOn && !resultsOn && resultsBox.dataset.state === 'ok');
    };
    new IntersectionObserver((e) => {
      formOn = e[0].isIntersecting;
      update();
    }).observe(form);
    new IntersectionObserver((e) => {
      resultsOn = e[0].isIntersecting || e[0].boundingClientRect.top < 0;
      update();
    }, { rootMargin: '0px 0px -10% 0px' }).observe(head);
    sticky._update = update;
  }

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
      sticky?._update();
      return;
    }
    showErrors({});
    resultsBox.dataset.state = 'ok';
    for (const el of resultsBox.querySelectorAll('[data-output]')) {
      const value = out.results?.[el.dataset.output];
      el.textContent = formatOutput(value, { decimals: Number(el.dataset.decimals ?? 2), format: el.dataset.format });
    }
    // Rows with no value for this input (e.g. an optional extra left blank) are hidden.
    for (const row of resultsBox.querySelectorAll('[data-row]')) {
      row.hidden = [...row.querySelectorAll('[data-output]')].every((el) => el.textContent === '–');
    }
    for (const g of resultsBox.querySelectorAll('.calc-breakdown__group')) {
      g.hidden = [...g.querySelectorAll('[data-row]')].every((r) => r.hidden);
    }
    if (chartBox) {
      chartBox.innerHTML = renderChart(chartStyle, out.chart, {
        title: chartBox.dataset.title || 'Chart',
        unit: out.chartUnit ?? chartBox.dataset.unit ?? '',
        xLabel: out.chartXLabel ?? chartBox.dataset.xLabel ?? '',
      });
    }
    if (diagramBox && out.diagram) {
      const svg = renderDiagram(out.diagram, { title, id: 'dg' });
      if (svg) diagramBox.innerHTML = svg;
    }
    if (sticky && head) {
      const label = head.querySelector('.calc-primary__label')?.textContent ?? '';
      const value = head.querySelector('.calc-primary__value')?.textContent?.trim() ?? '';
      sticky.textContent = `${label}: ${value} · See results`;
      sticky._update();
    }
  };

  // Unit toggle.
  const toggle = resultsBox.querySelector('[data-unit-toggle]');
  if (toggle) {
    toggle.hidden = false;
    resultsBox.classList.add('has-unit-toggle');
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-unit-index]');
      if (!btn) return;
      resultsBox.dataset.unit = btn.dataset.unitIndex;
      for (const b of toggle.querySelectorAll('button')) b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
    });
  }

  // Copy / Share / Print.
  const actions = resultsBox.querySelector('[data-calc-actions]');
  const status = resultsBox.querySelector('[data-calc-status]');
  const say = (msg) => {
    if (!status) return;
    status.textContent = msg;
    clearTimeout(say.t);
    say.t = setTimeout(() => (status.textContent = ''), 4000);
  };
  const shareUrl = () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    for (const f of fields) {
      const c = control(f);
      if (!c || c.disabled) continue;
      if (String(c.value) !== (f.dataset.default ?? '')) url.searchParams.set(f.dataset.field, c.value);
    }
    return url.toString();
  };
  const summary = () => {
    const lines = [`${title}`, '', 'Inputs:'];
    for (const f of fields) {
      const c = control(f);
      if (!c || c.disabled || f.hidden) continue;
      const label = f.querySelector('label')?.textContent?.trim() ?? f.dataset.field;
      const value = c.tagName === 'SELECT' ? c.options[c.selectedIndex]?.text : c.value;
      lines.push(`- ${label}: ${value}`);
    }
    lines.push('', 'Results:');
    if (head) lines.push(`- ${head.querySelector('.calc-primary__label')?.textContent}: ${head.querySelector('.calc-primary__value')?.textContent?.trim()}`);
    const unitIndex = resultsBox.dataset.unit ?? '0';
    for (const row of resultsBox.querySelectorAll('[data-row]')) {
      if (row.hidden) continue;
      const parts = [...row.querySelectorAll('.calc-result__unitval')];
      const shown = parts.filter((s) => s.dataset.unitIndex === undefined || s.dataset.unitIndex === unitIndex);
      const text = parts.length ? (shown.length ? shown : parts).map((s) => s.textContent.trim()).join(' / ') : row.querySelector('dd')?.textContent?.trim();
      lines.push(`- ${row.querySelector('dt')?.textContent?.trim()}: ${text}`);
    }
    const notice = resultsBox.querySelector('[data-results-notice]')?.textContent?.trim();
    if (notice) lines.push('', notice);
    lines.push(shareUrl());
    return lines.join('\n');
  };
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };
  if (actions) {
    actions.hidden = false;
    const shareBtn = actions.querySelector('[data-action="share"]');
    if (shareBtn && !navigator.share && !navigator.clipboard) shareBtn.hidden = true;
    actions.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'print') {
        window.print();
      } else if (action === 'copy') {
        say((await copyText(summary())) ? 'Results copied as text.' : 'Copy is blocked in this browser. Select the results and copy them instead.');
      } else if (action === 'share') {
        const url = shareUrl();
        if (navigator.share) {
          try {
            await navigator.share({ title, text: `${title}: my estimate`, url });
            return;
          } catch (err) {
            if (err?.name === 'AbortError') return;
          }
        }
        say((await copyText(url)) ? 'Link copied. It reopens this estimate with your numbers.' : `Copy this link: ${url}`);
      }
    });
  }

  // In-page links (e.g. "#pitch-table") into a closed <details> open it first.
  const openHash = () => {
    if (!window.location.hash) return;
    let target;
    try {
      target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    } catch {
      return;
    }
    if (target) {
      openAncestors(target);
      if (target.tagName === 'DETAILS') target.open = true;
    }
  };
  window.addEventListener('hashchange', openHash);
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (el) {
      openAncestors(el);
      if (el.tagName === 'DETAILS') el.open = true;
    }
  });
  openHash();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
    resultsBox.querySelector('.calc-primary')?.scrollIntoView?.({ block: 'nearest' });
  });
  form.addEventListener('input', run);
  // "Reset to defaults" restores the meta.json values; recalculate once the browser has reset the fields.
  form.addEventListener('reset', () => setTimeout(() => {
    run();
    resultsBox.querySelector('.calc-primary')?.scrollIntoView?.({ block: 'nearest' });
  }));
  form.addEventListener('change', run);
  syncVisibility();
  openAdvancedIfChanged();
  run();
}
