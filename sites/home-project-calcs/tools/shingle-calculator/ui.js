// ui.js: connects the shared calculator frame to logic.js. UI wiring only:
// show the pitch field that matches the chosen mode, load accessory coverage
// presets into the editable fields, render the grouped shopping list, prefill
// the pitch handed over by the Roof Pitch Calculator (?pitch=6), and add a
// "Don't know your pitch?" link under the pitch field.
import { bindCalculator } from '@tools/calculator-core/bind.js';
import { formatNumber } from '@tools/calculator-core';
import { calculate, PITCH_FIELDS, pitchFromQuery, PRODUCTS, shoppingList } from './logic.js';

const root = document.querySelector('[data-tool="shingle-calculator"]');
const form = root?.querySelector('form[data-calc-form]');
const results = root?.querySelector('[data-calc-results]');
const COVERAGE_FIELDS = ['starterCoverage', 'ridgeCoverage', 'underlaymentCoverage'];

if (form) {
  const field = (name) => form.querySelector(`[data-field="${name}"]`);
  const mode = form.elements.namedItem('pitchMode');
  const product = form.elements.namedItem('product');

  const syncMode = () => {
    const shown = PITCH_FIELDS[mode?.value] ?? PITCH_FIELDS.pitch;
    for (const name of Object.values(PITCH_FIELDS).flat()) {
      const el = field(name);
      if (el) el.hidden = !shown.includes(name);
    }
  };

  const loadPreset = () => {
    const preset = PRODUCTS[product?.value];
    if (!preset) return; // "custom" keeps whatever is typed
    for (const name of COVERAGE_FIELDS) {
      const input = form.elements.namedItem(name);
      if (input) input.value = String(preset[name]);
    }
  };

  // Typing a coverage value by hand switches the selector to "Custom".
  for (const name of COVERAGE_FIELDS) {
    form.elements.namedItem(name)?.addEventListener('input', () => {
      if (product) product.value = 'custom';
    });
  }

  // Pitch handed over from the Roof Pitch Calculator link (?pitch=6).
  const handed = pitchFromQuery(window.location.search);
  const pitchInput = form.elements.namedItem('pitch');
  if (handed !== null && pitchInput) {
    if (mode) mode.value = 'pitch';
    pitchInput.value = handed;
  }

  // "Don't know your pitch?" link under the pitch field's help text.
  const pitchField = field('pitch');
  if (pitchField) {
    const tip = document.createElement('p');
    tip.className = 'calc-help shingle-pitch-link';
    tip.innerHTML =
      handed !== null
        ? `Pitch ${handed}/12 filled in from the <a href="/roof-pitch-calculator/">Roof Pitch Calculator</a>.`
        : 'Don\'t know your pitch? <a href="/roof-pitch-calculator/">Use the Roof Pitch Calculator</a>.';
    (pitchField.querySelector('.calc-help') ?? pitchField.querySelector('input'))?.after(tip);
  }

  mode?.addEventListener('change', syncMode);
  product?.addEventListener('change', loadPreset);
  syncMode();
}

let list;
let note;
if (results) {
  note = document.createElement('p');
  note.className = 'shingle-note';
  note.setAttribute('aria-live', 'polite');
  list = document.createElement('div');
  list.className = 'shingle-list';
  results.querySelector('.calc-results__list')?.after(list, note);
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const renderList = (out) => {
  if (!list) return;
  if (!out?.ok) {
    list.innerHTML = '';
    return;
  }
  const groups = shoppingList(out.results)
    .map(
      (g) =>
        `<div class="shingle-list__group"><h4>${esc(g.group)}</h4><ul>${g.items
          .map((i) => `<li><span>${esc(i.label)}</span><strong>${formatNumber(i.qty, { decimals: 0 })} ${esc(i.unit)}</strong></li>`)
          .join('')}</ul></div>`,
    )
    .join('');
  list.innerHTML = `<h3 class="shingle-list__title">Shopping list</h3>${groups}`;
};

bindCalculator({
  root,
  calculate: (raw) => {
    const out = calculate(raw);
    renderList(out);
    if (note) note.textContent = out?.ok ? out.slopeNote : '';
    return out;
  },
});
