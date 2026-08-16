/**
 * Step 5 on its own: an existing product catalog → `data/recipe.json`.
 *
 * The full weekly flow lives in `scripts/weekly.ts`. This entry point exists for
 * iterating on the recipe prompt without re-fetching and re-parsing the flyer
 * every attempt.
 *
 * Run: npm run recipe:generate
 */

import 'dotenv/config';
import { fetchActiveProducts } from '@/lib/services/lidlService';
import { readCatalog } from './catalog/normalize-products';
import { generateWeeklyRecipes, writeRecipeData } from './recipes/generate';

const run = async (): Promise<void> => {
  const catalog = readCatalog();

  // No catalog on disk is a normal state, not an error — it's what a fresh clone
  // looks like, and the live API is the same fallback the weekly run uses.
  const products = catalog?.products ?? (await fetchActiveProducts());
  console.log(
    catalog
      ? `📦 Catalog "${catalog.flyerIdentifier}": ${products.length} products.`
      : `📦 No catalog found — using ${products.length} products from the live Lidl API.`,
  );

  const recipes = await generateWeeklyRecipes(products);
  writeRecipeData(recipes);
};

run().catch((error) => {
  console.error('❌ Recipe generation failed:', error);
  process.exit(1);
});
