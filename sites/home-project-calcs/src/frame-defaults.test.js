// Proves the shared-frame upgrade (Advanced section, showIf, chart highlight)
// left every tool's numbers unchanged. The fixture was generated from each
// tool's logic.js on main before this change: the meta.json defaults, plus
// every option of every select input with the rest at defaults. Here each case
// runs through today's logic.js the way the browser now sends it (fields
// hidden by showIf are left out of the raw input).
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { onlyVisible, visibleFields } from '@tools/calculator-core/visibility.js';

const BEFORE = JSON.parse(readFileSync(new URL('./__fixtures__/defaults-before-frame.json', import.meta.url), 'utf8'));
const toolsDir = new URL('../tools/', import.meta.url);
const tools = readdirSync(toolsDir).filter((d) => !d.startsWith('_')).sort();

describe('shared frame upgrade keeps every result identical', () => {
  it('covers all 12 tools', () => {
    expect(Object.keys(BEFORE).sort()).toEqual(tools);
    expect(tools).toHaveLength(12);
  });

  for (const tool of tools) {
    it(`${tool}: defaults and every select option give the same results and chart values`, async () => {
      const meta = JSON.parse(readFileSync(new URL(`${tool}/meta.json`, toolsDir), 'utf8'));
      const { calculate } = await import(`../tools/${tool}/logic.js`);
      // meta.json defaults are unchanged.
      const defaults = Object.fromEntries(meta.inputs.map((i) => [i.name, i.default === undefined ? '' : String(i.default)]));
      expect(defaults).toEqual(BEFORE[tool][0].raw);
      for (const c of BEFORE[tool]) {
        const raw = onlyVisible(c.raw, visibleFields(meta.inputs, c.raw));
        const out = calculate(raw);
        expect(out.ok, c.id).toBe(c.ok);
        if (c.ok) {
          expect(out.results, c.id).toEqual(c.results);
          expect((out.chart ?? []).map(({ label, value }) => ({ label, value })), c.id).toEqual(c.chart);
        }
      }
    });
  }
});
