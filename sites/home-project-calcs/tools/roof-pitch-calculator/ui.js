// ui.js: connects the shared calculator frame (inputs and results built from
// meta.json) to logic.js. No business logic here: the helpers below only show
// the fields for the chosen input mode, and print the shingle slope note that
// logic.js returns. Without JavaScript the form still lists every field;
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
if (results) {
  note = document.createElement('p');
  note.className = 'roof-slope-note';
  note.setAttribute('aria-live', 'polite');
  results.querySelector('.calc-results__list')?.after(note);
}

bindCalculator({
  root,
  calculate: (raw) => {
    const out = calculate(raw);
    if (note) {
      note.textContent = out?.ok ? out.slopeNote : '';
      note.dataset.band = out?.ok ? out.slopeBand : '';
    }
    return out;
  },
});
