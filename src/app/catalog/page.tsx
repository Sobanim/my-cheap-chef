import { CatalogExplorer } from '@/components';
import { loadCatalogData } from '@/lib/catalogData';
import styles from '../discounts/page.module.scss';

/**
 * Raw view of `data/catalog.json` — the pool the recipe generator chose from
 * that week. Not in the nav yet, but recipe ingredients link here as
 * `/catalog#product-<id>` so shoppers can see pack size, validity and Lidl Plus.
 * The desktop table still shows every parsed field; phones get a compact list.
 */
export default async function CatalogPage() {
  const { products, flyerIdentifier, offerStartDate, offerEndDate, generatedAt } = await loadCatalogData();

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Katalóg produktov</h1>
        <p className={styles.pageDescription}>
          {products.length > 0 ? (
            <>
              {products.length} produktov z letáku {flyerIdentifier || '—'} ({offerStartDate} – {offerEndDate}).
              {generatedAt && ` Spracované ${new Date(generatedAt).toLocaleString('sk-SK')}.`}
            </>
          ) : (
            'Zatiaľ nebol spracovaný žiadny leták — súbor data/catalog.json neexistuje alebo je prázdny.'
          )}
        </p>
      </header>
      <CatalogExplorer products={products} />
    </>
  );
}
