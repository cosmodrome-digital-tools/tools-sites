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
  'insulation-calculator': 'Insulation Calculator - Attic R-Value | Home & Yard Calcs',
  'mulch-calculator': 'Mulch Calculator - Cubic Yards and Bags | Home & Yard Calcs',
  'paver-patio-calculator': 'Paver Calculator - Pavers, Base and Sand | Home & Yard Calcs',
  'retaining-wall-block-calculator': 'Retaining Wall Block Calculator | Home & Yard Calcs',
  'roof-pitch-calculator': 'Roof Pitch Calculator - Pitch to Degrees | Home & Yard Calcs',
  'shingle-calculator': 'Shingle Calculator - Bundles and Squares | Home & Yard Calcs',
  'fence-calculator': 'Fence Calculator - Posts, Pickets, Bags | Home & Yard Calcs',
  'deck-board-calculator': 'Deck Board Calculator with Spacing | Home & Yard Calcs',
  'paint-calculator': 'Paint Calculator - Gallons for Walls | Home & Yard Calcs',
  // Redesign additions (Nov 2026). Group A from the Oct 2026 register/briefs;
  // Group B are category-fill tools not on the register.
  'stair-stringer-calculator': 'Stair Stringer Calculator - Rise and Run | Home & Yard Calcs',
  'drywall-calculator': 'Drywall Calculator - Sheets, Mud, Screws | Home & Yard Calcs',
  'flooring-calculator': 'Flooring Calculator - Boxes for Any Room | Home & Yard Calcs',
  'siding-calculator': 'Siding Calculator - Squares and Cartons | Home & Yard Calcs',
  'sod-calculator': 'Sod Calculator - Rolls and Pallets | Home & Yard Calcs',
  'brick-calculator': 'Brick Calculator - Bricks and Mortar | Home & Yard Calcs',
  'asphalt-calculator': 'Asphalt Calculator - Tons for a Driveway | Home & Yard Calcs',
  'attic-ventilation-calculator': 'Attic Ventilation Calculator - Vent Area | Home & Yard Calcs',
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

// Meta descriptions: one per page, unique, roughly one search-snippet long.
const pagesDir = join(siteDir, 'src', 'content', 'pages');
const sitePages = readdirSync(pagesDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
const pageDescription = (page) => readFileSync(join(pagesDir, `${page}.md`), 'utf8').match(/^description:\s*(.+)$/m)[1].trim();
const descriptions = {
  '': site.description,
  ...Object.fromEntries(toolSlugs.map((slug) => [slug, meta(slug).metaDescription])),
  ...Object.fromEntries(sitePages.map((page) => [page, pageDescription(page)])),
};

describe('meta descriptions', () => {
  it('are unique across the home page, every tool, and every site page', () => {
    const values = Object.values(descriptions);
    expect(new Set(values).size).toBe(values.length);
  });
  for (const slug of ['', ...toolSlugs]) {
    it(`${slug || 'homepage'}: 120 to 160 characters`, () => {
      expect(descriptions[slug].length).toBeGreaterThanOrEqual(120);
      expect(descriptions[slug].length).toBeLessThanOrEqual(160);
    });
  }
  it('site pages have a description of at least 70 characters', () => {
    for (const page of sitePages) expect(pageDescription(page).length, page).toBeGreaterThanOrEqual(70);
  });
});

// Built HTML (after `npm run build`): every indexable page has a unique <title>
// and description, the site-wide share image, and a Twitter card.
const builtPages = ['', ...toolSlugs, ...sitePages];
const built = (slug) => readFileSync(join(distDir, slug, 'index.html'), 'utf8');
const metaTag = (html, key) => html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1];

describe.skipIf(!existsSync(distDir))('built head tags', () => {
  it('every indexable page has a unique <title> and meta description', () => {
    const titles = builtPages.map((slug) => built(slug).match(/<title>([^<]*)<\/title>/)[1]);
    const descs = builtPages.map((slug) => metaTag(built(slug), 'description'));
    expect(new Set(titles).size).toBe(builtPages.length);
    expect(new Set(descs).size).toBe(builtPages.length);
  });
  it('every page has og:image (absolute, 1200x630), og:locale, and a large-image Twitter card', () => {
    for (const slug of builtPages) {
      const html = built(slug);
      expect(metaTag(html, 'og:image'), slug).toBe(`${site.siteUrl}${site.ogImage.path}`);
      expect(metaTag(html, 'og:image:width'), slug).toBe('1200');
      expect(metaTag(html, 'og:image:height'), slug).toBe('630');
      expect(metaTag(html, 'og:locale'), slug).toBe('en_US');
      expect(metaTag(html, 'twitter:card'), slug).toBe('summary_large_image');
      expect(html, slug).not.toContain('noindex');
    }
    expect(existsSync(join(distDir, site.ogImage.path))).toBe(true);
  });
  it('the home page has WebSite JSON-LD with the site name and URL', () => {
    const blocks = [...built('').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const ws = blocks.find((b) => b['@type'] === 'WebSite');
    expect(ws).toMatchObject({ name: site.name, url: `${site.siteUrl}/` });
  });
});
