// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Roof pitch: turns a rise and run, an angle, or a rise per 12 in of run into
// pitch (x/12), angle, percent slope, the area multiplier, rafter length per
// foot of run, and (optionally) roof area from the footprint.
import { round, validateAll } from '@tools/calculator-core';

// Which inputs each mode reads. Only these are validated, so the hidden fields
// for the other modes never block a result.
export const MODE_FIELDS = {
  riseRun: ['rise', 'run'],
  angle: ['angle'],
  pitch: ['pitchX'],
};

export const RULES = {
  rise: { label: 'Rise', min: 0, max: 36 },
  run: { label: 'Run', min: 1, max: 24 },
  angle: { label: 'Angle', min: 0, max: 75 },
  pitchX: { label: 'Pitch', min: 0, max: 24 },
  footprint: { label: 'Roof footprint area', min: 0, max: 20000, required: false },
};

export const MAX_RISE_RUN_PITCH = 12 * Math.tan((75 * Math.PI) / 180);

// 2024 IRC R905.2.2 and Table R905.1.1(2), verified on UpCodes (see meta.json sources).
export const SHINGLE_MIN_PITCH = 2;
export const DOUBLE_UNDERLAYMENT_BELOW = 4;

export const SLOPE_NOTES = {
  belowMin:
    'Below 2/12: the 2024 IRC (R905.2.2) does not allow asphalt shingles on this slope. Low-slope roofs need a different roof covering.',
  doubleUnderlayment:
    '2/12 up to 4/12: the 2024 IRC allows asphalt shingles here only with two layers of underlayment (Table R905.1.1(2)).',
  standard: '4/12 or steeper: standard (single-layer) underlayment rules apply for asphalt shingles under the 2024 IRC.',
};

// Link to the Shingle Calculator with this pitch filled in (it reads ?pitch=).
export const SHINGLE_CALCULATOR_PATH = '/shingle-calculator/';

/** "/shingle-calculator/?pitch=6" for a pitch shingles are allowed on, else null (below 2/12). */
export function shingleLink(pitch) {
  const p = round(pitch, 2);
  if (!Number.isFinite(p) || slopeBand(p) === 'belowMin') return null;
  return `${SHINGLE_CALCULATOR_PATH}?pitch=${p}`;
}

/** Pitch (rise in inches per 12 in of run) -> angle, percent, multiplier, rafter inches per foot. */
export function pitchFacts(pitch) {
  const ratio = pitch / 12;
  const multiplier = Math.sqrt(1 + ratio * ratio);
  return {
    angle: (Math.atan(ratio) * 180) / Math.PI,
    percent: ratio * 100,
    multiplier,
    rafterPerFoot: 12 * multiplier,
  };
}

/** Which asphalt-shingle slope band a pitch falls in (IRC 2024). */
export function slopeBand(pitch) {
  if (pitch < SHINGLE_MIN_PITCH) return 'belowMin';
  if (pitch < DOUBLE_UNDERLAYMENT_BELOW) return 'doubleUnderlayment';
  return 'standard';
}

/** Reference rows for 1/12 through 12/12 (used by the chart and the page.md table test). */
export function referenceTable() {
  return Array.from({ length: 12 }, (_, i) => {
    const pitch = i + 1;
    const f = pitchFacts(pitch);
    return { pitch, angle: round(f.angle, 2), percent: round(f.percent, 1), multiplier: round(f.multiplier, 3) };
  });
}

export function calculate(raw = {}) {
  const mode = raw.mode ?? 'riseRun';
  if (!MODE_FIELDS[mode]) return { ok: false, errors: { mode: 'Choose how you want to enter the slope.' } };

  const rules = { footprint: RULES.footprint };
  for (const name of MODE_FIELDS[mode]) rules[name] = RULES[name];
  const checked = validateAll(raw, rules);
  if (!checked.ok) return checked;
  const v = checked.values;

  let pitch;
  if (mode === 'riseRun') {
    pitch = (12 * v.rise) / v.run;
    // Same steepest slope the angle field allows (75 degrees, about 44.8/12).
    if (pitch > MAX_RISE_RUN_PITCH) {
      return { ok: false, errors: { rise: 'That rise and run is steeper than 75 degrees (about 44.8/12). Check both measurements.' } };
    }
  } else if (mode === 'angle') pitch = 12 * Math.tan((v.angle * Math.PI) / 180);
  else pitch = v.pitchX;

  const f = pitchFacts(pitch);
  const footprint = v.footprint ?? 0;
  const band = slopeBand(round(pitch, 2));

  return {
    ok: true,
    results: {
      pitch: round(pitch, 2),
      angle: round(f.angle, 2),
      percent: round(f.percent, 1),
      multiplier: round(f.multiplier, 3),
      rafterPerFoot: round(f.rafterPerFoot, 2),
      roofArea: footprint > 0 ? round(footprint * f.multiplier, 1) : null,
    },
    // Not a form output: ui.js shows this text under the results.
    slopeBand: band,
    slopeNote: SLOPE_NOTES[band],
    // Not a form output: ui.js points the "Estimate shingles" link here (null below 2/12).
    shingleHref: shingleLink(pitch),
    chart: referenceTable().map((r) => ({ label: String(r.pitch), value: r.angle })),
  };
}
