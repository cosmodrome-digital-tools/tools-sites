/**
 * Shared wording shown by the frame under every tool's results. One place so
 * Legal can change it for every tool at once (Disclaimer v0.3, Appendix A).
 * The notice renders as: `${text} See our <a href={href}>{linkText}</a>.`
 */
export const RESULTS_NOTICE = {
  text: 'Estimates only. Check quantities with your supplier and local codes before you buy or build.',
  linkLead: 'See our',
  linkText: 'Disclaimer',
  href: '/disclaimer/',
};

/** Plain-text version (for tests and anywhere HTML isn't wanted). */
export const resultsNoticeText = (n = RESULTS_NOTICE) => `${n.text} ${n.linkLead} ${n.linkText}.`;
