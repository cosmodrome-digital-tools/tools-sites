// Scaffold test (node:test): scaffolds a tool into a temp copy of a fixture
// site and checks every required file exists. Run by the root `npm test`.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { scaffoldTool, validateSlug } from './tool.mjs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tmp = mkdtempSync(join(tmpdir(), 'scaffold-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

// Fixture: the real site's _template plus the minimum the scaffold needs.
const site = 'fixture-site';
const siteDir = join(tmp, 'sites', site);
mkdirSync(join(siteDir, 'src', 'pages'), { recursive: true });
writeFileSync(join(siteDir, 'astro.config.mjs'), 'export default {};\n');
cpSync(join(repo, 'sites', 'home-project-calcs', 'tools', '_template'), join(siteDir, 'tools', '_template'), { recursive: true });

const REQUIRED = ['logic.js', 'logic.test.js', 'ui.js', 'page.md', 'meta.json', 'tool.css', 'HANDOFF.md', 'assets/hero.svg'];

test('rejects bad slugs', () => {
  for (const bad of ['', 'Concrete', 'concrete_slab', 'concrete--slab', '-x', 'about', '_template']) {
    assert.ok(validateSlug(bad), `expected "${bad}" to be rejected`);
  }
  assert.equal(validateSlug('concrete-slab'), null);
});

test('creates the full tool folder and the thin page file', () => {
  scaffoldTool({ root: tmp, site, tool: 'example-tool' });
  const toolDir = join(siteDir, 'tools', 'example-tool');
  for (const f of REQUIRED) assert.ok(existsSync(join(toolDir, f)), `missing ${f}`);
  const page = readFileSync(join(siteDir, 'src', 'pages', 'example-tool.astro'), 'utf8');
  assert.match(page, /getEntry\('tools', slug\)/);
  assert.match(page, /tools\/example-tool\/ui\.js/);
  assert.doesNotMatch(page, /__TOOL_SLUG__/);
  assert.match(readFileSync(join(toolDir, 'tool.css'), 'utf8'), /\[data-tool="example-tool"\]/);
  JSON.parse(readFileSync(join(toolDir, 'meta.json'), 'utf8'));
});

test('refuses to overwrite an existing tool', () => {
  assert.throws(() => scaffoldTool({ root: tmp, site, tool: 'example-tool' }), /already exists/);
});

test('--page-only rewrites just the page file', () => {
  rmSync(join(siteDir, 'src', 'pages', 'example-tool.astro'));
  scaffoldTool({ root: tmp, site, tool: 'example-tool', pageOnly: true });
  assert.ok(existsSync(join(siteDir, 'src', 'pages', 'example-tool.astro')));
});

test('refuses an unknown site', () => {
  assert.throws(() => scaffoldTool({ root: tmp, site: 'nope', tool: 'x' }), /not found/);
});
