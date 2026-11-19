// Helpers for checks that read a site's built dist/ (used by run.mjs and its tests).
// Pure Node: no dependencies, no network.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

/** Every .html file under dir (absolute paths). */
export function listHtml(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) listHtml(p, out);
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}

/** "/about/" for dist/about/index.html, "/" for dist/index.html, "/404.html" for dist/404.html. */
export function urlPathFor(dist, file) {
  const rel = relative(dist, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

const decode = (s) => s
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** <meta name|property="key" content="..."> value (decoded), or null. Attribute order independent. */
export function metaContent(html, key) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const k = tag.match(/\b(?:name|property)=["']([^"']+)["']/i)?.[1];
    if (k === key) {
      const c = tag.match(/\bcontent=(?:"([^"]*)"|'([^']*)')/i);
      return c ? decode(c[1] ?? c[2]) : null;
    }
  }
  return null;
}

export function titleOf(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? decode(m[1]) : null;
}

export function canonicalOf(html) {
  const tag = (html.match(/<link\b[^>]*>/gi) ?? []).find((t) => /\brel=["']canonical["']/i.test(t));
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? null;
}

export function isNoindex(html) {
  return /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

/** JSON-LD blocks parsed from the page (throws on invalid JSON). */
export function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => JSON.parse(m[1]));
}

/** All <a href> values, decoded. */
export function anchorHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')/gi)].map((m) => decode(m[1] ?? m[2]));
}

/** Every id="..." on the page (for #fragment checks). */
export function idsOf(html) {
  return new Set([...html.matchAll(/\bid=(?:"([^"]+)"|'([^']+)')/gi)].map((m) => m[1] ?? m[2]));
}

/**
 * Resolve a same-site URL path to a file in dist (mirrors Workers
 * auto-trailing-slash html handling). Returns the file path or null.
 */
export function resolveInDist(dist, pathname) {
  const clean = decodeURIComponent(pathname.split('#')[0].split('?')[0]);
  const candidates = clean.endsWith('/')
    ? [join(dist, clean, 'index.html')]
    : [join(dist, clean), join(dist, `${clean}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

/**
 * Internal link problems on one page: hrefs that point at the site (relative
 * or the site's own origin) and don't resolve to a built file, plus same-page
 * or cross-page #fragments that don't exist.
 */
export function brokenInternalLinks(dist, file, siteUrl) {
  const html = readFileSync(file, 'utf8');
  const site = new URL(siteUrl);
  const pagePath = urlPathFor(dist, file);
  const problems = [];
  for (const href of anchorHrefs(html)) {
    if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    let url;
    try { url = new URL(href, `${site.origin}${pagePath}`); } catch { problems.push(`${href} (unparseable)`); continue; }
    if (url.hostname !== site.hostname && url.hostname !== `www.${site.hostname}`) continue; // outbound: listed separately
    if (url.protocol !== 'https:') { problems.push(`${href} (not https)`); continue; }
    if (url.hostname !== site.hostname) { problems.push(`${href} (www host; link the apex)`); continue; }
    const target = resolveInDist(dist, url.pathname);
    if (!target) {
      const hint = !url.pathname.endsWith('/') && resolveInDist(dist, `${url.pathname}/`) ? '; add a trailing slash' : '';
      problems.push(`${href} (no built page${hint})`);
      continue;
    }
    if (url.hash && url.hash !== '#') {
      const ids = target === file ? idsOf(html) : idsOf(readFileSync(target, 'utf8'));
      if (!ids.has(decodeURIComponent(url.hash.slice(1)))) problems.push(`${href} (missing #${url.hash.slice(1)})`);
    }
  }
  return problems;
}

/** Outbound (other-origin http/https) hrefs on one page. */
export function outboundLinks(html, siteUrl) {
  const host = new URL(siteUrl).hostname;
  return anchorHrefs(html).filter((h) => {
    if (!/^https?:\/\//i.test(h)) return false;
    const { hostname } = new URL(h);
    return hostname !== host && hostname !== `www.${host}`;
  });
}

/**
 * First-load bytes for one page: the HTML plus the CSS and JS it references
 * (stylesheets, module scripts, and their static imports). Images are not
 * counted. Returns { files: [...], raw, gzip }.
 */
export function firstLoadSize(dist, file) {
  const html = readFileSync(file, 'utf8');
  const seen = new Set();
  const queue = [];
  for (const m of html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)) {
    const href = m[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (href?.startsWith('/')) queue.push(href);
  }
  for (const m of html.matchAll(/<script\b[^>]*\bsrc=["'](\/[^"']+)["']/gi)) queue.push(m[1]);
  while (queue.length) {
    const p = queue.shift();
    if (seen.has(p)) continue;
    seen.add(p);
    if (p.endsWith('.js')) {
      const js = readFileSync(join(dist, p), 'utf8');
      for (const im of js.matchAll(/(?:\bfrom|\bimport)\s*["'](\.{1,2}\/[^"']+\.js)["']/g)) {
        queue.push(posix.join(posix.dirname(p), im[1]));
      }
    }
  }
  const bufs = [readFileSync(file), ...[...seen].map((p) => readFileSync(join(dist, p)))];
  return {
    files: [...seen],
    raw: bufs.reduce((n, b) => n + b.length, 0),
    gzip: bufs.reduce((n, b) => n + gzipSync(b, { level: 9 }).length, 0),
  };
}

/**
 * Head-tag problems on one built page. ctx: { urlPath, siteUrl, siteName, locale }.
 * Checks the visible tags against each other (og:* must match title,
 * description, canonical) and that og:image is an absolute URL on the site.
 */
export function headProblems(html, { urlPath, siteUrl, siteName, locale = 'en_US' }) {
  const p = [];
  const title = titleOf(html);
  const desc = metaContent(html, 'description');
  const canonical = canonicalOf(html);
  const expectedCanonical = new URL(urlPath, siteUrl).href;
  if (!title) p.push('missing <title>');
  else if (title.length > 60) p.push(`<title> is ${title.length} characters (max 60)`);
  if (!desc) p.push('missing meta description');
  else if (desc.length > 160) p.push(`meta description is ${desc.length} characters (max 160)`);
  // A noindex page (the 404) may point its canonical elsewhere; it still needs one.
  if (!canonical) p.push('missing canonical');
  else if (!isNoindex(html) && canonical !== expectedCanonical) p.push(`canonical is ${canonical}, expected ${expectedCanonical}`);
  const og = (k) => metaContent(html, `og:${k}`);
  if (og('title') !== title) p.push('og:title does not match <title>');
  if (og('description') !== desc) p.push('og:description does not match the meta description');
  if (og('url') !== canonical) p.push('og:url does not match the canonical');
  if (og('site_name') !== siteName) p.push(`og:site_name is not "${siteName}"`);
  if (og('locale') !== locale) p.push(`og:locale is not ${locale}`);
  const image = og('image');
  if (!image) p.push('missing og:image');
  else if (!image.startsWith(`${new URL(siteUrl).origin}/`)) p.push(`og:image must be an absolute https URL on the site (${image})`);
  if (!metaContent(html, 'twitter:card')) p.push('missing twitter:card');
  let blocks = [];
  try { blocks = jsonLdBlocks(html); } catch (e) { p.push(`invalid JSON-LD (${e.message})`); }
  if (blocks.some((b) => b['@type'] === 'HowTo')) p.push('HowTo JSON-LD is not allowed (deprecated by Google)');
  return p;
}

/** Values that appear on more than one page: { value: [paths] } for duplicates only. */
export function duplicates(entries) {
  const by = new Map();
  for (const [path, value] of entries) {
    if (!value) continue;
    by.set(value, [...(by.get(value) ?? []), path]);
  }
  return Object.fromEntries([...by].filter(([, paths]) => paths.length > 1));
}

/** <loc> URLs in a sitemap XML string. */
export function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/**
 * Problems with a link to a sister site: https only, apex host (no www.), and
 * a trailing slash on page paths, to match how those sites serve URLs.
 */
export function sisterLinkProblems(href, hosts) {
  let url;
  try { url = new URL(href); } catch { return [`${href}: unparseable`]; }
  const bare = url.hostname.replace(/^www\./, '');
  if (!hosts.includes(bare)) return [];
  const p = [];
  if (url.protocol !== 'https:') p.push(`${href}: use https`);
  if (url.hostname !== bare) p.push(`${href}: use the apex host ${bare} (no www.)`);
  if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname)) p.push(`${href}: add a trailing slash`);
  return p;
}
