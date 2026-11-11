// ui.js: connects the shared calculator frame to logic.js. UI wiring only
// (the pitch field for the chosen mode shows through "showIf" in meta.json):
// load accessory coverage
// presets into the editable fields, prefill
// the pitch handed over by the Roof Pitch Calculator (?pitch=6), and add a
// "Don't know your pitch?" link under the pitch field.
import { bindCalculator } from '@tools/calculator-core/bind.js';
import { calculate, pitchFromQuery, PRODUCTS } from './logic.js';

const root = document.querySelector('[data-tool="shingle-calculator"]');
const form = root?.querySelector('form[data-calc-form]');
const results = root?.querySelector('[data-calc-results]');
const COVERAGE_FIELDS = ['starterCoverage', 'ridgeCoverage', 'underlaymentCoverage'];

if (form) {
  const field = (name) => form.querySelector(`[data-field="${name}"]`);
  const mode = form.elements.namedItem('pitchMode');
  const product = form.elements.namedItem('product');

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

  product?.addEventListener('change', loadPreset);
}

// The shared results card groups the shopping list (field shingles,
// accessories, fasteners) from meta.json "group"; ui.js only adds the
// low-slope underlayment note under it.
let note;
if (results) {
  note = document.createElement('p');
  note.className = 'shingle-note';
  note.setAttribute('aria-live', 'polite');
  results.querySelector('.calc-results__list')?.after(note);
}

bindCalculator({
  root,
  calculate: (raw) => {
    const out = calculate(raw);
    if (note) note.textContent = out?.ok ? out.slopeNote : '';
    return out;
  },
});
