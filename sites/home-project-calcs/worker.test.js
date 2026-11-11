import { describe, expect, it } from 'vitest';
import worker from './worker.js';

const assets = { fetch: async () => new Response('ok', { status: 200 }) };

describe('www redirect worker', () => {
  it('redirects www to the apex and preserves path and query', async () => {
    const res = await worker.fetch(new Request('https://www.homeandyardcalcs.com/privacy/?x=1'), { ASSETS: assets });
    expect(res.status).toBe(301);
    expect(res.headers.get('Location')).toBe('https://homeandyardcalcs.com/privacy/?x=1');
  });
  it('passes the apex through to assets', async () => {
    const res = await worker.fetch(new Request('https://homeandyardcalcs.com/'), { ASSETS: assets });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');
  });
});
