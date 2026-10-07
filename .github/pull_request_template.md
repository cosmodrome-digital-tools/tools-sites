Preview: <preview link from Cloudflare's Workers Builds comment on this PR; one per site if several sites rebuild>

## What to check
- <plain-English check 1, e.g. "Enter a 10 ft x 12 ft slab, 4 in thick: it should need about 1.5 cubic yards">
- <check 2: the page reads well on your phone>
- <check 3: facts, numbers, or rates to confirm by hand>

## What this PR does
<one or two sentences>

Site: <site-slug>    Tool: <tool-slug or n/a>    Type: new-tool / content / fix / compliance / infra

## Why
<reason, linked ticket or register row>

## Tests
- [ ] CI is green (unit tests + build)
- [ ] Preview link at the top works and the tool works there
- Known-answer cases checked against: <reference calculator or hand math>
- Edge cases covered: zero, negative, very large, empty, non-numeric

## Pre-publish checklist (work plan, section 7)
- [ ] Page template complete (what it calculates, how to use, formula, worked example, how to read results, assumptions and limits, FAQ, dated sources)
- [ ] CI tests pass
- [ ] Worked example recalculated
- [ ] Sources linked and dated
- [ ] Unique addition present (chart, comparison, scenario toggle, printable summary, or real-world tip)
- [ ] No near-duplicate of an existing page
- [ ] Keyword/intent register checked: no overlap with any existing tool
- [ ] Resource section unique to this page (nothing reused from another tool)
- [ ] Ads not near inputs or buttons; ad space reserved (no layout shift)
- [ ] Title and meta description written
- [ ] Internal links added (hub, related tools, breadcrumbs)
- [ ] No click-request wording anywhere
- [ ] Schema present (WebApplication, BreadcrumbList)
- [ ] Per-tool look (tool.css, illustration, chart style) keeps the shared frame, leaves ad slots untouched, and meets WCAG AA contrast
- [ ] Weekly publishing cap respected for this site
- [ ] Matthew approved in chat (merge only after "merge pull request #N")
