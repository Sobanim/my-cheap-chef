/**
 * The weekly pipeline — the one place that states the whole flow.
 *
 * Read it top to bottom to see what happens; click through a step to see how.
 * No step calls another step: they are wired together here and nowhere else.
 *
 * Run: npm run weekly            (all of it — this is what CI runs)
 *      npm run weekly -- --date=2026-08-17   (pretend it's another day)
 *
 * Individual steps are separately runnable while iterating — see package.json.
 */

import 'dotenv/config';
import type { Product } from '@/lib/types';
import { fetchActiveProducts } from '@/lib/services/lidlService';
import { fetchFlyer } from './catalog/fetch-flyer';
import { selectFoodPages } from './catalog/classify-pages';
import { parsePages } from './catalog/parse-pages';
import { normalizeProducts, saveCatalog } from './catalog/normalize-products';
import { appendPriceHistory } from './catalog/price-history';
import { parseIsoDate } from './catalog/flyer-api';
import { generateWeeklyRecipes, writeRecipeData } from './recipes/generate';

/**
 * Steps 0-4: flyer → product catalog.
 *
 * Returns `null` rather than throwing, because a broken catalog must not cost us
 * the week's recipes — see `collectProducts`.
 */
const buildCatalog = async (targetDate?: Date): Promise<Product[] | null> => {
  try {
    const flyer = await fetchFlyer(targetDate);
    const { selected } = await selectFoodPages(flyer);
    const pages = await parsePages(flyer, selected);
    const products = normalizeProducts(pages, flyer);

    saveCatalog(products, flyer);
    appendPriceHistory(products, flyer.offerStartDate);

    return products;
  } catch (error) {
    console.warn('\n⚠️  Catalog pipeline failed — falling back to the live Lidl API.');
    console.warn('   Cause:', error);
    return null;
  }
};

/**
 * Gets the products to cook from.
 *
 * The flyer catalog is ~15x richer, but the live API is the safety net: a
 * degraded week of recipes beats a site still showing last week's expired
 * discounts. The failure is loud in the Actions log, quiet on the site.
 */
const collectProducts = async (targetDate?: Date): Promise<Product[]> => {
  const catalog = await buildCatalog(targetDate);
  if (catalog && catalog.length > 0) return catalog;

  const live = await fetchActiveProducts();
  console.log(`📦 Fallback: ${live.length} products from the live Lidl API.`);
  return live;
};

const run = async (targetDate?: Date): Promise<void> => {
  console.log('🍳 Weekly pipeline starting...\n');

  const products = await collectProducts(targetDate);
  const recipes = await generateWeeklyRecipes(products);

  writeRecipeData(recipes);
};

/** Reads an optional `--date=YYYY-MM-DD` override from argv. */
const parseDateArg = (): Date | undefined => {
  const arg = process.argv.find((value) => value.startsWith('--date='));
  return arg ? parseIsoDate(arg.slice('--date='.length)) : undefined;
};

run(parseDateArg()).catch((error) => {
  console.error('❌ Weekly pipeline failed:', error);
  process.exit(1);
});
