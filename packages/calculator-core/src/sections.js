/**
 * Turns a tool's rendered page.md HTML into collapsible sections for the
 * shared frame. Pure string work (no DOM) so it runs at build time and can be
 * unit-tested. Every word of page.md stays in the HTML: sections are wrapped in
 * native <details>/<summary>, never removed or hidden with script.
 *
 * - Each H2 starts a section. The H2 itself moves inside <summary>, so heading
 *   navigation, ids (#anchors) and SEO headings are unchanged.
 * - "How to use" stays open when it has 5 steps or fewer; every other section
 *   is closed by default.
 * - In the FAQ section each H3 question becomes its own nested <details>, and
 *   the questions and answers are returned for FAQPage JSON-LD.
 */

const KINDS = [
  ['about', /^what it calculates/i],
  ['howto', /^how to use/i],
  ['formula', /^the formula/i],
  ['example', /^worked example/i],
  ['read', /^how to read/i],
  ['limits', /^assumptions/i],
  ['faq', /^faq\b|frequently asked/i],
];

export const sectionKind = (title) => (KINDS.find(([, re]) => re.test(title.trim())) ?? ['extra'])[0];

export const stripTags = (html) =>
  String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?)])/g, '$1')
    .trim();

const slug = (s) => stripTags(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Split rendered HTML into the part before the first H2 and one entry per H2. */
export function splitSections(html) {
  const re = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi;
  const marks = [];
  let m;
  while ((m = re.exec(html))) marks.push({ start: m.index, end: re.lastIndex, attrs: m[1], inner: m[2] });
  const lead = (marks.length ? html.slice(0, marks[0].start) : html).trim();
  const sections = marks.map((mk, i) => {
    const body = html.slice(mk.end, i + 1 < marks.length ? marks[i + 1].start : html.length).trim();
    const id = (mk.attrs.match(/\bid="([^"]+)"/) ?? [])[1] ?? slug(mk.inner);
    const title = stripTags(mk.inner);
    return { id, title, titleHtml: mk.inner, body, kind: sectionKind(title) };
  });
  return { lead, sections };
}

/** FAQ body -> [{ id, question, questionHtml, answerHtml, answer }] split on H3s. */
export function splitFaq(body) {
  const re = /<h3\b([^>]*)>([\s\S]*?)<\/h3>/gi;
  const marks = [];
  let m;
  while ((m = re.exec(body))) marks.push({ start: m.index, end: re.lastIndex, attrs: m[1], inner: m[2] });
  return marks.map((mk, i) => {
    const answerHtml = body.slice(mk.end, i + 1 < marks.length ? marks[i + 1].start : body.length).trim();
    return {
      id: (mk.attrs.match(/\bid="([^"]+)"/) ?? [])[1] ?? slug(mk.inner),
      question: stripTags(mk.inner),
      questionHtml: mk.inner,
      answerHtml,
      answer: stripTags(answerHtml),
    };
  });
}

const SUMMARY_HINT = {
  about: 'What it estimates and who it is for',
  howto: 'Step by step',
  formula: 'Every variable and unit',
  example: 'Real numbers, worked by hand',
  read: 'Rounding and buying tips',
  limits: 'What this estimate does not cover',
  faq: 'Common questions',
  extra: 'Reference',
};

const countSteps = (body) => (body.match(/<li\b/gi) ?? []).length;

/** Render the sections as <details> accordions. Returns { html, faqs }. */
export function accordionize(html) {
  const { lead, sections } = splitSections(html);
  let faqs = [];
  const out = sections.map((s) => {
    const open = s.kind === 'howto' && countSteps(s.body) <= 5;
    let body = s.body;
    let count = '';
    if (s.kind === 'faq') {
      const qs = splitFaq(s.body);
      if (qs.length) {
        faqs = faqs.concat(qs.map(({ question, answer }) => ({ question, answer })));
        const before = s.body.slice(0, s.body.search(/<h3\b/i)).trim();
        body = `${before}${qs
          .map((q) => `<details class="tool-faq" id="faq-${q.id}"><summary><h3 id="${q.id}">${q.questionHtml}</h3></summary><div class="tool-faq__body">${q.answerHtml}</div></details>`)
          .join('')}`;
        count = `${qs.length} questions`;
      }
    }
    const hint = count || SUMMARY_HINT[s.kind];
    return `<details class="tool-section tool-section--${s.kind}" data-section="${s.kind}"${open ? ' open' : ''}><summary><h2 id="${s.id}">${s.titleHtml}</h2><span class="tool-section__hint">${hint}</span></summary><div class="tool-section__body">${body}</div></details>`;
  });
  return { html: `${lead}${out.join('')}`, faqs, sections };
}
