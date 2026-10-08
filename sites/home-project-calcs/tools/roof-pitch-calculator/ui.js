// ui.js: connects the shared calculator frame (inputs and results built from
// meta.json) to logic.js. No business logic here: the helpers below only show
// the fields for the chosen input mode, print the shingle slope note that
// logic.js returns, and point the "Estimate shingles" link at the Shingle
// Calculator with the current pitch filled in (hidden below 2/12). Without JavaScript the form still lists every field;
// logic.js validates only the fields for the chosen mode either way.
import { bindCalculator } from '@tools/calculator-core/bind.js';
import { calculate, MODE_FIELDS } from './logic.js';

const root = document.querySelector('[data-tool="roof-pitch-calculator"]');
const form = root?.querySelector('form[data-calc-form]');
const results = root?.querySelector('[data-calc-results]');

if (form) {
  const field = (name) => form.querySelector(`[data-field="${name}"]`);
  const mode = form.elements.namedItem('mode');
  const sync = () => {
    const shown = MODE_FIELDS[mode?.value] ?? MODE_FIELDS.riseRun;
    for (const name of Object.values(MODE_FIELDS).flat()) {
      const el = field(name);
      if (el) el.hidden = !shown.includes(name);
    }
  };
  mode?.addEventListener('change', sync);
  sync();
}

let note;
let shingle;
let shingleLinkEl;
if (results) {
  note = document.createElement('p');
  note.className = 'roof-slope-note';
  note.setAttribute('aria-live', 'polite');
  shingle = document.createElement('p');
  shingle.className = 'roof-shingle-link';
  shingle.hidden = true;
  shingleLinkEl = document.createElement('a');
  shingle.append(shingleLinkEl);
  results.querySelector('.calc-results__list')?.after(note, shingle);
}

bindCalculator({
  root,
  calculate: (raw) => {
    const out = calculate(raw);
    if (note) {
      note.textContent = out?.ok ? out.slopeNote : '';
      note.dataset.band = out?.ok ? out.slopeBand : '';
    }
    if (shingle && shingleLinkEl) {
      const href = out?.ok ? out.shingleHref : null;
      shingle.hidden = !href;
      if (href) {
        shingleLinkEl.href = href;
        shingleLinkEl.textContent = `Estimate shingles for a ${out.results.pitch}/12 roof in the Shingle Calculator`;
      }
    }
    return out;
  },
});
