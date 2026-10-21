// ui.js: connects the shared calculator frame (inputs and results built from
// meta.json) to logic.js. No business logic here. The size fields for the
// chosen shape show and hide through "showIf" in meta.json (shared frame); the
// helper below only greys out bag sizes the chosen mix isn't sold in (the size
// list comes from logic.js). Without JavaScript the form still works; logic.js
// validates only the fields for the chosen shape either way.
import { bindCalculator } from '@tools/calculator-core/bind.js';
import { BRANDS, calculate } from './logic.js';

const root = document.querySelector('[data-tool="concrete-calculator"]');
const form = root?.querySelector('form[data-calc-form]');

if (form) {
  const brand = form.elements.namedItem('brand');
  const bagSize = form.elements.namedItem('bagSize');

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

  brand?.addEventListener('change', syncBagSizes);
  syncBagSizes();
}

bindCalculator({ calculate, root });
