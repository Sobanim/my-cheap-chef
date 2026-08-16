/**
 * Steps 1-3 on their own: an existing flyer snapshot → `data/catalog.json`.
 *
 * Exists so the expensive, fiddly half of the pipeline can be iterated on
 * without re-running the whole week. Pass `--from-dump` to skip the vision pass
 * entirely and re-normalize the pages parsed last time — which is how Step 3
 * gets tuned without paying for ~50 vision calls each attempt.
 *
 * Run: npm run catalog:parse [-- --from-dump]
 */

import 'dotenv/config';
import { readLatestSnapshot } from './fetch-flyer';
import { selectFoodPages } from './classify-pages';
import { parsePages, readPageDump } from './parse-pages';
import { normalizeProducts, saveCatalog } from './normalize-products';
import { appendPriceHistory } from './price-history';

const run = async (): Promise<void> => {
  const flyer = readLatestSnapshot();
  if (!flyer) {
    console.error('❌ No flyer snapshot found. Run `npm run catalog:fetch` first.');
    process.exit(1);
  }

  console.log(`📄 Using snapshot "${flyer.identifier}" (${flyer.pages.length} pages).`);

  const useDump = process.argv.includes('--from-dump');
  const dump = useDump ? readPageDump(flyer.identifier) : null;

  if (useDump && !dump) {
    console.error('❌ --from-dump given but no page dump exists for this flyer. Run without it once.');
    process.exit(1);
  }

  const pages = dump ?? (await parsePages(flyer, (await selectFoodPages(flyer)).selected));
  if (dump) console.log(`♻️  Reusing ${dump.length} parsed pages from the dump.`);

  const products = normalizeProducts(pages, flyer);
  saveCatalog(products, flyer);
  appendPriceHistory(products, flyer.offerStartDate);
};

run().catch((error) => {
  console.error('❌ Catalog parsing failed:', error);
  process.exit(1);
});
