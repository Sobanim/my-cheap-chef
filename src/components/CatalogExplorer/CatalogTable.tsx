import type { Product } from '@/lib/types';
import { formatPrice, formatValidity, getDiscountPercent, ROLE_LABELS, TIER_LABELS } from './catalogFormat';
import styles from './CatalogExplorer.module.scss';

export type SortColumn =
  | 'name'
  | 'price'
  | 'oldPrice'
  | 'discount'
  | 'packInfo'
  | 'priceTier'
  | 'foodRole'
  | 'promoNote'
  | 'validity';

export type SortDirection = 'asc' | 'desc';

export type SortState = { column: SortColumn; direction: SortDirection } | null;

const COLUMNS: Array<{ key: SortColumn; label: string }> = [
  { key: 'name', label: 'Názov' },
  { key: 'price', label: 'Cena' },
  { key: 'oldPrice', label: 'Pôvodná cena' },
  { key: 'discount', label: 'Zľava' },
  { key: 'packInfo', label: 'Balenie' },
  { key: 'priceTier', label: 'Typ ceny' },
  { key: 'foodRole', label: 'Rola' },
  { key: 'promoNote', label: 'Poznámka k akcii' },
  { key: 'validity', label: 'Platnosť' },
];

type CatalogTableProps = {
  products: Product[];
  sort: SortState;
  onToggleSort: (column: SortColumn) => void;
  highlightedId: string | null;
};

/** The desktop layout — one row per product, sortable by every column. */
export const CatalogTable = ({ products, sort, onToggleSort, highlightedId }: Readonly<CatalogTableProps>) => (
  <div className={styles.tableWrapper}>
    <table className={styles.table}>
      <thead>
        <tr>
          {COLUMNS.map(({ key, label }) => (
            <th key={key} className={styles.sortableHeader} onClick={() => onToggleSort(key)}>
              {label}
              <span className={styles.sortIndicator}>
                {sort?.column === key ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const price = formatPrice(product);
          const discountPercent = getDiscountPercent(product);

          return (
            <tr
              key={product.id}
              data-product-id={product.id}
              className={`${styles.productTarget} ${product.id === highlightedId ? styles.highlighted : ''}`}
            >
              <td className={styles.nameCell}>
                {product.name}
                {product.isLidlPlus && <span className={styles.lidlPlusBadge}>Lidl Plus</span>}
              </td>
              <td className={styles.priceCell}>{price ?? <span className={styles.priceInStore}>Cena v predajni</span>}</td>
              <td>{product.oldPrice != null ? `${product.oldPrice.toFixed(2)} €` : '—'}</td>
              <td>
                {discountPercent !== null ? <span className={styles.discountBadge}>−{discountPercent} %</span> : '—'}
              </td>
              <td className={styles.packCell}>{product.packInfo || '—'}</td>
              <td>
                {product.priceTier && (
                  <span className={`${styles.tierBadge} ${styles[product.priceTier]}`}>
                    {TIER_LABELS[product.priceTier] ?? product.priceTier}
                  </span>
                )}
              </td>
              <td>{product.foodRole ? (ROLE_LABELS[product.foodRole] ?? product.foodRole) : '—'}</td>
              <td className={styles.promoCell}>{product.promoNote || '—'}</td>
              <td>{formatValidity(product.validFrom, product.validUntil)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
