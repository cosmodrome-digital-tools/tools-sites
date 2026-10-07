/**
 * Title pattern for tool pages: "[Tool name] - [main benefit] | [Site]".
 * Other pages: "[Page title] | [Site]". The home page uses the site name alone
 * (or "[Site] - [tagline]" when a tagline is given).
 */
export function toolTitle(toolName, benefit, siteName) {
  if (!toolName || !benefit || !siteName) throw new Error('toolTitle needs toolName, benefit, and siteName');
  return `${toolName} - ${benefit} | ${siteName}`;
}

export function pageTitle(title, siteName) {
  return title ? `${title} | ${siteName}` : siteName;
}

/** Absolute canonical URL with a trailing slash for page paths (matches trailingSlash: 'always'). */
export function canonicalUrl(pathname, site) {
  const url = new URL(pathname, site);
  if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname)) url.pathname += '/';
  url.search = '';
  url.hash = '';
  return url.href;
}
