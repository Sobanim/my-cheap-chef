import type { Product } from '@/lib/types';
import { formatDate, getDiscountPercent, PRICE_UNIT_SUFFIX } from './catalogFormat';
import styles from './CatalogExplorer.module.scss';

type CatalogListProps = {
  products: Product[];
  highlightedId: string | null;
};

/**
 * Compact card list — the phone layout. Shows only what a shopper needs at the
 * shelf (price, pack, validity, Lidl Plus); the debug fields stay in the table.
 */
export const CatalogList = ({ products, highlightedId }: Readonly<CatalogListProps>) => (
  <ul className={styles.list}>
    {products.map((product) => {
      const discountPercent = getDiscountPercent(product);
      const unitSuffix = product.pricingUnit ? (PRICE_UNIT_SUFFIX[product.pricingUnit] ?? '') : '';
      const validity = product.dateLabel || `${formatDate(product.validFrom)} – ${formatDate(product.validUntil)}`;

      return (
        <li
          key={product.id}
          data-product-id={product.id}
          className={`${styles.listItem} ${styles.productTarget} ${product.id === highlightedId ? styles.highlighted : ''}`}
        >
          <div className={styles.listHeader}>
            <span className={styles.listName}>{product.name}</span>
            {product.isLidlPlus && <span className={styles.lidlPlusBadge}>Lidl Plus</span>}
          </div>

          <div className={styles.listPrice}>
            {product.price > 0 ? (
              <>
                <span className={styles.priceNow}>
                  {product.price.toFixed(2)} €{unitSuffix}
                </span>
                {discountPercent !== null && (
                  <>
                    <span className={styles.priceWas}>{product.oldPrice!.toFixed(2)} €</span>
                    <span className={styles.discountBadge}>−{discountPercent} %</span>
                  </>
                )}
              </>
            ) : (
              <span className={styles.priceInStore}>Cena v predajni</span>
            )}
          </div>

          <div className={styles.listMeta}>
            {product.packInfo && <span>{product.packInfo}</span>}
            <span>{validity}</span>
            {product.promoNote && <span className={styles.promoBadge}>{product.promoNote}</span>}
          </div>
        </li>
      );
    })}
  </ul>
);
