// sites/home-project-calcs/astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './src/site.config.mjs';

export default defineConfig({
  site: site.siteUrl,           // final URL (TODO placeholder lives in src/site.config.mjs); canonical URLs + sitemap
  output: 'static',             // the default; set explicitly. Every page is prerendered. No adapter
  trailingSlash: 'always',      // URLs end in "/" to match how Workers serves folder/index.html
  build: {
    format: 'directory',        // the default; /about/ is built as dist/about/index.html
  },
  outDir: './dist',             // the default; wrangler.jsonc assets.directory points here
  publicDir: './public',        // the default; ads.txt, favicon copied as-is
  integrations: [sitemap()],    // writes sitemap-index.xml and sitemap-0.xml to dist/
});
