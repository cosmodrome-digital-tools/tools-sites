// logic.js: PURE calculation code only. No DOM, no fetch, no window/document.
// Drywall: sheets for a room's walls and ceiling, joint compound, paper tape,
// and screws. Screws are derived from the IRC gypsum fastener spacing for
// walls and ceilings at the chosen framing spacing, not a flat per-sheet number.
import { ceilTo, round, validateAll } from '@tools/calculator-core';

// Sheets are hung horizontally: the long edge runs across the framing.
export const SHEETS = { '4x8': { width: 48, length: 96 }, '4x10': { width: 48, length: 120 }, '4x12': { width: 48, length: 144 } };
export const FRAMING = [16, 24];

// USG data sheets (meta.json sources): All Purpose ready-mixed joint compound
// about 10 gal per 1,000 sq ft of board; paper joint tape about 370 ft per 1,000 sq ft.
export const COMPOUND_GAL_PER_SQFT = 10 / 1000;
export const TAPE_FT_PER_SQFT = 370 / 1000;

/**
 * Maximum screw spacing along each framing member, inches, from the IRC gypsum
 * board application table (2021 IRC Table R702.3.5; same values in the 2024 IRC),
 * application without adhesive: ceilings 12 in; walls 16 in with framing at
 * 16 in o.c. and 12 in with framing at 24 in o.c.
 */
export function screwSpacing(surface, framing) {
  if (surface === 'ceiling') return 12;
  return framing === 24 ? 12 : 16;
}

/** Screws in one sheet: one row on every member it crosses, one screw every `spacing` in along it. */
export function screwsPerSheet(sheet, framing, spacing) {
  const members = Math.floor(sheet.length / framing) + 1;
  const perMember = Math.floor(sheet.width / spacing) + 1;
  return members * perMember;
}

export const RULES = {
  length: { label: 'Room length', min: 2, max: 100 },
  width: { label: 'Room width', min: 2, max: 100 },
  height: { label: 'Wall height', min: 4, max: 20 },
  openings: { label: 'Doors and windows', min: 0, max: 2000 },
  waste: { label: 'Waste allowance', min: 0, max: 30 },
};

export function calculate(raw = {}) {
  const errors = {};
  const sheet = SHEETS[raw.sheetSize];
  if (!sheet) errors.sheetSize = 'Choose a sheet size.';
  const framing = Number(raw.framing);
  if (!FRAMING.includes(framing)) errors.framing = 'Choose 16 in or 24 in on center.';
  const ceiling = String(raw.includeCeiling ?? 'yes');
  if (!['yes', 'no'].includes(ceiling)) errors.includeCeiling = 'Choose whether to include the ceiling.';
  const checked = validateAll(raw, RULES);
  if (!checked.ok) Object.assign(errors, checked.errors);
  if (Object.keys(errors).length) return { ok: false, errors };

  const { length, width, height, openings, waste } = checked.values;
  const grossWalls = 2 * (length + width) * height;
  if (openings >= grossWalls) {
    return { ok: false, errors: { openings: `Doors and windows can't be ${openings} sq ft or more: the walls are only ${round(grossWalls, 1)} sq ft.` } };
  }
  const wallArea = grossWalls - openings;
  const ceilingArea = ceiling === 'yes' ? length * width : 0;
  const sheetSqFt = (sheet.width * sheet.length) / 144;
  const sheetsFor = (area) => (area > 0 ? ceilTo((area * (1 + waste / 100)) / sheetSqFt, 1) : 0);
  const wallSheets = sheetsFor(wallArea);
  const ceilingSheets = sheetsFor(ceilingArea);
  const area = wallArea + ceilingArea;

  const wallSpacing = screwSpacing('wall', framing);
  const ceilingSpacing = screwSpacing('ceiling', framing);
  const wallPerSheet = screwsPerSheet(sheet, framing, wallSpacing);
  const ceilingPerSheet = screwsPerSheet(sheet, framing, ceilingSpacing);
  const wallScrews = wallSheets * wallPerSheet;
  const ceilingScrews = ceilingSheets * ceilingPerSheet;

  return {
    ok: true,
    results: {
      sheets: wallSheets + ceilingSheets,
      compound: ceilTo(area * COMPOUND_GAL_PER_SQFT, 1),
      tape: ceilTo(area * TAPE_FT_PER_SQFT, 1),
      screws: wallScrews + ceilingScrews,
      wallArea: round(wallArea, 1),
      wallSheets,
      wallScrews,
      wallPerSheet,
      wallSpacing,
      ceilingArea: ceiling === 'yes' ? round(ceilingArea, 1) : null,
      ceilingSheets: ceiling === 'yes' ? ceilingSheets : null,
      ceilingScrews: ceiling === 'yes' ? ceilingScrews : null,
      ceilingPerSheet: ceiling === 'yes' ? ceilingPerSheet : null,
      ceilingSpacing: ceiling === 'yes' ? ceilingSpacing : null,
      boardArea: round(area, 1),
    },
    chart: [
      { label: 'Walls', value: wallSheets },
      ...(ceiling === 'yes' ? [{ label: 'Ceiling', value: ceilingSheets }] : []),
    ],
    // Room box with wall and ceiling areas called out (labels only).
    diagram: {
      type: 'room',
      length,
      width,
      height,
      unit: 'ft',
      ceiling: ceiling === 'yes',
      wallLabel: `Walls ${round(wallArea, 0).toLocaleString('en-US')} sq ft`,
      ceilingLabel: `Ceiling ${round(ceilingArea, 0).toLocaleString('en-US')} sq ft`,
    },
  };
}
