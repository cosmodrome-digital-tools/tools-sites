// Proves the shared-frame upgrade (Advanced section, showIf, chart highlight)
// left every tool's numbers unchanged. The fixture was generated from each
// tool's logic.js on main before this change: the meta.json defaults, plus
// every option of every select input with the rest at defaults. Here each case
// runs through today's logic.js the way the browser now sends it (fields
// hidden by showIf are left out of the raw input).
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { onlyVisible, visibleFields } from '@tools/calculator-core/visibility.js';
import { renderDiagram } from '@tools/calculator-core/diagram.js';

// Intended additions since the fixture was taken (refinement PR 2): shingle's
// optional drip edge input and its two new outputs. Everything else must match.
const ADDED_INPUTS = { 'shingle-calculator': ['dripEdge'] };
const ADDED_RESULTS = { 'shingle-calculator': ['dripEdgeLength', 'dripEdgePieces'] };
const without = (obj, keys = []) => Object.fromEntries(Object.entries(obj ?? {}).filter(([k]) => !keys.includes(k)));

const BEFORE = JSON.parse(readFileSync(new URL('./__fixtures__/defaults-before-frame.json', import.meta.url), 'utf8'));
const toolsDir = new URL('../tools/', import.meta.url);
const allTools = readdirSync(toolsDir).filter((d) => !d.startsWith('_')).sort();
// The fixture covers the 12 tools that existed before the shared-frame work.
// Tools added later (the Oct/Nov 2026 redesign's eight) have their own known-answer tests.
const tools = Object.keys(BEFORE).sort();

describe('shared frame upgrade keeps every result identical', () => {
  it('covers the 12 original tools, all still present', () => {
    expect(tools).toHaveLength(12);
    for (const t of tools) expect(allTools).toContain(t);
  });

  for (const tool of tools) {
    it(`${tool}: defaults and every select option give the same results and chart values`, async () => {
      const meta = JSON.parse(readFileSync(new URL(`${tool}/meta.json`, toolsDir), 'utf8'));
      const { calculate } = await import(`../tools/${tool}/logic.js`);
      // meta.json defaults are unchanged.
      const defaults = Object.fromEntries(meta.inputs.filter((i) => !(ADDED_INPUTS[tool] ?? []).includes(i.name)).map((i) => [i.name, i.default === undefined ? '' : String(i.default)]));
      expect(defaults).toEqual(BEFORE[tool][0].raw);
      for (const c of BEFORE[tool]) {
        const raw = onlyVisible(c.raw, visibleFields(meta.inputs, c.raw));
        const out = calculate(raw);
        expect(out.ok, c.id).toBe(c.ok);
        if (c.ok) {
          expect(without(out.results, ADDED_RESULTS[tool]), c.id).toEqual(c.results);
          expect((out.chart ?? []).map(({ label, value }) => ({ label, value })), c.id).toEqual(c.chart);
        }
      }
    });
  }
});

// Redesign contract (Nov 2026): every tool's calculate() at its meta.json
// defaults returns a labeled diagram the shared renderer can draw, so every
// tool page ships a drawing in its HTML.
describe('every tool returns a labeled diagram at its defaults', () => {
  for (const tool of allTools) {
    it(`${tool}: diagram renders as an accessible SVG`, async () => {
      const meta = JSON.parse(readFileSync(new URL(`${tool}/meta.json`, toolsDir), 'utf8'));
      const { calculate } = await import(`../tools/${tool}/logic.js`);
      const raw = Object.fromEntries(meta.inputs.map((i) => [i.name, i.default === undefined ? '' : String(i.default)]));
      const out = calculate(onlyVisible(raw, visibleFields(meta.inputs, raw)));
      expect(out.ok, JSON.stringify(out.errors)).toBe(true);
      const svg = renderDiagram(out.diagram, { title: meta.title });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toMatch(/role="img" aria-label="[^"]{20,}"/);
      expect(svg).not.toContain('NaN');
    });
  }
});
