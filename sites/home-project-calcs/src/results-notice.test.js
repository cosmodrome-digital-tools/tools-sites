// The shared estimates notice (Disclaimer v0.3, Appendix A) is rendered by the
// shared frame under every tool's results, from one string in
// @tools/calculator-core/notices.js. When dist/ exists (after `npm run build`),
// every built tool page is checked for it; the source checks always run.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { RESULTS_NOTICE, resultsNoticeText } from '@tools/calculator-core/notices.js';

const siteDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(siteDir, 'dist');
const tools = readdirSync(join(siteDir, 'tools')).filter((d) => !d.startsWith('_')).sort();
const resultsSrc = readFileSync(join(siteDir, '../../packages/calculator-core/src/Results.astro'), 'utf8');

describe('shared results notice', () => {
  it('is one shared string that links to the Disclaimer', () => {
    expect(resultsNoticeText()).toBe(
      'Estimates only. Check quantities with your supplier and local codes before you buy or build. See our Disclaimer.',
    );
    expect(RESULTS_NOTICE.href).toBe('/disclaimer/');
  });

  it('is rendered by the shared Results component, not per tool', () => {
    expect(resultsSrc).toContain("import { RESULTS_NOTICE as notice } from './notices.js'");
    expect(resultsSrc).toContain('data-results-notice');
    for (const t of tools) {
      for (const f of readdirSync(join(siteDir, 'tools', t))) {
        if (/\.(js|md|json|css)$/.test(f)) expect(readFileSync(join(siteDir, 'tools', t, f), 'utf8')).not.toContain('Estimates only. Check quantities');
      }
    }
  });

  for (const slug of tools) {
    it.skipIf(!existsSync(distDir))(`${slug}: built page shows the notice inside the results, outside any ad slot`, () => {
      const html = readFileSync(join(distDir, slug, 'index.html'), 'utf8');
      const m = html.match(/<p class="calc-results__notice"[^>]*data-results-notice[^>]*>([\s\S]*?)<\/p>/);
      expect(m, 'notice paragraph').not.toBeNull();
      const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      expect(text).toBe(resultsNoticeText());
      expect(m[1]).toContain('href="/disclaimer/"');
      const resultsStart = html.indexOf('data-calc-results');
      const resultsEnd = html.indexOf('</section>', resultsStart);
      expect(m.index).toBeGreaterThan(resultsStart);
      expect(m.index).toBeLessThan(resultsEnd);
      expect((html.match(/data-results-notice/g) ?? []).length).toBe(1);
    });
  }

  it.skipIf(!existsSync(distDir))('the Workers Builds smoke comment is gone from every page', () => {
    for (const slug of ['', ...tools, 'about']) {
      const file = join(distDir, slug, 'index.html');
      if (existsSync(file)) expect(readFileSync(file, 'utf8')).not.toContain('CF Workers Builds preview smoke');
    }
  });
});
