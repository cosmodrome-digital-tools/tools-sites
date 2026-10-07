#!/usr/bin/env node
// Create a new tool from the site's tools/_template folder.
//
//   npm run new-tool -- --site home-project-calcs --tool concrete-slab
//   (--slug is accepted as an alias for --tool)
//
// Writes:
//   sites/<site>/tools/<tool>/        copied from tools/_template/
//   sites/<site>/src/pages/<tool>.astro  thin page file (generated; don't edit)
//
// --page-only  only (re)write the thin page file for an existing tool folder
//              (used when a tool folder arrives in a handoff zip)
// --root <dir> repo root to work in (used by the scaffold's own test)
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Slugs that would collide with site pages, generated files, or Astro routes.
export const RESERVED = new Set([
  'about', 'contact', 'privacy', 'terms', 'disclaimer', 'how-we-build', '404', 'index',
  'robots', 'sitemap', 'sitemap-index', 'sitemap-0', 'ads', 'favicon', 'page', 'tools', 'assets',
]);

export function validateSlug(slug) {
  if (!slug) return 'Missing --tool <tool-slug>.';
  if (!SLUG_RE.test(slug)) return `"${slug}" is not kebab-case (lowercase letters, numbers, single hyphens), e.g. "concrete-slab".`;
  if (slug.length > 60) return `"${slug}" is longer than 60 characters.`;
  if (RESERVED.has(slug)) return `"${slug}" is reserved for a site page or file.`;
  return null;
}

export function pageFileSource(slug) {
  return readFileSync(join(here, 'templates', 'tool-page.astro.tmpl'), 'utf8').replaceAll('__TOOL_SLUG__', slug);
}

export function scaffoldTool({ root, site, tool, pageOnly = false }) {
  const siteDir = join(root, 'sites', site);
  if (!site || !existsSync(join(siteDir, 'astro.config.mjs'))) throw new Error(`Site "${site}" not found at sites/${site}/.`);
  const err = validateSlug(tool);
  if (err) throw new Error(err);

  const templateDir = join(siteDir, 'tools', '_template');
  const toolDir = join(siteDir, 'tools', tool);
  const pageFile = join(siteDir, 'src', 'pages', `${tool}.astro`);

  if (pageOnly) {
    if (!existsSync(toolDir)) throw new Error(`--page-only: tools/${tool}/ doesn't exist.`);
  } else {
    if (existsSync(toolDir)) throw new Error(`tools/${tool}/ already exists. Pick another slug or use --page-only.`);
    if (existsSync(pageFile)) throw new Error(`src/pages/${tool}.astro already exists.`);
    if (!existsSync(templateDir)) throw new Error(`Template not found at sites/${site}/tools/_template/.`);
    cpSync(templateDir, toolDir, { recursive: true });
    for (const file of ['tool.css', 'HANDOFF.md']) {
      const p = join(toolDir, file);
      if (existsSync(p)) writeFileSync(p, readFileSync(p, 'utf8').replaceAll('_template', tool));
    }
  }
  writeFileSync(pageFile, pageFileSource(tool));
  return { toolDir, pageFile, files: readdirSync(toolDir) };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { values } = parseArgs({
    options: {
      site: { type: 'string' },
      tool: { type: 'string' },
      slug: { type: 'string' },
      root: { type: 'string' },
      'page-only': { type: 'boolean', default: false },
    },
  });
  const root = resolve(values.root ?? join(here, '..', '..'));
  const tool = values.tool ?? values.slug;
  try {
    const { toolDir, pageFile } = scaffoldTool({ root, site: values.site, tool, pageOnly: values['page-only'] });
    console.log(values['page-only'] ? `Wrote ${pageFile}` : `Created ${toolDir}\nCreated ${pageFile}`);
    if (!values['page-only']) {
      console.log(`
Next steps (see docs/BUILDING-TOOLS.md):
  1. Edit ONLY files in sites/${values.site}/tools/${tool}/
  2. Replace the template example in logic.js and every TODO in meta.json and page.md
  3. Write real tests in logic.test.js (3+ known answers + edge cases)
  4. npm test && npm run build`);
    }
  } catch (e) {
    console.error(`new-tool: ${e.message}`);
    process.exit(1);
  }
}
