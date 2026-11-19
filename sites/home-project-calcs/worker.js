const APEX = 'homeandyardcalcs.com';

// Conventional sitemap URLs that crawlers and SEO tools request by habit. The
// real sitemap is @astrojs/sitemap's sitemap-index.xml (robots.txt points at it),
// so these 301 there instead of serving the HTML 404 page.
const SITEMAP_ALIASES = new Set(['/sitemap.xml', '/sitemap.xml/']);
const SITEMAP_INDEX = '/sitemap-index.xml';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX;
      url.protocol = 'https:';
      if (SITEMAP_ALIASES.has(url.pathname)) url.pathname = SITEMAP_INDEX;
      return new Response(null, {
        status: 301,
        headers: { Location: url.href },
      });
    }
    if (SITEMAP_ALIASES.has(url.pathname)) {
      url.pathname = SITEMAP_INDEX;
      url.search = '';
      return new Response(null, {
        status: 301,
        headers: { Location: url.href },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
