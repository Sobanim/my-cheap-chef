'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import { CatalogList } from './CatalogList';
import { CatalogTable, type SortColumn, type SortState } from './CatalogTable';
import { formatDate, PRODUCT_HASH_PREFIX } from './catalogFormat';
import styles from './CatalogExplorer.module.scss';

type CatalogExplorerProps = {
  products: Product[];
};

/** How long a product reached via `#product-<id>` stays highlighted (matches the CSS fade). */
const HIGHLIGHT_DURATION_MS = 3000;

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
  const [sort, setSort] = useState<SortState>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  /*
   * Recipes link here as `/catalog#product-<id>`. The table and the phone list
   * both render every product (CSS shows one of them), so the target can't be a
   * plain `id` — it would be duplicated. Instead find the visible element with
   * the matching data attribute. Runs after Next's own hash scroll, which finds
   * no element by id and leaves the page alone.
   */
  useEffect(() => {
    const { hash } = window.location;
    if (!hash.startsWith(PRODUCT_HASH_PREFIX)) return;
    const productId = decodeURIComponent(hash.slice(PRODUCT_HASH_PREFIX.length));

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const frameId = requestAnimationFrame(() => {
      const target = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-product-id="${CSS.escape(productId)}"]`),
      ).find((element) => element.getClientRects().length > 0);
      if (!target) return;

      target.scrollIntoView({ block: 'center' });
      setHighlightedId(productId);
      timeoutId = setTimeout(() => setHighlightedId(null), HIGHLIGHT_DURATION_MS);
    });

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, []);

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
        <>
          <CatalogTable products={sorted} sort={sort} onToggleSort={toggleSort} highlightedId={highlightedId} />
          <CatalogList products={sorted} highlightedId={highlightedId} />
        </>
      )}
    </div>
  );
};
