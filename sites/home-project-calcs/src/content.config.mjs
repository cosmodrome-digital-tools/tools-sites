import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Entry id = the tool folder name, e.g. "concrete-slab" from "concrete-slab/page.md".
const byFolder = ({ entry }) => entry.split('/')[0];

// Folders starting with "_" (the _template example) are never built or listed.
const toolPattern = (file) => [`*/${file}`, `!_*/**`];

const tools = defineCollection({
  loader: glob({ base: './tools', pattern: toolPattern('page.md'), generateId: byFolder }),
});

const scalar = z.union([z.string(), z.number()]);
const showIfCond = z.union([
  z.object({ field: z.string(), equals: scalar }),
  z.object({ field: z.string(), notEquals: scalar }),
  z.object({ field: z.string(), in: z.array(scalar).min(1) }),
]);

const input = z.looseObject({
  name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/),
  label: z.string(),
  type: z.enum(['number', 'select']).default('number'),
  unit: z.string().optional(),
  default: z.union([z.string(), z.number()]).optional(),
  help: z.string().optional(),
  group: z.string().optional(),
  advanced: z.boolean().optional(),          // true = inside the collapsible "Advanced settings" section
  showIf: z.union([showIfCond, z.array(showIfCond).min(1)]).optional(), // show only when another input matches
  options: z.array(z.object({ value: z.union([z.string(), z.number()]), label: z.string() })).optional(),
});

const output = z.looseObject({
  name: z.string(),
  label: z.string(),
  unit: z.string().optional(),
  decimals: z.number().int().min(0).max(6).default(2),
  primary: z.boolean().optional(),          // first primary = headline number; more primaries = key-figure tiles
  group: z.string().optional(),             // results breakdown section, e.g. "Buy", "Volume" (default "Details")
  unitGroup: z.string().optional(),         // outputs sharing a unitGroup are one row in two US units + a unit toggle
  unitGroupLabel: z.string().optional(),    // row label for a unitGroup (default: first member's label)
  format: z.enum(['number', 'yesno', 'fraction']).optional(), // yesno: 1/0 flag as Yes/No; fraction: inches to 1/16
});

const toolMeta = defineCollection({
  loader: glob({ base: './tools', pattern: toolPattern('meta.json'), generateId: byFolder }),
  schema: z.looseObject({   // Zod 4: keeps extra meta.json fields
    title: z.string(),
    benefit: z.string(),
    seoTitle: z.string().optional(),       // approved <title> before " | [Site]"; overrides "[title] - [benefit]"
    metaDescription: z.string(),
    primaryKeyword: z.string(),
    category: z.string(),
    lastUpdated: z.coerce.date(),
    sources: z.array(z.object({ title: z.string(), url: z.url(), accessed: z.coerce.date() })).min(1),
    cardBlurb: z.string().max(80).optional(), // 5-12 word benefit for homepage and related-tool cards
    layout: z.enum(['stacked', 'split', 'stepper']).default('split'),
    chartStyle: z.enum(['bar', 'line', 'donut', 'none']).default('none'),
    chartUnit: z.string().optional(),        // value-axis unit, e.g. "bags"
    chartXLabel: z.string().optional(),      // category-axis label, e.g. "Slab thickness"
    diagramCaption: z.string().optional(),   // caption under the labeled diagram
    inputs: z.array(input).min(1),
    outputs: z.array(output).min(1),
    advancedLabel: z.string().optional(),  // summary text for the Advanced section (default "Advanced settings")
    relatedTools: z.array(z.string()).default([]),
  }),
});

const sitePages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().default(false),       // true = shows a DRAFT banner (legal stubs)
    show: z.enum(['author', 'contact']).optional(), // adds the author bio or contact email from site.config
  }),
});

export const collections = { tools, toolMeta, sitePages };
