// Built to dist/robots.txt. Generated (instead of a static public/robots.txt)
// so the Sitemap line uses the single domain setting in src/site.config.mjs.
export function GET({ site }) {
  const sitemap = new URL('sitemap-index.xml', site).href;
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: Googlebot',
    'Allow: /',
    '',
    'User-agent: Mediapartners-Google',
    'Allow: /',
    '',
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
