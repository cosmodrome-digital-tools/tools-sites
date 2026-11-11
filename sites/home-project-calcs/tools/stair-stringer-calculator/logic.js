// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Stair stringer: number of risers and treads, exact riser height, total run,
// stringer length and angle for a total rise, with a code check against the
// IRC riser/tread limits (2021 IRC R311.7.5.1 / R311.7.5.2, renumbered
// R318.7.5.1 / R318.7.5.2 in the 2024 IRC) and the 3/8 in uniformity rule.
import { ceilTo, formatFraction, round, validateAll } from '@tools/calculator-core';

// IRC limits (meta.json sources): riser at most 7 3/4 in, tread at least 10 in,
// largest vs smallest riser (or tread) in a flight within 3/8 in.
export const IRC_MAX_RISER = 7.75;
export const IRC_MIN_TREAD = 10;
export const IRC_UNIFORMITY = 0.375;

export const RULES = {
  totalRise: { label: 'Total rise', min: 6, max: 200 },
  maxRiser: { label: 'Maximum riser height', min: 4, max: 9 },
  tread: { label: 'Tread depth (run per step)', min: 8, max: 14 },
  nosing: { label: 'Nosing', min: 0, max: 1.5 },
};

const MAX_RISERS = 30;

/** Riser height marked on the stringer: rounded to the nearest 1/16 in. */
export const toSixteenth = (inches) => Math.round(inches * 16) / 16;

/** One straight flight: risers, treads (one fewer: the top step is the deck/floor), run, stringer. */
function flight(risers, riserHeight, tread) {
  const rise = risers * riserHeight;
  const run = (risers - 1) * tread;
  return { risers, treads: risers - 1, rise, run, stringer: Math.hypot(rise, run) };
}

export function calculate(raw = {}) {
  const landing = String(raw.landing ?? 'no');
  const errors = {};
  if (!['no', 'yes'].includes(landing)) errors.landing = 'Choose with or without a landing.';
  const checked = validateAll(raw, RULES);
  if (!checked.ok) Object.assign(errors, checked.errors);
  if (Object.keys(errors).length) return { ok: false, errors };

  const { totalRise, maxRiser, tread, nosing } = checked.values;
  // Fewest risers that keep every riser at or under the maximum.
  const risers = ceilTo(totalRise / maxRiser, 1);
  if (risers > MAX_RISERS) {
    return { ok: false, errors: { totalRise: `That rise needs more than ${MAX_RISERS} risers. Check the measurement or split the stair into more flights.` } };
  }
  const minRisers = landing === 'yes' ? 2 : 1;
  if (risers < minRisers) {
    return { ok: false, errors: { landing: 'A landing needs at least two risers. Turn the landing off for a single step.' } };
  }
  const riserHeight = totalRise / risers;

  // Without a landing: one flight. With a landing: two flights split as evenly as possible.
  const flights = landing === 'yes' ? [Math.ceil(risers / 2), Math.floor(risers / 2)] : [risers];
  const parts = flights.map((n) => flight(n, riserHeight, tread));
  const longest = parts[0];
  const totalRun = parts.reduce((s, f) => s + f.run, 0);
  const treads = parts.reduce((s, f) => s + f.treads, 0);

  // Layout check: marking every riser at the same 1/16 in reading adds up the
  // rounding over the flight; the leftover lands on one step.
  const marked = toSixteenth(riserHeight);
  const layoutError = Math.abs(marked * longest.risers - longest.risers * riserHeight);
  const angle = (Math.atan(riserHeight / tread) * 180) / Math.PI;

  return {
    ok: true,
    results: {
      risers,
      riserHeight: round(riserHeight, 4),
      treads,
      stringerLength: round(longest.stringer, 2),
      treadDepth: tread,
      treadBoard: round(tread + nosing, 3),
      totalRun: round(totalRun, 2),
      angle: round(angle, 1),
      boardLength: ceilTo(longest.stringer / 12 / 2, 1) * 2,
      riserCheck: riserHeight <= IRC_MAX_RISER + 1e-9 ? 1 : 0,
      treadCheck: tread >= IRC_MIN_TREAD - 1e-9 ? 1 : 0,
      uniformityCheck: layoutError <= IRC_UNIFORMITY + 1e-9 ? 1 : 0,
      layoutError: round(layoutError, 3),
      flightOneRisers: parts.length > 1 ? parts[0].risers : null,
      flightTwoRisers: parts.length > 1 ? parts[1].risers : null,
    },
    // Stringer profile of the longest flight (labels only).
    diagram: {
      type: 'stairs',
      risers: longest.risers,
      riserHeight,
      treadDepth: tread,
      totalRise: longest.rise,
      totalRun: longest.run,
      stringerLength: longest.stringer,
      riserLabel: `${formatFraction(riserHeight)} in`,
      totalRiseLabel: `${formatFraction(longest.rise)} in`,
      totalRunLabel: `${formatFraction(longest.run)} in`,
      stringerLabel: `${formatFraction(longest.stringer)} in`,
      topLabel: landing === 'yes' ? 'Landing' : 'Deck / upper floor',
    },
  };
}
