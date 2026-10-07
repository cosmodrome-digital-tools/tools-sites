import { describe, expect, it } from 'vitest';
import { cuFtToCuYd, feetAndInches, inchesToFeet, withWaste } from './units.js';
import { renderChart } from './chart.js';

describe('units', () => {
  it('converts US units', () => {
    expect(cuFtToCuYd(27)).toBe(1);
    expect(inchesToFeet(6)).toBe(0.5);
    expect(feetAndInches(10, 6)).toBe(10.5);
    expect(withWaste(100, 10)).toBeCloseTo(110);
  });
});

describe('renderChart', () => {
  const data = [{ label: 'A', value: 2 }, { label: 'B', value: 4 }];
  it('draws bar, line, and donut charts as SVG', () => {
    for (const style of ['bar', 'line', 'donut']) {
      const svg = renderChart(style, data, { title: 'T' });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('var(--chart-palette-1)');
    }
  });
  it('returns nothing for none, empty, or bad data', () => {
    expect(renderChart('none', data)).toBe('');
    expect(renderChart('bar', [])).toBe('');
    expect(renderChart('bar', [{ label: 'x', value: -1 }])).toBe('');
  });
  it('escapes labels', () => {
    expect(renderChart('bar', [{ label: '<b>', value: 1 }])).toContain('&lt;b&gt;');
  });
});
