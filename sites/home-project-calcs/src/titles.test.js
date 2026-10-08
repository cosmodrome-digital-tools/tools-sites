// Content & SEO's approved <title> for the homepage and every tool on the site.
// Checks the title each page generates from meta.json / site.config.mjs and, when
// dist/ exists (after `npm run build`), the <title> actually rendered in the HTML.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { toolTitle } from '@tools/seo';
import site from './site.config.mjs';

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const toolsDir = join(siteDir, 'tools');
const distDir = join(siteDir, 'dist');

const EXPECTED = {
  '': 'Home & Yard Calcs - Home Project Materials Calculators',
  'concrete-calculator': 'Concrete Calculator - Bags and Yards | Home & Yard Calcs',
  'rebar-calculator': 'Rebar Calculator for Slabs and Footings | Home & Yard Calcs',
  'gravel-calculator': 'Gravel Calculator - Cubic Yards and Tons | Home & Yard Calcs',
  'mulch-calculator': 'Mulch Calculator - Cubic Yards and Bags | Home & Yard Calcs',
  'paver-patio-calculator': 'Paver Calculator - Pavers, Base and Sand | Home & Yard Calcs',
  'retaining-wall-block-calculator': 'Retaining Wall Block Calculator | Home & Yard Calcs',
  'roof-pitch-calculator': 'Roof Pitch Calculator - Pitch to Degrees | Home & Yard Calcs',
  'fence-calculator': 'Fence Calculator - Posts, Pickets, Bags | Home & Yard Calcs',
  'deck-board-calculator': 'Deck Board Calculator with Spacing | Home & Yard Calcs',
  'paint-calculator': 'Paint Calculator - Gallons for Walls | Home & Yard Calcs',
};

const toolSlugs = readdirSync(toolsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name);
const meta = (slug) => JSON.parse(readFileSync(join(toolsDir, slug, 'meta.json'), 'utf8'));
const generated = (slug) => {
  if (slug === '') return site.homeTitle;
  const m = meta(slug);
  return toolTitle(m.title, m.benefit, site.name, m.seoTitle);
};

describe('page titles', () => {
  it('has an approved title for every tool on the site', () => {
    expect(toolSlugs.sort()).toEqual(Object.keys(EXPECTED).filter(Boolean).sort());
  });

  for (const [slug, title] of Object.entries(EXPECTED)) {
    const page = slug || 'homepage';
    it(`${page}: generates the approved title (60 characters or fewer, site name once)`, () => {
      const t = generated(slug);
      expect(t).toBe(title);
      expect(t.length).toBeLessThanOrEqual(60);
      expect(t.split(site.name).length - 1).toBe(1);
    });

    it.skipIf(!existsSync(distDir))(`${page}: built HTML has the approved <title> and og:title`, () => {
      const html = readFileSync(join(distDir, slug, 'index.html'), 'utf8');
      const encoded = title.replaceAll('&', '&amp;');
      expect(html.match(/<title>([^<]*)<\/title>/)[1]).toBe(encoded);
      expect(html).toContain(`<meta property="og:title" content="${encoded}"`);
      expect(html).not.toContain('&amp;amp;');
    });
  }

  it('keeps the H1 separate from the SEO title', () => {
    for (const slug of toolSlugs) expect(meta(slug).title).not.toContain('|');
  });
});
