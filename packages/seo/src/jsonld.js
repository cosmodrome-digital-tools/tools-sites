/**
 * JSON-LD builders. Rendered inline by JsonLd.astro (no external script).
 * WebApplication on tool pages, BreadcrumbList on every page below home,
 * FAQPage optional; WebSite on the home page. No ItemList on the hub: Google's
 * list carousels don't cover calculator pages, so it would only add bytes.
 * No HowTo (deprecated by Google).
 */
export function webApplication({ name, description, url, category = 'UtilitiesApplication' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: category,
    operatingSystem: 'Any (runs in the browser)',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

/**
 * Home page: the site itself. name + url are what Google's site-name feature
 * reads (https://developers.google.com/search/docs/appearance/site-names);
 * alternateName is optional. No person, no address.
 */
export function webSite({ name, url, alternateName, inLanguage = 'en-US' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    ...(alternateName ? { alternateName } : {}),
    url,
    inLanguage,
  };
}

/** items: [{ name, url }] in order from home to the current page. */
export function breadcrumbList(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** faqs: [{ question, answer }] (plain text answers). */
export function faqPage(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/** Serialize for a <script type="application/ld+json"> tag, escaping "<" so content can't close the tag. */
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
