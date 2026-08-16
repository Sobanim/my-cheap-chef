/**
 * Step 4 — record what each product cost this week.
 *
 * Nothing reads this yet, and it still ships now: about a third of flyer offers
 * carry no reference price, so their savings can only ever come from our own
 * prior observations. History that starts late is history we don't have.
 *
 * Append-only JSONL — one line per product per run. It is committed to git,
 * because a file that only matters when it accumulates is worthless if each CI
 * run starts from an empty one.
 */

import fs from 'fs';
import path from 'path';
import type { Product } from '@/lib/types';
import { normalizeName } from './normalize-name';

const HISTORY_FILE = path.join(__dirname, '..', '..', 'data', 'price-history.jsonl');

type PriceObservation = {
  /** The flyer's first valid day (YYYY-MM-DD) — not the day the script happened to run. */
  date: string;
  /** Diacritic-free lowercase name; the key a future cross-week match would use. */
  normalizedName: string;
  name: string;
  price: number;
  oldPrice: number | null;
  tier: string;
  pricingUnit: string;
  packInfo: string;
};

/**
 * Appends this run's observations.
 *
 * Re-running the same week appends again rather than replacing: the file is a
 * log of what we saw and when, and de-duplicating it belongs to whatever ends up
 * reading it. Which is also the open problem — matching the same product across
 * weeks when the vision model may word its name slightly differently each run.
 * That normalization pass has to exist before this data can be trusted for
 * week-over-week comparisons.
 */
export const appendPriceHistory = (products: Product[], offerStartDate: string): void => {
  const lines = products.map((product) => {
    const observation: PriceObservation = {
      date: offerStartDate,
      normalizedName: normalizeName(product.name),
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      tier: product.priceTier ?? 'unknown',
      pricingUnit: product.pricingUnit ?? 'pack',
      packInfo: product.packInfo,
    };
    return JSON.stringify(observation);
  });

  fs.appendFileSync(HISTORY_FILE, lines.join('\n') + '\n');
  console.log(`📈 Price history: +${lines.length} observations → ${path.relative(process.cwd(), HISTORY_FILE)}`);
};
