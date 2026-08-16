/**
 * Step 2 — read the products off each selected flyer page.
 *
 * One Gemini call per page, run concurrently. Deliberately not one call with all
 * page images batched: accuracy degrades in a long multi-image context, a failed
 * page can be retried on its own, and one page's mistake can't contaminate the rest.
 */

import fs from 'fs';
import path from 'path';
import { Type, type Schema } from '@google/genai';
import { z } from 'zod';
import { generateJson } from '../lib/gemini';
import { mapWithLimit } from '../lib/concurrency';
import type { Flyer } from './flyer-api';

const DUMP_DIR = path.join(__dirname, '..', '..', 'data', 'pages');

/**
 * Parallel Gemini calls.
 *
 * The real throughput ceiling is the API quota, enforced globally in
 * lib/rate-limit.ts — this only decides how many calls sit in flight while
 * waiting for it. Keeping it above 1 means the pacing gaps overlap with work.
 */
const CONCURRENCY = 5;

/** One retry per page. Quota errors are already handled (and waited out) inside the client. */
const MAX_ATTEMPTS = 2;

export const FOOD_ROLES = ['ingredient', 'snack', 'drink', 'ready_meal', 'nonfood'] as const;

const rawProductSchema = z.object({
  name: z.string().min(1),
  isFood: z.boolean(),
  foodRole: z.enum(FOOD_ROLES),
  price: z.number().min(0),
  oldPrice: z.number().min(0),
  discountPercent: z.number().min(0),
  priceLabel: z.string(),
  packInfo: z.string(),
  isLidlPlus: z.boolean(),
});

const pageResultSchema = z.object({
  validFrom: z.string(),
  validTo: z.string(),
  products: z.array(rawProductSchema),
});

export type RawProduct = z.infer<typeof rawProductSchema>;
export type PageResult = z.infer<typeof pageResultSchema> & { page: number };

const geminiPageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    validFrom: { type: Type.STRING },
    validTo: { type: Type.STRING },
    products: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          isFood: { type: Type.BOOLEAN },
          foodRole: { type: Type.STRING, enum: [...FOOD_ROLES] },
          price: { type: Type.NUMBER },
          oldPrice: { type: Type.NUMBER },
          discountPercent: { type: Type.NUMBER },
          priceLabel: { type: Type.STRING },
          packInfo: { type: Type.STRING },
          isLidlPlus: { type: Type.BOOLEAN },
        },
        required: ['name', 'isFood', 'foodRole', 'price', 'oldPrice', 'discountPercent', 'priceLabel', 'packInfo', 'isLidlPlus'],
        propertyOrdering: ['name', 'isFood', 'foodRole', 'price', 'oldPrice', 'discountPercent', 'priceLabel', 'packInfo', 'isLidlPlus'],
      },
    },
  },
  required: ['validFrom', 'validTo', 'products'],
};

/**
 * The extraction prompt.
 *
 * The "never infer oldPrice" rule is the load-bearing line: roughly a third of
 * Lidl's offers print a promo price with no reference price at all, and a model
 * left to its own devices will happily invent a plausible one. A guessed
 * original price turns the app's headline savings figure into a lie, so the
 * model is told to leave it at 0 and Step 3 handles the consequences.
 */
const EXTRACTION_PROMPT = `Extract every product offer printed on this Lidl Slovakia flyer page.

For each offer:
- "name": the product name as printed, without the price.
- "isFood": true only if it is edible or drinkable.
- "foodRole": "ingredient" if someone would COOK with it (meat, fish, vegetables, fruit,
  dairy, flour, pasta, rice, oil, spices, cheese, eggs); "snack" for crisps, sweets,
  chocolate, biscuits, nuts eaten as-is; "drink" for any beverage including alcohol;
  "ready_meal" for finished food needing no cooking (ice cream, desserts, ready dishes,
  canned meals); "nonfood" for everything inedible.
- "price": the current promotional price as a number.
- "oldPrice": ONLY if a struck-through original price is actually printed on the page.
  If there is no struck-through price, return 0. NEVER infer, estimate or calculate it —
  a badge like "UŠETRITE -31 %" or "Nová nižšia cena" without a visible struck-through
  price means oldPrice is 0.
- "discountPercent": the explicitly printed percentage, otherwise 0.
- "packInfo": the pack/unit text as printed, e.g. "500 g", "1 l", "cena za 1 kg".
  Copy it exactly — whether the price is per pack or per kilogram is decided from this.
- "priceLabel": the literal badge text if present ("Cenový trhák", "Nová nižšia cena",
  "s Lidl Plus", "UŠETRITE", "4+2 ZADARMO"), otherwise an empty string.
- "isLidlPlus": true if this price requires the Lidl Plus card or a coupon.

Also read the page-level validity banner if the page has one (e.g. "od štvrtka 20. 8. do 23. 8."):
- "validFrom" / "validTo": as DD.MM. Empty strings if the page shows no date banner.

Include non-food products too, marked isFood:false — they are filtered later.`;

/** Downloads a page image. The URL is HMAC-signed, so it is used exactly as given. */
const downloadImage = async (url: string): Promise<{ data: Buffer; mimeType: string }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Page image download failed with status ${response.status}`);
  }
  return {
    data: Buffer.from(await response.arrayBuffer()),
    mimeType: response.headers.get('content-type') ?? 'image/jpeg',
  };
};

/** Extracts one page, retrying once before giving up on it. */
const parseOnePage = async (pageNumber: number, zoomUrl: string): Promise<PageResult | null> => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const image = await downloadImage(zoomUrl);
      const raw = await generateJson(EXTRACTION_PROMPT, geminiPageSchema, image);
      return { page: pageNumber, ...pageResultSchema.parse(raw) };
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        // One lost page must not cost the whole catalog — the run continues without it.
        console.warn(`   ⚠️  Page ${pageNumber} failed after ${MAX_ATTEMPTS} attempts:`, error);
        return null;
      }
    }
  }
  return null;
};

/**
 * Runs vision extraction over the selected pages and dumps the raw result.
 *
 * The dump exists so Step 3 can be re-run and tuned — the messy part of the
 * pipeline — without paying for the vision pass again.
 */
export const parsePages = async (flyer: Flyer, selected: number[]): Promise<PageResult[]> => {
  const pages = flyer.pages.filter((page) => selected.includes(page.number));
  console.log(`🖼️  Extracting products from ${pages.length} pages (${CONCURRENCY} at a time)...`);

  const results = await mapWithLimit(pages, CONCURRENCY, (page) => parseOnePage(page.number, page.zoom));
  const parsed = results.filter((result): result is PageResult => result !== null);

  const productCount = parsed.reduce((sum, page) => sum + page.products.length, 0);
  const failed = pages.length - parsed.length;
  console.log(`   ✅ Parsed ${parsed.length}/${pages.length} pages, ${productCount} raw offers${failed > 0 ? ` (${failed} failed)` : ''}`);

  fs.mkdirSync(DUMP_DIR, { recursive: true });
  const file = path.join(DUMP_DIR, `${flyer.identifier}.json`);
  fs.writeFileSync(file, JSON.stringify(parsed, null, 2));
  console.log(`   Dump: ${path.relative(process.cwd(), file)}`);

  return parsed;
};

/** Reads a previous dump, so Step 3 can be iterated on without re-running vision. */
export const readPageDump = (identifier: string): PageResult[] | null => {
  const file = path.join(DUMP_DIR, `${identifier}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as PageResult[];
};
