// ui.js: connects the shared calculator frame (inputs and results built from
// meta.json) to logic.js. No business logic here. The fields for the chosen
// input mode show and hide through "showIf" in meta.json (shared frame); the
// helpers below only print the shingle slope note that
// logic.js returns, and point the "Estimate shingles" link at the Shingle
// Calculator with the current pitch filled in (hidden below 2/12). Without JavaScript the form still lists every field;
// logic.js validates only the fields for the chosen mode either way.
import { bindCalculator } from '@tools/calculator-core/bind.js';
import { calculate } from './logic.js';

const root = document.querySelector('[data-tool="roof-pitch-calculator"]');
const results = root?.querySelector('[data-calc-results]');

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
  const jump = document.createElement('p');
  jump.className = 'roof-table-jump';
  const jumpLink = document.createElement('a');
  jumpLink.href = '#pitch-table';
  jumpLink.textContent = 'See all pitches 1/12–12/12 ↓';
  jump.append(jumpLink);
  results.querySelector('.calc-results__list')?.after(note, shingle, jump);
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
