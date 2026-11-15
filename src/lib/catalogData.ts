import { promises as fs } from 'fs';
import path from 'path';
import { getBratislavaDateKey, getBratislavaDateKeyFromEpoch } from '@/lib/bratislavaTime';
import type { Product } from '@/lib/types';

const CATALOG_FILE = path.join(process.cwd(), 'data/catalog.json');

export type CatalogData = {
  flyerIdentifier: string;
  offerStartDate: string;
  offerEndDate: string;
  generatedAt: string;
  products: Product[];
};

/**
 * How many flyer offers are running on the given day.
 *
 * Compared by Slovak calendar day rather than by timestamp: flyer dates are
 * stored as midnight of the day, so a plain `now <= validUntil` would drop an
 * offer at 00:00 of its last day instead of at the end of it. Offers without
 * dates count as running — same assumption the baskets make.
 */
export const countActiveOffers = (products: Product[], now: Date): number => {
  const todayKey = getBratislavaDateKey(now);

  return products.filter((product) => {
    if (!product.validFrom || !product.validUntil) return true;
    return (
      getBratislavaDateKeyFromEpoch(product.validFrom) <= todayKey &&
      todayKey <= getBratislavaDateKeyFromEpoch(product.validUntil)
    );
  }).length;
};

const EMPTY_DATA: CatalogData = { flyerIdentifier: '', offerStartDate: '', offerEndDate: '', generatedAt: '', products: [] };

/**
 * Reads the normalized flyer catalog from `data/catalog.json`.
 *
 * Server-only (uses `fs`). Returns an empty catalog instead of throwing so a
 * missing file (no flyer parsed yet, or the pipeline fell back to the live API
 * that week) degrades to an empty page rather than a 500 — same policy as
 * `recipeData.ts`.
 */
export const loadCatalogData = async (): Promise<CatalogData> => {
  try {
    const file = await fs.readFile(CATALOG_FILE, 'utf-8');
    return JSON.parse(file) as CatalogData;
  } catch (error) {
    console.error('Failed to read data/catalog.json:', error);
    return EMPTY_DATA;
  }
};
