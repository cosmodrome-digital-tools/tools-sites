import { describe, expect, it } from 'vitest';
import worker from './worker.js';

const assets = { fetch: async () => new Response('ok', { status: 200 }) };
const get = (url) => worker.fetch(new Request(url), { ASSETS: assets });

describe('www redirect worker', () => {
  it('redirects www to the apex and preserves path and query', async () => {
    const res = await get('https://www.homeandyardcalcs.com/privacy/?x=1');
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('https://homeandyardcalcs.com/privacy/?x=1');
  });
  it('passes the apex through to assets', async () => {
    const res = await get('https://homeandyardcalcs.com/');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');
  });
});

describe('sitemap.xml alias', () => {
  it('301s /sitemap.xml to /sitemap-index.xml on the apex', async () => {
    const res = await get('https://homeandyardcalcs.com/sitemap.xml');
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('https://homeandyardcalcs.com/sitemap-index.xml');
  });
  it('301s /sitemap.xml/ (trailing slash) and drops a query string', async () => {
    const res = await get('https://homeandyardcalcs.com/sitemap.xml/?utm=x');
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('https://homeandyardcalcs.com/sitemap-index.xml');
  });
  it('sends www /sitemap.xml straight to the apex index in one hop', async () => {
    const res = await get('https://www.homeandyardcalcs.com/sitemap.xml');
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('https://homeandyardcalcs.com/sitemap-index.xml');
  });
  it('serves the real sitemap files from assets (no redirect loop)', async () => {
    for (const path of ['/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt']) {
      const res = await get(`https://homeandyardcalcs.com${path}`);
      expect(res.status).toBe(200);
    }
  });
  it('does not redirect lookalike paths', async () => {
    for (const path of ['/sitemap.xml.gz', '/sitemaps.xml', '/x/sitemap.xml']) {
      const res = await get(`https://homeandyardcalcs.com${path}`);
      expect(res.status).toBe(200);
    }
  });
});
