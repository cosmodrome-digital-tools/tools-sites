// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Attic ventilation: required net free ventilating area (NFA) from the 2021
// IRC R806.2 ratio (1/150 of the vented space, or 1/300 when the exception's
// conditions are met), split between intake (soffit/eave) and exhaust (ridge
// or other upper vents), then the length of continuous vent or the number of
// individual vents for the NFA printed on your product.
import { ceilTo, round, validateNumber } from '@tools/calculator-core';

export const SQ_IN_PER_SQ_FT = 144;
// R806.2 exception: 40 to 50 percent of the required area from upper vents.
export const UPPER_MIN = 40;
export const UPPER_MAX = 50;

const read = (raw, name, label, min, max, errors) => {
  const r = validateNumber(raw[name], { label, min, max });
  if (r.ok) return r.value;
  errors[name] = r.message;
  return undefined;
};

export function calculate(raw = {}) {
  const errors = {};
  const rule = String(raw.rule ?? '150');
  if (!['150', '300', 'custom'].includes(rule)) errors.rule = 'Choose a ventilation ratio.';
  const intakeKind = String(raw.intakeKind ?? 'continuous');
  const exhaustKind = String(raw.exhaustKind ?? 'ridge');
  if (!['continuous', 'each'].includes(intakeKind)) errors.intakeKind = 'Choose continuous soffit vent or individual vents.';
  if (!['ridge', 'each'].includes(exhaustKind)) errors.exhaustKind = 'Choose ridge vent or individual vents.';
  const area = read(raw, 'atticArea', 'Attic floor area', 50, 20000, errors);
  const ratio = rule === 'custom' ? read(raw, 'customRatio', 'Ratio', 50, 600, errors) : Number(rule);
  const share = read(raw, 'exhaustShare', 'Exhaust share', 0, 100, errors);
  const intakeNfa = read(raw, 'intakeNfa', 'Intake vent NFA', 1, 500, errors);
  const exhaustNfa = read(raw, 'exhaustNfa', 'Exhaust vent NFA', 1, 500, errors);
  if (rule === '300' && share !== undefined && (share < UPPER_MIN || share > UPPER_MAX)) {
    errors.exhaustShare = `The 1/300 exception needs ${UPPER_MIN} to ${UPPER_MAX}% of the area in upper (exhaust) vents. Change the share or use 1/150.`;
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const requiredSqFt = area / ratio;
  const required = requiredSqFt * SQ_IN_PER_SQ_FT;
  const exhaust = required * (share / 100);
  const intake = required - exhaust;
  const intakeCount = ceilTo(intake / intakeNfa, 1);
  const exhaustCount = ceilTo(exhaust / exhaustNfa, 1);
  const unitIn = intakeKind === 'continuous' ? 'ft' : 'vents';
  const unitEx = exhaustKind === 'ridge' ? 'ft' : 'vents';

  return {
    ok: true,
    results: {
      requiredSqIn: round(required, 1),
      requiredSqFt: round(requiredSqFt, 2),
      intakeFt: intakeKind === 'continuous' ? intakeCount : null,
      intakeVents: intakeKind === 'each' ? intakeCount : null,
      exhaustFt: exhaustKind === 'ridge' ? exhaustCount : null,
      exhaustVents: exhaustKind === 'each' ? exhaustCount : null,
      intakeSqIn: round(intake, 1),
      exhaustSqIn: round(exhaust, 1),
      providedSqIn: round(intakeCount * intakeNfa + exhaustCount * exhaustNfa, 1),
      ratio,
    },
    chart: [
      { label: 'Intake', value: round(intake, 1) },
      { label: 'Exhaust', value: round(exhaust, 1) },
    ],
    // Attic section with intake and exhaust NFA called out (labels only).
    diagram: {
      type: 'attic',
      pitch: 6,
      intakeLabel: `Intake ${round(intake, 0).toLocaleString('en-US')} sq in: ${intakeCount} ${unitIn} of soffit vent${intakeKind === 'each' ? 's' : ''}`,
      exhaustLabel: `Exhaust ${round(exhaust, 0).toLocaleString('en-US')} sq in: ${exhaustCount} ${unitEx}${exhaustKind === 'ridge' ? ' of ridge vent' : ''}`,
      spanLabel: `Attic floor ${round(area, 0).toLocaleString('en-US')} sq ft ÷ ${round(ratio, 1)}`,
    },
  };
}
