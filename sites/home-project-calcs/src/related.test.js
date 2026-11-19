// "Related calculators" cards come from relatedTools in each tool's meta.json.
// Keep the lists short and contextual, and reciprocal where the relationship
// is real: if A lists B, B lists A, unless the pair is in ONE_WAY with a reason.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const toolsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'tools');
const slugs = readdirSync(toolsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name)
  .sort();
const related = Object.fromEntries(
  slugs.map((s) => [s, JSON.parse(readFileSync(join(toolsDir, s, 'meta.json'), 'utf8')).relatedTools ?? []]),
);

// The 20 tools whose lists were audited together in the Nov 2026 SEO pass.
// Reciprocity is enforced among these. A newly built tool can't edit other
// tools' meta.json, so its links are only checked for valid slugs and length;
// whoever wires it in adds it here and links back from the related tools.
const AUDITED = new Set([
  'asphalt-calculator', 'attic-ventilation-calculator', 'brick-calculator', 'concrete-calculator',
  'deck-board-calculator', 'drywall-calculator', 'fence-calculator', 'flooring-calculator',
  'gravel-calculator', 'insulation-calculator', 'mulch-calculator', 'paint-calculator',
  'paver-patio-calculator', 'rebar-calculator', 'retaining-wall-block-calculator', 'roof-pitch-calculator',
  'shingle-calculator', 'siding-calculator', 'sod-calculator', 'stair-stringer-calculator',
]);

// Links that make sense in one direction only (SEO pass, Nov 2026).
const ONE_WAY = {
  'deck-board-calculator -> concrete-calculator': 'deck footings are poured with the Concrete Calculator round-column (Sonotube) mode',
  'fence-calculator -> gravel-calculator': 'gravel under fence posts; the fence page body links the Gravel Calculator for bigger orders',
  'rebar-calculator -> gravel-calculator': 'the compacted gravel base under a reinforced slab',
  'sod-calculator -> paver-patio-calculator': 'lawn and patio areas are usually planned together in one yard layout',
};

describe('relatedTools', () => {
  for (const slug of slugs) {
    it(`${slug}: up to 6 existing, distinct tools, not itself (at least 2 once audited)`, () => {
      const list = related[slug];
      if (AUDITED.has(slug)) expect(list.length).toBeGreaterThanOrEqual(2);
      expect(list.length).toBeLessThanOrEqual(6);
      expect(new Set(list).size).toBe(list.length);
      expect(list).not.toContain(slug);
      for (const r of list) expect(slugs, `${slug} lists unknown tool ${r}`).toContain(r);
    });
  }

  it('is reciprocal among audited tools except for the documented one-way links', () => {
    const missing = [];
    for (const [a, list] of Object.entries(related)) {
      if (!AUDITED.has(a)) continue;
      for (const b of list.filter((x) => AUDITED.has(x))) {
        if (!related[b]?.includes(a) && !ONE_WAY[`${a} -> ${b}`]) missing.push(`${a} -> ${b}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('has no stale one-way entries (each is still a real, non-reciprocal link)', () => {
    for (const key of Object.keys(ONE_WAY)) {
      const [a, b] = key.split(' -> ');
      expect(related[a], key).toContain(b);
      expect(related[b], key).not.toContain(a);
    }
  });

  it('every audited tool is linked from at least one other tool', () => {
    const linked = new Set(Object.values(related).flat());
    expect(slugs.filter((s) => AUDITED.has(s) && !linked.has(s))).toEqual([]);
  });
});
