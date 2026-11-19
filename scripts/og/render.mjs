#!/usr/bin/env node
// Renders sites/home-project-calcs/src/og/og-image.svg to public/og-image.png (1200x630).
// One-off maintenance script, not part of the build. It needs Playwright with
// Chromium, which is NOT a repo dependency: run it where Playwright is already
// installed (for example `npx -y playwright@<version>` or a dev machine).
//   node scripts/og/render.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const site = join(root, 'sites', 'home-project-calcs');
const svg = readFileSync(join(site, 'src', 'og', 'og-image.svg'), 'utf8');
const { chromium } = createRequire(import.meta.url)('playwright');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
await page.screenshot({ path: join(site, 'public', 'og-image.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('wrote public/og-image.png');
