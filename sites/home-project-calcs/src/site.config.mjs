// Site-wide settings for Home & Yard Calcs (display name; the slug stays home-project-calcs). This is the ONLY place the
// domain lives: astro.config.mjs, robots.txt, canonical URLs, the sitemap, and
// the contact email all read it from here.

const domain = 'homeandyardcalcs.com';
const name = 'Home & Yard Calcs';

export default {
  name,
  // Homepage <title> (approved by Content & SEO; 60 characters or fewer).
  homeTitle: `${name} - Home Project Materials Calculators`,
  slug: 'home-project-calcs',
  tagline: 'Free materials calculators for US home projects',
  description:
    'Free calculators that estimate materials for US home projects in feet, inches, cubic yards, and bag sizes, with the formula, waste allowance, and sources shown.',
  domain,
  siteUrl: `https://${domain}`,
  // Business inbox (Gmail). No domain mailbox or Email Routing is configured.
  contactEmail: 'cosmodromedigital@gmail.com',
  // Placeholder until the owner provides the real AdSense publisher ID. Public by design, not a secret.
  publisherId: 'pub-XXXXXXXXXXXXXXXX',
  // The ONE switch for AdSense. Off until the publisher ID, consent messages, and ad code PR exist.
  ads: { enabled: false },
  author: {
    name: 'Drew Kessler',
    bio:
      "Drew runs the site's tools and reviews each page before launch. Each estimator shows its formula, waste allowances, and dated sources. He's interested in the trades and small business.",
    // Shown under the bio on the About page. Matches the Disclaimer (Section 3.3).
    penNameNote: `Drew Kessler is a pen name used by the ${name} team.`,
  },
};

export const isPlaceholderDomain = domain.endsWith('.example');
