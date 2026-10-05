import { CatalogExplorer } from '@/components';
import { loadCatalogData } from '@/lib/catalogData';
import styles from '../discounts/page.module.scss';

/** `2026-10-05` → `05.10`, matching the short dates on the filter buttons. */
const formatOfferDate = (isoDate: string): string => {
  const [, month, day] = isoDate.split('-');
  return month && day ? `${day}.${month}` : isoDate;
};

/**
 * Every product from this week's parsed flyer (`data/catalog.json`) — the pool
 * the recipe generator chose from. Recipe ingredients link here as
 * `/catalog#product-<id>` so shoppers can see pack size, validity and Lidl Plus.
 */
export default async function CatalogPage() {
  const { products, offerStartDate, offerEndDate } = await loadCatalogData();

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Akcie z letáku</h1>
        <p className={styles.pageDescription}>
          {products.length > 0
            ? `${products.length} produktov v akcii · platí ${formatOfferDate(offerStartDate)} – ${formatOfferDate(offerEndDate)}`
            : 'Akcie z aktuálneho letáku zatiaľ nie sú k dispozícii.'}
        </p>
      </header>
      <CatalogExplorer products={products} />
    </>
  );
}
