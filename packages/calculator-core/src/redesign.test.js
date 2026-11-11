// Contracts added by the Nov 2026 redesign: labeled chart axes, labeled
// diagrams, accordion sections from page.md, and result formatting.
import { describe, expect, it } from 'vitest';
import { niceAxis, renderChart } from './chart.js';
import { DIAGRAM_TYPES, renderDiagram } from './diagram.js';
import { accordionize, sectionKind, splitFaq, splitSections, stripTags } from './sections.js';
import { formatFraction } from './numbers.js';
import { formatOutput } from './bind.js';

describe('chart axes and labels', () => {
  const rows = [{ label: '4"', value: 59 }, { label: '5"', value: 73 }, { label: '6"', value: 88 }];
  it('nice axis: rounds the max up to a 1/2/2.5/5 step with about 4 ticks', () => {
    expect(niceAxis(88)).toMatchObject({ max: 100, step: 25, ticks: [0, 25, 50, 75, 100] });
    expect(niceAxis(45)).toMatchObject({ max: 60, step: 20 });
    expect(niceAxis(10)).toMatchObject({ max: 10, step: 2.5 });
    expect(niceAxis(0.9).max).toBe(1);
    expect(niceAxis(0).ticks).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });
  for (const style of ['bar', 'line']) {
    it(`${style}: draws axis lines, tick labels, the unit, the category-axis label, and every value`, () => {
      const svg = renderChart(style, rows, { title: 'Bags', unit: 'bags', xLabel: 'Slab thickness (in)' });
      expect((svg.match(/class="tool-chart__axis"/g) ?? []).length).toBe(2);
      for (const t of ['0', '25', '50', '75', '100']) expect(svg).toContain(`class="tool-chart__tick">${t}</text>`);
      expect(svg).toContain('class="tool-chart__unit">bags</text>');
      expect(svg).toContain('class="tool-chart__xlabel">Slab thickness (in)</text>');
      for (const v of ['59', '73', '88']) expect(svg).toContain(`>${v}</text>`);
      expect(svg).toContain('<title>Bags: 4&quot; 59 bags, 5&quot; 73 bags, 6&quot; 88 bags</title>');
    });
  }
  it('donut: prints each value with unit and share, and the total', () => {
    const svg = renderChart('donut', [{ label: 'Walls', value: 3 }, { label: 'Ceiling', value: 1 }], { title: 'Gal', unit: 'gal' });
    expect(svg).toContain('3 gal · 75%');
    expect(svg).toContain('1 gal · 25%');
    expect(svg).toContain('>4</text>');
    expect(svg).toContain('gal total');
  });
  it('still returns nothing for none, empty, or negative data, and escapes labels', () => {
    expect(renderChart('none', rows)).toBe('');
    expect(renderChart('bar', [])).toBe('');
    expect(renderChart('bar', [{ label: 'x', value: -1 }])).toBe('');
    expect(renderChart('bar', [{ label: '<b>', value: 1 }])).toContain('&lt;b&gt;');
  });
});

describe('labeled diagrams', () => {
  const specs = {
    box: { type: 'box', length: 10, width: 12, depth: 4, unit: 'ft', depthUnit: 'in' },
    cylinder: { type: 'cylinder', diameter: 12, height: 36, unit: 'in', count: 4 },
    plan: { type: 'plan', length: 20, width: 10, unit: 'ft', pattern: 'hatch', depthNote: '3 in deep' },
    triangle: { type: 'triangle', rise: 7.5, run: 18, slope: 19.5, unit: 'in', angle: 22.6, pitch: 5 },
    stairs: { type: 'stairs', risers: 8, riserHeight: 7.5, treadDepth: 10, totalRise: 60, totalRun: 70, stringerLength: 92.2 },
    fence: { type: 'fence', length: 100, height: 6, posts: 14, spacing: 8, gates: 1, unit: 'ft' },
    wall: { type: 'wall', length: 30, height: 9, gableRise: 7.5, unit: 'ft', pattern: 'siding', windows: 2, doors: 1 },
    room: { type: 'room', length: 12, width: 12, height: 8, unit: 'ft', ceiling: true, wallLabel: 'Walls 354 sq ft', ceilingLabel: 'Ceiling 144 sq ft' },
    attic: { type: 'attic', pitch: 6, intakeLabel: 'Intake 576 sq in', exhaustLabel: 'Exhaust 576 sq in', insulationDepth: 13 },
  };
  it('covers every documented type', () => {
    expect(Object.keys(specs).sort()).toEqual([...DIAGRAM_TYPES].sort());
  });
  for (const [type, spec] of Object.entries(specs)) {
    it(`${type}: role="img", an aria-label with the dimensions, and no NaN`, () => {
      const svg = renderDiagram(spec, { title: 'Tool' });
      expect(svg).toMatch(/^<svg [^>]*role="img"/);
      expect(svg).toContain('<title>Tool. ');
      expect(svg).not.toContain('NaN');
      expect(svg).not.toContain('undefined');
    });
  }
  it('roof pitch triangle names rise, run, rafter, angle, and pitch', () => {
    const svg = renderDiagram(specs.triangle);
    for (const s of ['Rise 7.5 in', 'Run 18 in', 'Rafter 19.5 in', '22.6°', '5 / 12']) expect(svg).toContain(s);
    expect(svg).toContain('aria-label="Right triangle: rise 7.5 in, run 18 in, rafter 19.5 in, angle 22.6 degrees, pitch 5/12"');
  });
  it('slab box labels length, width, and depth with units', () => {
    const svg = renderDiagram(specs.box);
    for (const s of ['>10 ft<', '>12 ft<', '>4 in<']) expect(svg).toContain(s);
  });
  it('explicit labels win, and labels are escaped', () => {
    expect(renderDiagram({ ...specs.box, lengthLabel: '12 ft 6 in' })).toContain('12 ft 6 in');
    expect(renderDiagram({ ...specs.room, wallLabel: '<b>' })).toContain('&lt;b&gt;');
  });
  it('unknown or missing specs render nothing', () => {
    expect(renderDiagram(null)).toBe('');
    expect(renderDiagram({ type: 'hexagon' })).toBe('');
  });
});

describe('page.md accordion sections', () => {
  const html = `<p>Lead</p>
<h2 id="what-it-calculates-and-whos-for">What it calculates and who's for</h2><p>About</p>
<h2 id="how-to-use">How to use</h2><ol><li>a</li><li>b</li></ol>
<h2 id="the-formula">The formula</h2><p>F = m &amp; a</p>
<h2 id="faq">FAQ</h2><p>Intro</p><h3 id="q1">How many bags?</h3><p>About <strong>59</strong>.</p><h3 id="q2">Why?</h3><p>Because.</p>
<h2 id="pitch-table">Reference chart</h2><table><tr><td>1</td></tr></table>`;
  it('classifies the required H2s and treats the rest as reference', () => {
    expect(splitSections(html).sections.map((s) => s.kind)).toEqual(['about', 'howto', 'formula', 'faq', 'extra']);
    expect(sectionKind('Assumptions and limits')).toBe('limits');
    expect(sectionKind('Worked example')).toBe('example');
    expect(sectionKind('How to read your results')).toBe('read');
  });
  it('wraps every section in <details>, keeps every word and every id in the HTML', () => {
    const { html: out } = accordionize(html);
    expect((out.match(/<details class="tool-section/g) ?? []).length).toBe(5);
    for (const id of ['what-it-calculates-and-whos-for', 'how-to-use', 'the-formula', 'faq', 'pitch-table', 'q1', 'q2']) expect(out).toContain(`id="${id}"`);
    for (const w of ['About', 'F = m & a', 'Because.', 'Reference chart']) expect(stripTags(out)).toContain(w);
  });
  it('opens a short How to use (5 steps or fewer) and closes everything else', () => {
    const { html: out } = accordionize(html);
    expect(out).toMatch(/tool-section--howto" data-section="howto" open>/);
    expect(out).not.toMatch(/tool-section--formula"[^>]* open>/);
    const long = accordionize('<h2 id="how-to-use">How to use</h2><ol>' + '<li>x</li>'.repeat(6) + '</ol>').html;
    expect(long).not.toContain(' open>');
  });
  it('turns each FAQ question into its own <details> and returns Q&A for FAQPage', () => {
    const { html: out, faqs } = accordionize(html);
    expect((out.match(/<details class="tool-faq"/g) ?? []).length).toBe(2);
    expect(faqs).toEqual([
      { question: 'How many bags?', answer: 'About 59.' },
      { question: 'Why?', answer: 'Because.' },
    ]);
    expect(splitFaq('<p>no questions</p>')).toEqual([]);
  });
});

describe('result formatting', () => {
  it('fractions to the nearest 1/16 in, reduced', () => {
    expect(formatFraction(7.5)).toBe('7 1/2');
    expect(formatFraction(7.6923)).toBe('7 11/16');
    expect(formatFraction(7.4375)).toBe('7 7/16');
    expect(formatFraction(8)).toBe('8');
    expect(formatFraction(0.25)).toBe('1/4');
    expect(formatFraction(7.99)).toBe('8');
    expect(formatFraction(1234.5)).toBe('1,234 1/2');
  });
  it('formatOutput: numbers, Yes/No flags, fractions, and a dash for missing values', () => {
    expect(formatOutput(1234.567, { decimals: 1 })).toBe('1,234.6');
    expect(formatOutput(1, { format: 'yesno' })).toBe('Yes');
    expect(formatOutput(0, { format: 'yesno' })).toBe('No');
    expect(formatOutput(7.5, { format: 'fraction' })).toBe('7 1/2');
    expect(formatOutput(null)).toBe('–');
    expect(formatOutput(NaN)).toBe('–');
  });
});
