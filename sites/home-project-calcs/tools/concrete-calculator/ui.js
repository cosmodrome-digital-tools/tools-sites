// ui.js: connects the shared calculator frame (inputs and results built from
// meta.json) to logic.js. No business logic here: the two helpers below only
// show the size fields for the chosen shape and grey out bag sizes the chosen
// mix isn't sold in (the size list comes from logic.js). Without JavaScript
// the form still works; logic.js validates every value either way.
import { bindCalculator } from '@tools/calculator-core/bind.js';
import { BRANDS, calculate } from './logic.js';

const root = document.querySelector('[data-tool="concrete-calculator"]');
const form = root?.querySelector('form[data-calc-form]');

if (form) {
  const fieldsetOf = (name) => form.querySelector(`[data-field="${name}"]`)?.closest('fieldset');
  const slabSet = fieldsetOf('length');
  const columnSet = fieldsetOf('diameter');
  const shape = form.elements.namedItem('shape');
  const brand = form.elements.namedItem('brand');
  const bagSize = form.elements.namedItem('bagSize');

  const syncShape = () => {
    const isColumn = shape?.value === 'column';
    if (slabSet) slabSet.hidden = isColumn;
    if (columnSet) columnSet.hidden = !isColumn;
  };

  const syncBagSizes = () => {
    const yields = BRANDS[brand?.value]?.yields;
    if (!yields || !bagSize) return;
    const sizes = Object.keys(yields).map(Number);
    for (const option of bagSize.options) option.disabled = !sizes.includes(Number(option.value));
    if (!sizes.includes(Number(bagSize.value))) {
      // Switch to the closest size this mix is sold in, then recalculate.
      const current = Number(bagSize.value);
      const closest = sizes.reduce((a, b) => (Math.abs(b - current) < Math.abs(a - current) ? b : a));
      bagSize.value = String(closest);
      bagSize.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  shape?.addEventListener('change', syncShape);
  brand?.addEventListener('change', syncBagSizes);
  syncShape();
  syncBagSizes();
}

bindCalculator({ calculate, root });
