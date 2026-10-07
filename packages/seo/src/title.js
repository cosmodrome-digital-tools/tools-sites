/**
 * Title pattern for tool pages: "[Tool name] - [main benefit] | [Site]".
 * A tool can override the part before " | [Site]" with meta.json "seoTitle"
 * (an approved SEO title); the site name is still appended exactly once.
 * Other pages: "[Page title] | [Site]". The home page uses the site name alone
 * (or "[Site] - [tagline]" when a tagline is given).
 */
export function toolTitle(toolName, benefit, siteName, seoTitle) {
  if (seoTitle && siteName) {
    const suffix = ` | ${siteName}`;
    const base = seoTitle.endsWith(suffix) ? seoTitle.slice(0, -suffix.length) : seoTitle;
    return `${base}${suffix}`;
  }
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
