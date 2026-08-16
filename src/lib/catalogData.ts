import { promises as fs } from 'fs';
import path from 'path';
import type { Product } from '@/lib/types';

const CATALOG_FILE = path.join(process.cwd(), 'data/catalog.json');

export type CatalogData = {
  flyerIdentifier: string;
  offerStartDate: string;
  offerEndDate: string;
  generatedAt: string;
  products: Product[];
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
