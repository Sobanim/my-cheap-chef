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

/** Parses a `<input type="date">` value ("YYYY-MM-DD") into epoch seconds at UTC midnight. */
const parseDateInput = (value: string): number | null => {
  if (!value) return null;
  return Date.parse(value) / 1000;
};

export const CatalogExplorer = ({ products }: Readonly<CatalogExplorerProps>) => {
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');

  const filtered = useMemo(() => {
    const from = parseDateInput(fromInput);
    const to = parseDateInput(toInput);
    if (from === null && to === null) return products;

    return products.filter((product) => {
      // Missing dates mean "always valid" (matches src/lib/dateUtils.ts), so they
      // pass any filter rather than being hidden by one.
      const stillValidAtFrom = from === null || product.validUntil === null || product.validUntil >= from;
      const alreadyValidByTo = to === null || product.validFrom === null || product.validFrom <= to;
      return stillValidAtFrom && alreadyValidByTo;
    });
  }, [products, fromInput, toInput]);

  const hasFilter = fromInput !== '' || toInput !== '';

  return (
    <div className={styles.explorer}>
      <div className={styles.filterBar}>
        <label className={styles.filterField}>
          <span>Platné od</span>
          <input type="date" value={fromInput} onChange={(e) => setFromInput(e.target.value)} />
        </label>
        <label className={styles.filterField}>
          <span>Platné do</span>
          <input type="date" value={toInput} onChange={(e) => setToInput(e.target.value)} />
        </label>
        {hasFilter && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              setFromInput('');
              setToInput('');
            }}
          >
            Vyčistiť filter
          </button>
        )}
        <span className={styles.resultCount}>
          {filtered.length} z {products.length} produktov
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.emptyState}>V zadanom rozsahu dátumov nie sú žiadne produkty.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Názov</th>
                <th>Cena</th>
                <th>Pôvodná cena</th>
                <th>Balenie</th>
                <th>Typ ceny</th>
                <th>Jednotka</th>
                <th>Rola</th>
                <th>Kategória</th>
                <th>Lidl Plus</th>
                <th>Poznámka k akcii</th>
                <th>Platné od</th>
                <th>Platné do</th>
                <th>Obrázok</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
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
                  <td>
                    {product.imageUrl ? (
                      <a href={product.imageUrl} target="_blank" rel="noreferrer">
                        odkaz
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={styles.idCell}>{product.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
