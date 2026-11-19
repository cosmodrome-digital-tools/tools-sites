// Tests for the dist/ check helpers used by scripts/checks/run.mjs.
import { strict as assert } from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import {
  brokenInternalLinks, duplicates, firstLoadSize, headProblems, metaContent, outboundLinks,
  sisterLinkProblems, sitemapLocs, titleOf, urlPathFor,
} from './dist-lib.mjs';

const SITE = 'https://homeandyardcalcs.com';
const head = ({ title = 'Mulch Calculator - Bags | Home &amp; Yard Calcs', desc = 'Estimate mulch.', path = '/mulch-calculator/', extra = '' } = {}) => `<!doctype html><html><head>
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:site_name" content="Home &amp; Yard Calcs">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
${extra}</head><body></body></html>`;
const ctx = { urlPath: '/mulch-calculator/', siteUrl: SITE, siteName: 'Home & Yard Calcs' };

describe('head tags', () => {
  it('passes a complete, consistent head', () => {
    assert.deepEqual(headProblems(head(), ctx), []);
  });
  it('decodes entities when reading tags', () => {
    assert.equal(titleOf(head()), 'Mulch Calculator - Bags | Home & Yard Calcs');
    assert.equal(metaContent(head(), 'og:site_name'), 'Home & Yard Calcs');
  });
  it('flags a wrong canonical, a missing og:image, and a long title', () => {
    const html = head({ path: '/other/', title: 'x'.repeat(61) }).replace(/<meta property="og:image"[^>]*>/, '');
    const p = headProblems(html, ctx).join('\n');
    assert.match(p, /canonical is/);
    assert.match(p, /missing og:image/);
    assert.match(p, /61 characters/);
  });
  it('flags og tags that do not match the visible tags', () => {
    const html = head().replace('<meta property="og:description" content="Estimate mulch.">', '<meta property="og:description" content="Other.">');
    assert.match(headProblems(html, ctx).join('\n'), /og:description does not match/);
  });
  it('flags HowTo and invalid JSON-LD', () => {
    const howto = head({ extra: '<script type="application/ld+json">{"@type":"HowTo"}</script>' });
    assert.match(headProblems(howto, ctx).join('\n'), /HowTo/);
    const bad = head({ extra: '<script type="application/ld+json">{nope}</script>' });
    assert.match(headProblems(bad, ctx).join('\n'), /invalid JSON-LD/);
  });
  it('lets a noindex page keep a different canonical', () => {
    const html = head({ path: '/404/', extra: '<meta name="robots" content="noindex">' });
    assert.deepEqual(headProblems(html, { ...ctx, urlPath: '/404.html' }), []);
  });
});

describe('duplicates', () => {
  it('reports only values used on more than one page', () => {
    assert.deepEqual(duplicates([['/a/', 'T'], ['/b/', 'T'], ['/c/', 'U'], ['/d/', null]]), { T: ['/a/', '/b/'] });
  });
});

describe('sitemap and sister links', () => {
  it('reads sitemap locs', () => {
    assert.deepEqual(sitemapLocs('<urlset><url><loc>https://a.example/</loc></url><url><loc> https://a.example/b/ </loc></url></urlset>'), ['https://a.example/', 'https://a.example/b/']);
  });
  const hosts = ['yardwastedropoff.com', 'hhwdropoff.com'];
  it('accepts https apex links with a trailing slash', () => {
    assert.deepEqual(sisterLinkProblems('https://hhwdropoff.com/paint-disposal/', hosts), []);
    assert.deepEqual(sisterLinkProblems('https://example.org/x', hosts), []);
  });
  it('rejects www, http, and a missing trailing slash', () => {
    assert.equal(sisterLinkProblems('http://www.yardwastedropoff.com/free-mulch', hosts).length, 3);
  });
  it('lists only other-origin http(s) links as outbound', () => {
    const html = '<a href="/x/">a</a><a href="https://homeandyardcalcs.com/y/">b</a><a href="http://www.homeandyardcalcs.com/">w</a><a href="https://hhwdropoff.com/">c</a><a href="mailto:a@b.c">d</a>';
    assert.deepEqual(outboundLinks(html, SITE), ['https://hhwdropoff.com/']);
  });
});

describe('dist fixtures', () => {
  const dist = mkdtempSync(join(tmpdir(), 'dist-lib-'));
  after(() => rmSync(dist, { recursive: true, force: true }));
  mkdirSync(join(dist, 'a'), { recursive: true });
  mkdirSync(join(dist, '_astro'), { recursive: true });
  writeFileSync(join(dist, 'robots.txt'), 'User-agent: *\n');
  writeFileSync(join(dist, '_astro', 'page.js'), 'import{x}from"./dep.js";console.log(x)');
  writeFileSync(join(dist, '_astro', 'dep.js'), 'export const x=1');
  writeFileSync(join(dist, '_astro', 'site.css'), 'body{margin:0}');
  writeFileSync(join(dist, 'a', 'index.html'), '<h2 id="faq">FAQ</h2><a href="/">home</a><a href="#faq">faq</a><a href="/#top">top</a><a href="../robots.txt">r</a>');
  writeFileSync(join(dist, 'index.html'), [
    '<link rel="stylesheet" href="/_astro/site.css"><script type="module" src="/_astro/page.js"></script>',
    '<div id="top"></div><a href="/a/">ok</a><a href="/a">no slash</a><a href="/missing/">gone</a><a href="/a/#nope">bad hash</a>',
    '<a href="http://homeandyardcalcs.com/a/">http</a><a href="https://www.homeandyardcalcs.com/a/">www</a><a href="https://hhwdropoff.com/">out</a><a href="mailto:x@y.z">m</a>',
  ].join(''));

  it('maps files to URL paths', () => {
    assert.equal(urlPathFor(dist, join(dist, 'index.html')), '/');
    assert.equal(urlPathFor(dist, join(dist, 'a', 'index.html')), '/a/');
    assert.equal(urlPathFor(dist, join(dist, '404.html')), '/404.html');
  });
  it('finds broken internal links and missing fragments, and ignores outbound links', () => {
    const p = brokenInternalLinks(dist, join(dist, 'index.html'), SITE);
    assert.deepEqual(p, ['/a (no built page; add a trailing slash)', '/missing/ (no built page)', '/a/#nope (missing #nope)', 'http://homeandyardcalcs.com/a/ (not https)', 'https://www.homeandyardcalcs.com/a/ (www host; link the apex)']);
  });
  it('passes a page whose links all resolve', () => {
    assert.deepEqual(brokenInternalLinks(dist, join(dist, 'a', 'index.html'), SITE), []);
  });
  it('counts HTML, stylesheets, module scripts, and their static imports', () => {
    const s = firstLoadSize(dist, join(dist, 'index.html'));
    assert.deepEqual(s.files.sort(), ['/_astro/dep.js', '/_astro/page.js', '/_astro/site.css']);
    assert.ok(s.gzip > 0 && s.raw > s.gzip / 2);
  });
});
