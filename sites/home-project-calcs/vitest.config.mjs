import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tools/**/*.test.js', 'src/**/*.test.js'],
    environment: 'node',   // logic.js is pure (no DOM), so no jsdom needed
  },
});
