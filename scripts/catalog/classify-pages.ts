/**
 * Step 1 — decide which flyer pages are worth a vision call.
 *
 * A flyer is ~95 pages, of which roughly half are food. Vision extraction is the
 * expensive part of the pipeline, so pages get filtered first — using `altText`
 * alone, in a single cheap text call (~9 KB of input for the whole flyer).
 */

import fs from 'fs';
import path from 'path';
import { Type, type Schema } from '@google/genai';
import { z } from 'zod';
import { generateJson } from '../lib/gemini';
import type { Flyer } from './flyer-api';

const OVERRIDES_FILE = path.join(__dirname, '..', '..', 'data', 'flyer-overrides.json');

const VERDICTS = ['food', 'maybe', 'skip'] as const;

const classificationSchema = z.object({
  pages: z.array(
    z.object({
      page: z.number().int().positive(),
      verdict: z.enum(VERDICTS),
      reason: z.string(),
    }),
  ),
});

const geminiClassificationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          page: { type: Type.NUMBER },
          verdict: { type: Type.STRING, enum: [...VERDICTS] },
          reason: { type: Type.STRING },
        },
        required: ['page', 'verdict', 'reason'],
        propertyOrdering: ['page', 'verdict', 'reason'],
      },
    },
  },
  required: ['pages'],
};

/**
 * Manual curation, checked into git: `{ "<flyer identifier>": { include: [1], exclude: [38] } }`.
 *
 * This is the human override from the original design — a file edit rather than
 * a chat round-trip, so the decision lands in git history next to the code.
 */
type Overrides = Record<string, { include?: number[]; exclude?: number[] }>;

const readOverrides = (identifier: string): { include: Set<number>; exclude: Set<number> } => {
  if (!fs.existsSync(OVERRIDES_FILE)) return { include: new Set(), exclude: new Set() };

  const all = JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf-8')) as Overrides;
  const entry = all[identifier] ?? {};
  return { include: new Set(entry.include ?? []), exclude: new Set(entry.exclude ?? []) };
};

const buildPrompt = (flyer: Flyer): string => {
  const list = flyer.pages.map((page) => `${page.number}. ${page.altText}`).join('\n');

  return `Below are one-sentence descriptions of the pages of a Lidl Slovakia flyer.

For each page decide whether it advertises FOOD or DRINK a person could cook with or consume:
- "food"  — the page clearly offers groceries (meat, produce, dairy, bakery, pantry staples,
            sweets, drinks, alcohol).
- "maybe" — unclear, mixed, or the description is too generic to tell.
- "skip"  — clearly not groceries: tools, garden, clothing, toys, stationery, cosmetics,
            cleaning products, pet supplies, plants, furniture, electronics, or a page that
            is pure advertising (loyalty app, competitions, job ads, recipes without prices).

When in doubt answer "maybe", never "skip" — a wrongly skipped page is lost data, while an
extra page costs one cheap call and gets filtered later anyway.

Return one entry per page, for every page listed, with a short reason.

PAGES:
${list}`;
};

export type PageSelection = {
  /** Pages to send to vision extraction, in flyer order. */
  selected: number[];
  /** Everything the classifier and the overrides decided, for logging/debugging. */
  verdicts: Map<number, { verdict: string; reason: string }>;
};

/**
 * Classifies the flyer's pages and returns the ones to extract products from.
 *
 * Keeps `food` **and** `maybe`: pushing a few extra pages through vision is
 * cheap, and Step 3's `foodRole` filter removes non-food more reliably than any
 * static page rule survives a flyer relayout.
 */
export const selectFoodPages = async (flyer: Flyer): Promise<PageSelection> => {
  const raw = await generateJson(buildPrompt(flyer), geminiClassificationSchema);
  const { pages } = classificationSchema.parse(raw);

  const verdicts = new Map(pages.map((page) => [page.page, { verdict: page.verdict, reason: page.reason }]));
  const { include, exclude } = readOverrides(flyer.identifier);

  const selected = flyer.pages
    .map((page) => page.number)
    .filter((number) => {
      if (exclude.has(number)) return false;
      if (include.has(number)) return true;
      const verdict = verdicts.get(number)?.verdict;
      return verdict === 'food' || verdict === 'maybe';
    });

  const missing = flyer.pages.filter((page) => !verdicts.has(page.number));
  if (missing.length > 0) {
    console.warn(`   ⚠️  Classifier skipped ${missing.length} page(s): ${missing.map((p) => p.number).join(', ')}`);
  }

  const foodCount = pages.filter((page) => page.verdict === 'food').length;
  const maybeCount = pages.filter((page) => page.verdict === 'maybe').length;
  console.log(`🔎 Page selection: ${selected.length} of ${flyer.pages.length} (${foodCount} food, ${maybeCount} maybe)`);
  if (include.size > 0 || exclude.size > 0) {
    console.log(`   Manual overrides applied: +[${[...include]}] -[${[...exclude]}]`);
  }

  return { selected, verdicts };
};
