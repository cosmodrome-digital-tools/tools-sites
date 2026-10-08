// ui.js: connects the shared calculator frame (inputs and results built from
// meta.json) to logic.js. No business logic here. Usually needs no changes.
import { bindCalculator } from '@tools/calculator-core/bind.js';
import { calculate } from './logic.js';

bindCalculator({ calculate });
