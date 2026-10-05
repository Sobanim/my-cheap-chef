import type { Product } from '@/lib/types';
import { formatDate, ROLE_LABELS, TIER_LABELS, UNIT_LABELS } from './catalogFormat';
import styles from './CatalogExplorer.module.scss';

export type SortColumn =
  | 'name'
  | 'price'
  | 'oldPrice'
  | 'packInfo'
  | 'priceTier'
  | 'pricingUnit'
  | 'foodRole'
  | 'category'
  | 'isLidlPlus'
  | 'promoNote'
  | 'validFrom'
  | 'validUntil'
  | 'id';

export type SortDirection = 'asc' | 'desc';

export type SortState = { column: SortColumn; direction: SortDirection } | null;

const COLUMNS: Array<{ key: SortColumn; label: string }> = [
  { key: 'name', label: 'Názov' },
  { key: 'price', label: 'Cena' },
  { key: 'oldPrice', label: 'Pôvodná cena' },
  { key: 'packInfo', label: 'Balenie' },
  { key: 'priceTier', label: 'Typ ceny' },
  { key: 'pricingUnit', label: 'Jednotka' },
  { key: 'foodRole', label: 'Rola' },
  { key: 'category', label: 'Kategória' },
  { key: 'isLidlPlus', label: 'Lidl Plus' },
  { key: 'promoNote', label: 'Poznámka k akcii' },
  { key: 'validFrom', label: 'Platné od' },
  { key: 'validUntil', label: 'Platné do' },
  { key: 'id', label: 'ID' },
];

type CatalogTableProps = {
  products: Product[];
  sort: SortState;
  onToggleSort: (column: SortColumn) => void;
  highlightedId: string | null;
};

/** Full-detail view of every catalog field — the desktop layout. */
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
          <th>Obrázok</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr
            key={product.id}
            data-product-id={product.id}
            className={`${styles.productTarget} ${product.id === highlightedId ? styles.highlighted : ''}`}
          >
            <td className={styles.nameCell}>{product.name}</td>
            <td>{product.price.toFixed(2)} €</td>
            <td>{product.oldPrice != null ? `${product.oldPrice.toFixed(2)} €` : '—'}</td>
            <td>{product.packInfo || '—'}</td>
            <td>
              {product.priceTier && (
                <span className={`${styles.tierBadge} ${styles[product.priceTier]}`}>
                  {TIER_LABELS[product.priceTier] ?? product.priceTier}
                </span>
              )}
            </td>
            <td>{product.pricingUnit ? (UNIT_LABELS[product.pricingUnit] ?? product.pricingUnit) : '—'}</td>
            <td>{product.foodRole ? (ROLE_LABELS[product.foodRole] ?? product.foodRole) : '—'}</td>
            <td>{product.category || '—'}</td>
            <td>{product.isLidlPlus ? 'Áno' : '—'}</td>
            <td>{product.promoNote || '—'}</td>
            <td>{formatDate(product.validFrom)}</td>
            <td>{formatDate(product.validUntil)}</td>
            <td className={styles.idCell}>{product.id}</td>
            <td>
              {product.imageUrl ? (
                <a href={product.imageUrl} target="_blank" rel="noreferrer">
                  odkaz
                </a>
              ) : (
                '—'
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
