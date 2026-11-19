import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tools/**/*.test.js', 'src/**/*.test.js', 'worker.test.js'], // worker.test.js: www and sitemap.xml redirects
    environment: 'node',   // logic.js is pure (no DOM), so no jsdom needed
  },
});
