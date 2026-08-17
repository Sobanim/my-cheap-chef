'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import styles from './CatalogExplorer.module.scss';

type CatalogExplorerProps = {
  products: Product[];
};

/** Slovak labels for the enum-ish fields, so the table reads without a legend. */
const TIER_LABELS: Record<string, string> = {
  discounted: 'Zľava',
  low_price: 'Nízka cena',
  bundle: 'Balík',
};

const ROLE_LABELS: Record<string, string> = {
  ingredient: 'Surovina',
  snack: 'Snack',
  drink: 'Nápoj',
  ready_meal: 'Hotové jedlo',
  nonfood: 'Nepotravina',
};

const UNIT_LABELS: Record<string, string> = {
  pack: 'balenie',
  per_kg: '€/kg',
  per_100g: '€/100 g',
};

/**
 * Formats an epoch-seconds value as DD.MM.YYYY, in UTC.
 *
 * Product validity windows are stored as UTC midnight of the Slovak calendar
 * day (see `scripts/catalog/normalize-products.ts`) — reading them back with
 * UTC getters is what keeps this correct regardless of the viewer's own
 * timezone, instead of drifting a day depending on where they are.
 */
const formatDate = (epochSeconds: number | null): string => {
  if (!epochSeconds) return '—';
  const date = new Date(epochSeconds * 1000);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getUTCFullYear()}`;
};

type SortColumn =
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

type SortDirection = 'asc' | 'desc';

const SORT_ACCESSORS: Record<SortColumn, (product: Product) => string | number> = {
  name: (p) => p.name?.toLowerCase() ?? '',
  price: (p) => p.price,
  oldPrice: (p) => p.oldPrice ?? -Infinity,
  packInfo: (p) => p.packInfo?.toLowerCase() ?? '',
  priceTier: (p) => p.priceTier ?? '',
  pricingUnit: (p) => p.pricingUnit ?? '',
  foodRole: (p) => p.foodRole ?? '',
  category: (p) => p.category?.toLowerCase() ?? '',
  isLidlPlus: (p) => (p.isLidlPlus ? 1 : 0),
  promoNote: (p) => p.promoNote?.toLowerCase() ?? '',
  validFrom: (p) => p.validFrom ?? -Infinity,
  validUntil: (p) => p.validUntil ?? -Infinity,
  id: (p) => p.id,
};

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

type ValidityPeriod = { validFrom: number | null; validUntil: number | null };

/**
 * Every distinct (validFrom, validUntil) pair present in the data, sorted by
 * start date. Products come from different flyer batches whose date ranges
 * overlap (e.g. a week-long flyer plus a nested weekend-only period inside
 * it) — collecting validFrom/validUntil as separate points and filtering by
 * "valid on this day" would make an inner period's date also match the
 * enclosing outer period. Filtering by the exact period instead shows only
 * the products that actually belong to the one flyer batch the button represents.
 */
const collectAvailablePeriods = (products: Product[]): ValidityPeriod[] => {
  const periods = new Map<string, ValidityPeriod>();
  for (const product of products) {
    const key = `${product.validFrom}|${product.validUntil}`;
    if (!periods.has(key)) {
      periods.set(key, { validFrom: product.validFrom, validUntil: product.validUntil });
    }
  }
  return Array.from(periods.values()).sort((a, b) => (a.validFrom ?? -Infinity) - (b.validFrom ?? -Infinity));
};

export const CatalogExplorer = ({ products }: Readonly<CatalogExplorerProps>) => {
  const availablePeriods = useMemo(() => collectAvailablePeriods(products), [products]);
  const [selectedPeriod, setSelectedPeriod] = useState<ValidityPeriod | null>(null);
  const [sort, setSort] = useState<{ column: SortColumn; direction: SortDirection } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let result = products;
    if (selectedPeriod !== null) {
      result = result.filter(
        (product) =>
          product.validFrom === selectedPeriod.validFrom && product.validUntil === selectedPeriod.validUntil,
      );
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((product) => product.name?.toLowerCase().includes(query));
    }
    return result;
  }, [products, selectedPeriod, searchQuery]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const accessor = SORT_ACCESSORS[sort.column];
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (va < vb) return -1 * factor;
      if (va > vb) return 1 * factor;
      return 0;
    });
  }, [filtered, sort]);

  const toggleSort = (column: SortColumn) => {
    setSort((current) => {
      if (!current || current.column !== column) return { column, direction: 'asc' };
      if (current.direction === 'asc') return { column, direction: 'desc' };
      return null;
    });
  };

  return (
    <div className={styles.explorer}>
      <input
        type="search"
        className={styles.searchInput}
        placeholder="Hľadať produkt podľa názvu…"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        aria-label="Hľadať produkt podľa názvu"
      />
      <div className={styles.filterBar}>
        <button
          type="button"
          className={`${styles.dateButton} ${selectedPeriod === null ? styles.dateButtonActive : ''}`}
          onClick={() => setSelectedPeriod(null)}
        >
          Všetky
        </button>
        {availablePeriods.map((period) => {
          const isActive =
            selectedPeriod !== null &&
            selectedPeriod.validFrom === period.validFrom &&
            selectedPeriod.validUntil === period.validUntil;
          return (
            <button
              key={`${period.validFrom}|${period.validUntil}`}
              type="button"
              className={`${styles.dateButton} ${isActive ? styles.dateButtonActive : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {formatDate(period.validFrom)} – {formatDate(period.validUntil)}
            </button>
          );
        })}
        <span className={styles.resultCount}>
          {filtered.length} z {products.length} produktov
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className={styles.emptyState}>
          {searchQuery.trim()
            ? 'Žiadny produkt nezodpovedá hľadanému výrazu.'
            : 'V zadanom rozsahu dátumov nie sú žiadne produkty.'}
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {COLUMNS.map(({ key, label }) => (
                  <th key={key} className={styles.sortableHeader} onClick={() => toggleSort(key)}>
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
              {sorted.map((product) => (
                <tr key={product.id}>
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
      )}
    </div>
  );
};
