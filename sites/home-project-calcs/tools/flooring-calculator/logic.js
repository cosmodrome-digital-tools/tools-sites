// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Flooring: total area of up to four rooms entered in feet and inches, a
// layout-based waste allowance (Tarkett ProGen LVP: 10% straight, 15%
// diagonal; any other layout uses the visitor's own percentage), boxes to buy
// from the coverage on the box label, and the square feet left over.
import { ceilTo, round, validateNumber } from '@tools/calculator-core';

export const LAYOUT_WASTE = { straight: 10, diagonal: 15 };
export const MAX_ROOMS = 4;

const ROOM_FIELDS = (n) => [
  [`room${n}LengthFt`, 'Length (feet)', 0, 100],
  [`room${n}LengthIn`, 'Length (inches)', 0, 11.99],
  [`room${n}WidthFt`, 'Width (feet)', 0, 100],
  [`room${n}WidthIn`, 'Width (inches)', 0, 11.99],
];

const read = (raw, name, label, min, max, errors) => {
  const r = validateNumber(raw[name], { label, min, max });
  if (r.ok) return r.value;
  errors[name] = r.message;
  return undefined;
};

/** "12 ft 6 in" style label for the diagram. */
const ftIn = (ft, inch) => (inch ? `${ft} ft ${round(inch, 2)} in` : `${ft} ft`);

export function calculate(raw = {}) {
  const errors = {};
  const roomCount = Number(raw.roomCount ?? 1);
  if (!Number.isInteger(roomCount) || roomCount < 1 || roomCount > MAX_ROOMS) errors.roomCount = 'Choose 1 to 4 rooms.';
  const layout = String(raw.layout ?? 'straight');
  if (!['straight', 'diagonal', 'custom'].includes(layout)) errors.layout = 'Choose a layout.';
  const boxCoverage = read(raw, 'boxCoverage', 'Coverage per box', 1, 100, errors);
  const extraBoxes = read(raw, 'extraBoxes', 'Extra boxes', 0, 10, errors);
  if (extraBoxes !== undefined && !Number.isInteger(extraBoxes)) errors.extraBoxes = 'Extra boxes must be a whole number.';
  const customWaste = layout === 'custom' ? read(raw, 'customWaste', 'Waste allowance', 0, 40, errors) : undefined;

  const rooms = [];
  if (!errors.roomCount) {
    for (let n = 1; n <= roomCount; n++) {
      const [lf, li, wf, wi] = ROOM_FIELDS(n).map(([name, label, min, max]) => read(raw, name, label, min, max, errors));
      if ([lf, li, wf, wi].some((v) => v === undefined)) continue;
      const length = lf + li / 12;
      const width = wf + wi / 12;
      if (!(length > 0)) errors[`room${n}LengthFt`] = `Room ${n} needs a length greater than 0.`;
      else if (!(width > 0)) errors[`room${n}WidthFt`] = `Room ${n} needs a width greater than 0.`;
      else rooms.push({ n, length, width, area: length * width, lengthLabel: ftIn(lf, li), widthLabel: ftIn(wf, wi) });
    }
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const wastePct = layout === 'custom' ? customWaste : LAYOUT_WASTE[layout];
  const area = rooms.reduce((s, r) => s + r.area, 0);
  const areaWithWaste = area * (1 + wastePct / 100);
  const boxes = ceilTo(areaWithWaste / boxCoverage, 1) + extraBoxes;
  const bought = boxes * boxCoverage;
  const roomArea = (n) => {
    const r = rooms.find((x) => x.n === n);
    return r ? round(r.area, 2) : null;
  };

  return {
    ok: true,
    results: {
      boxes,
      area: round(area, 2),
      areaWithWaste: round(areaWithWaste, 2),
      wastePct,
      bought: round(bought, 2),
      leftover: round(bought - areaWithWaste, 2),
      room1Area: roomArea(1),
      room2Area: roomArea(2),
      room3Area: roomArea(3),
      room4Area: roomArea(4),
    },
    chart: [
      { label: 'Floor area', value: round(area, 1) },
      { label: 'Waste', value: round(areaWithWaste - area, 1) },
      { label: 'Left over', value: round(Math.max(0, bought - areaWithWaste), 1) },
    ],
    // Room plans with each length and width (labels only).
    diagram: {
      type: 'plan',
      name: 'Floor plan',
      unit: 'ft',
      pattern: layout === 'diagonal' ? 'hatch' : 'boards-h',
      areas: rooms.map((r) => ({ label: `Room ${r.n}`, length: r.length, width: r.width, lengthLabel: r.lengthLabel, widthLabel: r.widthLabel })),
      depthNote: `${round(area, 1).toLocaleString('en-US')} sq ft + ${wastePct}% waste = ${round(areaWithWaste, 1).toLocaleString('en-US')} sq ft`,
    },
  };
}
