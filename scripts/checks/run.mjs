#!/usr/bin/env node
// Repository checks run in CI after `npm run build` (see .github/workflows/ci.yml).
// FAIL = exit 1. WARN = printed, doesn't fail.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const fails = [];
const warns = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);
const read = (p) => readFileSync(p, 'utf8');
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOOL_FILES = ['logic.js', 'logic.test.js', 'ui.js', 'page.md', 'meta.json', 'tool.css'];
// tool.css may not touch these (ads, consent, header, footer, page chrome).
const FORBIDDEN_CSS = [/\.ad-slot/, /data-ad-slot/, /--ad-slot-height/, /consent/i, /\.site-header/, /\.site-footer/, /(^|[\s,{}])(header|footer|html|body|:root)\b/m];
const BANNED_TEXT = [/indexing\.googleapis\.com/i, /click (on )?(the |our |these )?ads?\b/i, /support us by clicking/i];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.astro' || name === '.wrangler') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const sitesDir = join(root, 'sites');
const sites = existsSync(sitesDir) ? readdirSync(sitesDir).filter((d) => statSync(join(sitesDir, d)).isDirectory()) : [];
const seenSlugs = new Map();

for (const site of sites) {
  const s = join(sitesDir, site);
  const rel = (p) => relative(root, p);

  // Site config
  const cfgPath = join(s, 'src', 'site.config.mjs');
  if (!existsSync(cfgPath)) { fail(`${site}: missing src/site.config.mjs`); continue; }
  const { default: cfg, isPlaceholderDomain } = await import(pathToFileURL(cfgPath).href);
  if (cfg.ads?.enabled && !/^pub-\d{16}$/.test(cfg.publisherId ?? '')) fail(`${site}: ads.enabled is true but publisherId is a placeholder`);
  if (isPlaceholderDomain || /<site-domain>|\.example$/.test(cfg.domain ?? '')) warn(`${site}: domain/contact email is still a placeholder (${cfg.contactEmail})`);

  // Wrangler config basics
  const wr = existsSync(join(s, 'wrangler.jsonc')) ? read(join(s, 'wrangler.jsonc')) : '';
  if (!wr) fail(`${site}: missing wrangler.jsonc`);
  else {
    if (!wr.includes(`"name": "tools-${site}"`)) fail(`${site}: wrangler.jsonc name must be "tools-${site}"`);
    if (!/"preview_urls":\s*true/.test(wr)) fail(`${site}: wrangler.jsonc must set "preview_urls": true`);
    if (/^\s*"main"\s*:/m.test(wr)) fail(`${site}: wrangler.jsonc must not set "main" (assets-only Worker)`);
  }

  // Required source files
  const adsTxt = join(s, 'public', 'ads.txt');
  if (!existsSync(adsTxt)) fail(`${site}: missing public/ads.txt`);
  else if (/pub-X{16}/.test(read(adsTxt)) || !/^google\.com,\s*pub-\d{16}/m.test(read(adsTxt))) warn(`${site}: ads.txt has no real publisher ID yet`);
  for (const page of ['privacy', 'terms', 'disclaimer', 'about', 'contact']) {
    if (!existsSync(join(s, 'src', 'content', 'pages', `${page}.md`))) fail(`${site}: missing src/content/pages/${page}.md`);
  }

  // Tools
  const toolsDir = join(s, 'tools');
  const toolSlugs = existsSync(toolsDir) ? readdirSync(toolsDir).filter((d) => statSync(join(toolsDir, d)).isDirectory()) : [];
  for (const slug of toolSlugs) {
    const t = join(toolsDir, slug);
    if (slug.startsWith('_')) continue; // _template: excluded from build, tests still run
    if (!SLUG_RE.test(slug)) fail(`${rel(t)}: folder name must be kebab-case`);
    if (seenSlugs.has(slug)) fail(`duplicate tool slug "${slug}" in ${seenSlugs.get(slug)} and ${site}`);
    seenSlugs.set(slug, site);
    for (const f of TOOL_FILES) if (!existsSync(join(t, f))) fail(`${rel(t)}: missing ${f}`);
    if (!existsSync(join(s, 'src', 'pages', `${slug}.astro`))) fail(`${rel(t)}: no src/pages/${slug}.astro (run: npm run new-tool -- --site ${site} --tool ${slug} --page-only)`);
    if (existsSync(join(t, 'meta.json'))) {
      let meta;
      try { meta = JSON.parse(read(join(t, 'meta.json'))); } catch { fail(`${rel(t)}/meta.json: invalid JSON`); }
      if (meta && !(Array.isArray(meta.sources) && meta.sources.some((x) => x?.url && x?.accessed))) fail(`${rel(t)}/meta.json: needs at least one source with url and accessed date`);
    }
    for (const f of ['meta.json', 'page.md']) if (existsSync(join(t, f)) && /TODO/.test(read(join(t, f)))) fail(`${rel(t)}/${f}: still contains TODO`);
    if (existsSync(join(t, 'logic.js')) && /TEMPLATE_EXAMPLE/.test(read(join(t, 'logic.js')))) fail(`${rel(t)}/logic.js: still the template example`);
    if (existsSync(join(t, 'tool.css'))) {
      const css = read(join(t, 'tool.css')).replace(/\/\*[\s\S]*?\*\//g, '');
      for (const re of FORBIDDEN_CSS) if (re.test(css)) fail(`${rel(t)}/tool.css: targets a forbidden selector (${re})`);
      const outside = css.split('}').map((b) => b.split('{')[0].trim()).filter(Boolean).filter((sel) => sel.split(',').some((x) => !x.trim().startsWith(`[data-tool="${slug}"]`) && !x.trim().startsWith('@')));
      if (outside.length) fail(`${rel(t)}/tool.css: every rule must start with [data-tool="${slug}"] (found: ${outside[0]})`);
    }
    for (const f of walk(join(t, 'assets'))) if (statSync(f).size > 100 * 1024) warn(`${rel(f)}: larger than 100 KB`);
  }
  // Orphan page files: src/pages/<x>.astro with no tool folder
  for (const f of readdirSync(join(s, 'src', 'pages'))) {
    const m = f.match(/^([a-z0-9-]+)\.astro$/);
    if (m && !['index', '404'].includes(m[1]) && !toolSlugs.includes(m[1])) fail(`${site}: src/pages/${f} has no matching tools/${m[1]}/ folder`);
  }

  // Built output
  const dist = join(s, 'dist');
  if (!existsSync(dist)) { fail(`${site}: no dist/ (run npm run build first)`); continue; }
  for (const f of ['sitemap-index.xml', '404.html', 'robots.txt', 'ads.txt']) if (!existsSync(join(dist, f))) fail(`${site}: dist/ lacks ${f}`);
  if (existsSync(join(dist, 'robots.txt'))) {
    const robots = read(join(dist, 'robots.txt'));
    if (!/User-agent: Mediapartners-Google\s*\nAllow: \//.test(robots)) fail(`${site}: robots.txt must allow Mediapartners-Google`);
    if (!/^Sitemap: https:\/\/\S+\/sitemap-index\.xml$/m.test(robots)) fail(`${site}: robots.txt needs a sitemap-index.xml line`);
  }
  for (const f of walk(dist).filter((p) => p.endsWith('.html'))) {
    const html = read(f);
    const ext = [...html.matchAll(/<script\b[^>]*\bsrc=["']?(https?:)?\/\//gi)];
    if (ext.length) fail(`${rel(f)}: loads an external script`);
    if (/_template/.test(f)) fail(`${rel(f)}: _template must not be built`);
  }
  if (existsSync(join(dist, '_template'))) fail(`${site}: _template was built`);
  for (const f of walk(dist).filter((p) => /sitemap-\d+\.xml$/.test(p))) if (/_template/.test(read(f))) fail(`${site}: _template is in the sitemap`);
}

// Banned code or text anywhere in site and package sources
for (const f of [...walk(join(root, 'sites')), ...walk(join(root, 'packages'))]) {
  if (!/\.(astro|md|js|mjs|json|css|html|txt)$/.test(f)) continue;
  const text = read(f);
  for (const re of BANNED_TEXT) if (re.test(text)) fail(`${relative(root, f)}: banned text (${re})`);
}

for (const w of warns) console.log(`WARN  ${w}`);
for (const f of fails) console.log(`FAIL  ${f}`);
console.log(`\nchecks: ${sites.length} site(s), ${fails.length} failure(s), ${warns.length} warning(s)`);
process.exit(fails.length ? 1 : 0);
