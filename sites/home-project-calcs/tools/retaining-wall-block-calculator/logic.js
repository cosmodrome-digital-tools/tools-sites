// Blocks, caps, leveling pad, and drainage stone for a straight wall or a circle.
// Purchase counts round up. Pad and drainage yards round up to the next hundredth.
// The height flag uses the exposed height of the courses actually stacked.
import {
  INCHES_PER_FOOT,
  ceilTo,
  cuFtToCuYd,
  round,
  validateNumber,
  withWaste,
} from '@tools/calculator-core';

const SHAPES = ['straight', 'circle'];
const SURCHARGES = ['off', 'on'];

// Belgard SRW Quick Reference Install Guide (2023): pad at least 6 in after
// compaction, trench 12 in wider than the block, 12 in of drainage stone behind
// every course. The 48 / 24 inch flags are the 2015 IRC R404.4 excerpt, not a
// verified 2021 or 2024 reading.
const PAD_INCHES = 6;
const TRENCH_EXTRA_INCHES = 12;
const DRAIN_INCHES = 12;
const LIMIT_PLAIN_IN = 48;
const LIMIT_SURCHARGE_IN = 24;

function readChoice(raw, name, values, message) {
  const value = String(raw?.[name] ?? '').trim();
  if (!values.includes(value)) return { error: message };
  return { value };
}

function readNumber(raw, name, rule, errors) {
  const result = validateNumber(raw?.[name], rule);
  if (!result.ok) errors[name] = result.message;
  return result.value;
}

function roundUpToCent(value) {
  return round(ceilTo(value, 0.01), 2);
}

function roundUpToWhole(value) {
  return round(ceilTo(value, 1), 0);
}

export function calculate(raw) {
  const errors = {};
  const shape = readChoice(raw, 'wallShape', SHAPES, 'Choose a straight wall or a circle.');
  const surcharge = readChoice(raw, 'surcharge', SURCHARGES, 'Choose surcharge on or off.');
  if (shape.error) errors.wallShape = shape.error;
  if (surcharge.error) errors.surcharge = surcharge.error;

  const length = readNumber(raw, 'length', { label: 'Length or diameter', min: 2, max: 200 }, errors);
  const exposed = readNumber(raw, 'exposedHeight', { label: 'Exposed height', min: 6, max: 96 }, errors);
  const buried = readNumber(raw, 'buriedDepth', { label: 'Buried depth', min: 4, max: 12 }, errors);
  const faceLength = readNumber(raw, 'blockFaceLength', { label: 'Block face length', min: 6, max: 24 }, errors);
  const faceHeight = readNumber(raw, 'blockFaceHeight', { label: 'Block face height', min: 3, max: 12 }, errors);
  const blockDepth = readNumber(raw, 'blockDepth', { label: 'Block depth', min: 6, max: 18 }, errors);
  const capLength = readNumber(raw, 'capLength', { label: 'Cap length', min: 6, max: 24 }, errors);
  const waste = readNumber(raw, 'blockWaste', { label: 'Block waste', min: 0, max: 15 }, errors);
  const density = readNumber(raw, 'density', { label: 'Pad density', min: 1, max: 2 }, errors);

  if (Object.keys(errors).length) return { ok: false, errors };

  const courses = roundUpToWhole((exposed + buried) / faceHeight);
  const stackHeight = courses * faceHeight;
  const builtExposed = stackHeight - buried;

  const circle = shape.value === 'circle';
  const runInches = (circle ? Math.PI * length : length) * INCHES_PER_FOOT;
  const blocksPerCourse = roundUpToWhole(runInches / faceLength);
  const blocksToBuy = roundUpToWhole(withWaste(blocksPerCourse * courses, waste));
  const capsToBuy = roundUpToWhole(runInches / capLength);

  const padThickFt = PAD_INCHES / INCHES_PER_FOOT;
  const drainThickFt = DRAIN_INCHES / INCHES_PER_FOOT;
  const depthFt = blockDepth / INCHES_PER_FOOT;
  const stackFt = stackHeight / INCHES_PER_FOOT;

  let padCuFt;
  let drainCuFt;
  let pipeFt;
  if (!circle) {
    const padWidthFt = (blockDepth + TRENCH_EXTRA_INCHES) / INCHES_PER_FOOT;
    padCuFt = length * padWidthFt * padThickFt;
    drainCuFt = length * drainThickFt * stackFt;
    pipeFt = length;
  } else {
    const innerRadius = length / 2;
    const padInner = Math.max(0, innerRadius - padThickFt);
    const padOuter = innerRadius + depthFt + padThickFt;
    padCuFt = Math.PI * (padOuter ** 2 - padInner ** 2) * padThickFt;
    const drainInner = innerRadius + depthFt;
    const drainOuter = drainInner + drainThickFt;
    drainCuFt = Math.PI * (drainOuter ** 2 - drainInner ** 2) * stackFt;
    pipeFt = 2 * Math.PI * drainInner;
  }

  const padYardsExact = cuFtToCuYd(padCuFt);
  const citedLimit = surcharge.value === 'on' ? LIMIT_SURCHARGE_IN : LIMIT_PLAIN_IN;
  const inchesOver = Math.max(0, builtExposed - citedLimit);

  return {
    ok: true,
    results: {
      blocksToBuy,
      capsToBuy,
      engineerCheck: inchesOver > 0 ? 1 : 0,
      courses,
      blocksPerCourse,
      stackHeight: round(stackHeight, 2),
      builtExposed: round(builtExposed, 2),
      padYards: roundUpToCent(padYardsExact),
      padTons: roundUpToCent(padYardsExact * density),
      drainageYards: roundUpToCent(cuFtToCuYd(drainCuFt)),
      drainpipeFt: roundUpToWhole(pipeFt),
      citedLimitIn: citedLimit,
      inchesOver: round(inchesOver, 2),
    },
    chart: [
      { label: 'Blocks', value: blocksToBuy },
      { label: 'Caps', value: capsToBuy },
    ],
  };
}
