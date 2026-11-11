// logic.test.js: Vitest tests for logic.js (Flooring Calculator).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as logic from './logic.js';

const { calculate } = logic;
const base = { roomCount: '1', room1LengthFt: '12', room1LengthIn: '0', room1WidthFt: '12', room1WidthIn: '0', layout: 'straight', boxCoverage: '20', extraBoxes: '0' };
const run = (over = {}) => calculate({ ...base, ...over });
const ok = (over) => {
  const r = run(over);
  expect(r.ok, JSON.stringify(r.errors)).toBe(true);
  return r.results;
};
const twoRooms = { roomCount: '2', room1LengthIn: '6', room1WidthFt: '10', room2LengthFt: '8', room2LengthIn: '0', room2WidthFt: '8', room2WidthIn: '0', layout: 'diagonal', boxCoverage: '23.4' };

describe('known answers', () => {
  // Hand math: 12 x 12 = 144; x 1.10 = 158.4; / 20 = 7.92 -> 8 boxes; 160 - 158.4 = 1.6.
  it('12 x 12 ft, straight, 20 sq ft boxes = 8 boxes, 1.6 sq ft left over (hand math, Tarkett 10%)', () => {
    expect(ok()).toEqual({ boxes: 8, area: 144, areaWithWaste: 158.4, wastePct: 10, bought: 160, leftover: 1.6, room1Area: 144, room2Area: null, room3Area: null, room4Area: null });
  });
  // page.md worked example. Hand math: 12.5 x 10 = 125; 8 x 8 = 64; 189 x 1.15 = 217.35; / 23.4 = 9.29 -> 10; 234 - 217.35 = 16.65.
  it('two rooms, 12 ft 6 in x 10 ft + 8 x 8, diagonal, 23.4 sq ft boxes = 10 boxes (page.md worked example)', () => {
    expect(ok(twoRooms)).toMatchObject({ boxes: 10, area: 189, areaWithWaste: 217.35, wastePct: 15, bought: 234, leftover: 16.65, room1Area: 125, room2Area: 64 });
  });
  // Hand math: 4 rooms of 10 ft 3 in x 9 ft 9 in = 10.25 x 9.75 = 99.9375 each, 399.75 total; custom 20% = 479.7; / 30 = 15.99 -> 16 + 2 spare = 18.
  it('four rooms, herringbone at 20%, 30 sq ft boxes, 2 spares = 18 boxes (hand math)', () => {
    const rooms = {};
    for (const n of [1, 2, 3, 4]) Object.assign(rooms, { [`room${n}LengthFt`]: '10', [`room${n}LengthIn`]: '3', [`room${n}WidthFt`]: '9', [`room${n}WidthIn`]: '9' });
    const r = ok({ ...rooms, roomCount: '4', layout: 'custom', customWaste: '20', boxCoverage: '30', extraBoxes: '2' });
    expect(r).toMatchObject({ area: 399.75, areaWithWaste: 479.7, boxes: 18, wastePct: 20, room4Area: 99.94 });
  });
  it('page.md room-size table matches calculate()', () => {
    const md = readFileSync(new URL('./page.md', import.meta.url), 'utf8');
    for (const [l, w] of [[10, 10], [10, 12], [12, 12], [12, 14], [14, 16], [16, 20]]) {
      const s = ok({ room1LengthFt: String(l), room1WidthFt: String(w) });
      const d = ok({ room1LengthFt: String(l), room1WidthFt: String(w), layout: 'diagonal' });
      const row = md.split('\n').find((x) => x.startsWith(`| ${l} × ${w} |`));
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean).slice(1).map(Number);
      expect(cells).toEqual([s.area, s.boxes, s.leftover, d.boxes, d.leftover]);
    }
  });
  it('rooms hidden by the room count are ignored (as the frame leaves them out)', () => {
    expect(ok({ roomCount: '1', room2LengthFt: 'junk' }).room2Area).toBe(null);
  });
  it('returns a plan diagram with one area per room and ft + in labels', () => {
    const d = run(twoRooms).diagram;
    expect(d.type).toBe('plan');
    expect(d.areas).toHaveLength(2);
    expect(d.areas[0]).toMatchObject({ label: 'Room 1', length: 12.5, width: 10, lengthLabel: '12 ft 6 in' });
  });
});

describe('edge cases', () => {
  it('rejects a room with zero length or width', () => {
    expect(run({ room1LengthFt: '0', room1LengthIn: '0' }).errors).toHaveProperty('room1LengthFt');
    expect(run({ room1WidthFt: '0', room1WidthIn: '0' }).errors).toHaveProperty('room1WidthFt');
    expect(run({ room1LengthFt: '0', room1LengthIn: '8' }).ok).toBe(true);
  });
  it('rejects negative, empty, and non-numeric input on the right field', () => {
    expect(run({ room1LengthFt: '-1' }).errors).toHaveProperty('room1LengthFt');
    expect(run({ room1WidthIn: '' }).errors).toHaveProperty('room1WidthIn');
    expect(run({ boxCoverage: 'twenty' }).errors).toHaveProperty('boxCoverage');
    expect(calculate({}).ok).toBe(false);
  });
  it('bounds: inches 0 to 11.99, feet to 100, coverage 1 to 100, extra boxes whole 0 to 10', () => {
    expect(run({ room1LengthIn: '11.99' }).ok).toBe(true);
    expect(run({ room1LengthIn: '12' }).errors).toHaveProperty('room1LengthIn');
    expect(run({ room1LengthFt: '100' }).ok).toBe(true);
    expect(run({ room1LengthFt: '100.1' }).errors).toHaveProperty('room1LengthFt');
    expect(run({ boxCoverage: '1' }).ok).toBe(true);
    expect(run({ boxCoverage: '0.9' }).errors).toHaveProperty('boxCoverage');
    expect(run({ boxCoverage: '100.1' }).errors).toHaveProperty('boxCoverage');
    expect(run({ extraBoxes: '10' }).ok).toBe(true);
    expect(run({ extraBoxes: '11' }).errors).toHaveProperty('extraBoxes');
    expect(run({ extraBoxes: '1.5' }).errors).toHaveProperty('extraBoxes');
  });
  it('custom waste bounds 0 to 40, and it is required only for the custom layout', () => {
    expect(run({ layout: 'custom', customWaste: '40' }).ok).toBe(true);
    expect(run({ layout: 'custom', customWaste: '40.1' }).errors).toHaveProperty('customWaste');
    expect(run({ layout: 'custom' }).errors).toHaveProperty('customWaste');
    expect(run({ layout: 'straight', customWaste: 'x' }).ok).toBe(true);
  });
  it('very large: four 100 x 100 ft rooms', () => {
    const big = {};
    for (const n of [1, 2, 3, 4]) Object.assign(big, { [`room${n}LengthFt`]: '100', [`room${n}LengthIn`]: '0', [`room${n}WidthFt`]: '100', [`room${n}WidthIn`]: '0' });
    expect(ok({ ...big, roomCount: '4' }).boxes).toBe(2200);
  });
  it('rejects unknown room counts and layouts', () => {
    expect(run({ roomCount: '5' }).errors).toHaveProperty('roomCount');
    expect(run({ layout: 'zigzag' }).errors).toHaveProperty('layout');
  });
});

// KEEP THIS BLOCK. It is skipped in the _template folder only, and fails in a
// newly scaffolded tool until the template example and every TODO are replaced.
const isTemplateFolder = new URL('.', import.meta.url).pathname.endsWith('/_template/');
describe.skipIf(isTemplateFolder)('scaffold guard', () => {
  it('replaces the template example calculation', () => {
    expect(logic.TEMPLATE_EXAMPLE).toBeUndefined();
  });
  it('has no TODO left in meta.json or page.md', () => {
    for (const file of ['meta.json', 'page.md']) {
      expect(readFileSync(new URL(`./${file}`, import.meta.url), 'utf8'), file).not.toMatch(/TODO/);
    }
  });
});
