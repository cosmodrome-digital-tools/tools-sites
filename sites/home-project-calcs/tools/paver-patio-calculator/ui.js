// ui.js: connects the shared calculator frame (inputs and results built from
// meta.json) to logic.js. No business logic here. The size fields for the
// chosen shape and the extra-base field for poor soil show and hide through
// "showIf" in meta.json (shared frame). Without JavaScript the form still
// works; logic.js validates only the fields that apply either way.
import { bindCalculator } from '@tools/calculator-core/bind.js';
import { calculate } from './logic.js';

const root = document.querySelector('[data-tool="paver-patio-calculator"]');

bindCalculator({ calculate, root });
