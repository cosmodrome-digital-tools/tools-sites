import { describe, expect, it } from 'vitest';
import { breadcrumbList, canonicalUrl, faqPage, pageTitle, serializeJsonLd, toolTitle, webApplication } from './index.js';

describe('titles', () => {
  it('follows the tool title pattern', () => {
    expect(toolTitle('Concrete Slab Calculator', 'Cubic Yards and Bags', 'Home & Yard Calcs'))
      .toBe('Concrete Slab Calculator - Cubic Yards and Bags | Home & Yard Calcs');
  });
  it('uses an seoTitle override and appends the site name exactly once', () => {
    expect(toolTitle('Rebar Calculator', 'Sticks', 'Home & Yard Calcs', 'Rebar Calculator for Slabs and Footings'))
      .toBe('Rebar Calculator for Slabs and Footings | Home & Yard Calcs');
    expect(toolTitle('Rebar Calculator', 'Sticks', 'Home & Yard Calcs', 'Rebar Calculator for Slabs | Home & Yard Calcs'))
      .toBe('Rebar Calculator for Slabs | Home & Yard Calcs');
  });
  it('falls back to the pattern when seoTitle is empty', () => {
    expect(toolTitle('X', 'Y', 'Site', '')).toBe('X - Y | Site');
  });
  it('requires every part', () => {
    expect(() => toolTitle('X', '', 'Site')).toThrow();
  });
  it('builds page titles', () => {
    expect(pageTitle('About', 'Site')).toBe('About | Site');
    expect(pageTitle('', 'Site')).toBe('Site');
  });
});

describe('canonicalUrl', () => {
  it('adds trailing slashes to page paths only', () => {
    expect(canonicalUrl('/about', 'https://a.example')).toBe('https://a.example/about/');
    expect(canonicalUrl('/about/?x=1#y', 'https://a.example')).toBe('https://a.example/about/');
    expect(canonicalUrl('/robots.txt', 'https://a.example')).toBe('https://a.example/robots.txt');
  });
});

describe('JSON-LD', () => {
  it('builds a free WebApplication', () => {
    const d = webApplication({ name: 'T', description: 'D', url: 'https://a.example/t/' });
    expect(d['@type']).toBe('WebApplication');
    expect(d.offers.price).toBe('0');
  });
  it('builds a BreadcrumbList with positions', () => {
    const d = breadcrumbList([{ name: 'Home', url: 'https://a.example/' }, { name: 'T', url: 'https://a.example/t/' }]);
    expect(d.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });
  it('builds an FAQPage', () => {
    expect(faqPage([{ question: 'Q', answer: 'A' }]).mainEntity[0].acceptedAnswer.text).toBe('A');
  });
  it('keeps a raw ampersand in JSON-LD (no HTML entity encoding)', () => {
    const out = serializeJsonLd({ name: 'Home & Yard Calcs' });
    expect(out).toContain('"Home & Yard Calcs"');
    expect(out).not.toContain('&amp;');
    expect(JSON.parse(out).name).toBe('Home & Yard Calcs');
  });
  it('escapes < when serializing', () => {
    expect(serializeJsonLd({ a: '</script>' })).not.toContain('</script>');
  });
});
