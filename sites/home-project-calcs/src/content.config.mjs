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

const input = z.looseObject({
  name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/),
  label: z.string(),
  type: z.enum(['number', 'select']).default('number'),
  unit: z.string().optional(),
  default: z.union([z.string(), z.number()]).optional(),
  help: z.string().optional(),
  group: z.string().optional(),
  options: z.array(z.object({ value: z.union([z.string(), z.number()]), label: z.string() })).optional(),
});

const output = z.looseObject({
  name: z.string(),
  label: z.string(),
  unit: z.string().optional(),
  decimals: z.number().int().min(0).max(6).default(2),
  primary: z.boolean().optional(),
});

const toolMeta = defineCollection({
  loader: glob({ base: './tools', pattern: toolPattern('meta.json'), generateId: byFolder }),
  schema: z.looseObject({   // Zod 4: keeps extra meta.json fields
    title: z.string(),
    benefit: z.string(),
    metaDescription: z.string(),
    primaryKeyword: z.string(),
    category: z.string(),
    lastUpdated: z.coerce.date(),
    sources: z.array(z.object({ title: z.string(), url: z.url(), accessed: z.coerce.date() })).min(1),
    layout: z.enum(['stacked', 'split', 'stepper']).default('stacked'),
    chartStyle: z.enum(['bar', 'line', 'donut', 'none']).default('none'),
    inputs: z.array(input).min(1),
    outputs: z.array(output).min(1),
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
