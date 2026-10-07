// ui.js: connects the shared calculator frame (inputs and results built from
// meta.json) to logic.js. No business logic here: the helper below only shows
// the size fields for the chosen shape and the extra-base field when poor soil
// is chosen. Without JavaScript the form still works; logic.js validates only
// the fields that apply either way.
import { bindCalculator } from '@tools/calculator-core/bind.js';
import { calculate } from './logic.js';

const root = document.querySelector('[data-tool="paver-patio-calculator"]');
const form = root?.querySelector('form[data-calc-form]');

const SHAPE_FIELDS = {
  rectangle: ['length', 'width'],
  circle: ['diameter'],
  area: ['area', 'perimeter'],
};

if (form) {
  const field = (name) => form.querySelector(`[data-field="${name}"]`);
  const shape = form.elements.namedItem('shape');
  const soil = form.elements.namedItem('soil');

  const sync = () => {
    const shown = SHAPE_FIELDS[shape?.value] ?? SHAPE_FIELDS.rectangle;
    for (const name of Object.values(SHAPE_FIELDS).flat()) {
      const el = field(name);
      if (el) el.hidden = !shown.includes(name);
    }
    const extra = field('extraBase');
    if (extra) extra.hidden = soil?.value !== 'poor';
  };

  shape?.addEventListener('change', sync);
  soil?.addEventListener('change', sync);
  sync();
}

bindCalculator({ calculate, root });
