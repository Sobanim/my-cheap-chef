import { CatalogExplorer } from '@/components';
import { loadCatalogData } from '@/lib/catalogData';
import styles from '../discounts/page.module.scss';

/**
 * Raw view of `data/catalog.json` — the pool the recipe generator chose from
 * that week. Not linked from the nav; reached by URL only. Exists for
 * inspecting what the flyer pipeline actually parsed, not as a user feature.
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
