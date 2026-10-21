import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderChart } from './chart.js';
import { isShown, onlyVisible, visibleFields } from './visibility.js';

const V1 = JSON.parse(readFileSync(new URL('./__fixtures__/chart-v1.json', import.meta.url), 'utf8'));
const data = [{ label: 'A', value: 2 }, { label: 'B & C', value: 4 }, { label: 'D', value: 0 }];

describe('chart highlight (backward compatible)', () => {
  it('renders byte-for-byte the same SVG as before when no row is highlighted', () => {
    for (const style of ['bar', 'line', 'donut']) expect(renderChart(style, data, { title: 'T' })).toBe(V1[style]);
  });
  for (const style of ['bar', 'line', 'donut']) {
    it(`${style}: highlighted row gets an ink outline, a text marker, and is named in the title`, () => {
      const svg = renderChart(style, [data[0], { ...data[1], highlight: true }], { title: 'T' });
      expect(svg).toContain('class="tool-chart__hl"');
      expect(svg).toContain('B &amp; C 4 (Yours)');
      expect(svg).toMatch(/Yours/);
      expect(svg).toContain('font-weight="700"');
      expect((svg.match(/tool-chart__hl/g) ?? []).length).toBe(1);
    });
  }
  it('uses a custom, escaped highlight label', () => {
    const svg = renderChart('line', [{ label: '6', value: 26.57, highlight: true, highlightLabel: 'Your <pitch>' }], { title: 'T' });
    expect(svg).toContain('Your &lt;pitch&gt;');
  });
  it('outline uses the tool ink token so it follows each tool theme', () => {
    expect(renderChart('bar', [{ label: 'A', value: 1, highlight: true }])).toContain('stroke="var(--tool-ink, currentColor)"');
  });
});

describe('conditional fields (showIf)', () => {
  it('equals / notEquals / in / all-of', () => {
    expect(isShown(undefined, {})).toBe(true);
    expect(isShown({ field: 'p', equals: 'batts' }, { p: 'batts' })).toBe(true);
    expect(isShown({ field: 'p', equals: 'batts' }, { p: 'blown' })).toBe(false);
    expect(isShown({ field: 'p', notEquals: 'blown' }, { p: 'batts' })).toBe(true);
    expect(isShown({ field: 's', in: ['a', 'b'] }, { s: 'b' })).toBe(true);
    expect(isShown({ field: 's', in: ['a', 'b'] }, { s: 'c' })).toBe(false);
    expect(isShown([{ field: 'a', equals: 1 }, { field: 'b', equals: '2' }], { a: '1', b: '2' })).toBe(true);
    expect(isShown([{ field: 'a', equals: 1 }, { field: 'b', equals: '2' }], { a: '1', b: '3' })).toBe(false);
  });
  it('a field whose controller is hidden is hidden too (chains), regardless of order', () => {
    const inputs = [
      { name: 'c', showIf: { field: 'b', equals: 'y' } },
      { name: 'a' },
      { name: 'b', showIf: { field: 'a', equals: 'on' } },
    ];
    expect([...visibleFields(inputs, { a: 'on', b: 'y', c: '1' })].sort()).toEqual(['a', 'b', 'c']);
    expect([...visibleFields(inputs, { a: 'off', b: 'y', c: '1' })]).toEqual(['a']);
  });
  it('fields without showIf are always visible, so tools that do not opt in are unchanged', () => {
    const inputs = [{ name: 'x' }, { name: 'y' }];
    expect(onlyVisible({ x: '1', y: '2' }, visibleFields(inputs, { x: '1', y: '2' }))).toEqual({ x: '1', y: '2' });
  });
});
