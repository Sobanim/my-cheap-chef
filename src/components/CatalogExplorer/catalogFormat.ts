import type { Product } from '@/lib/types';

/** Slovak labels for the enum-ish fields, so the table reads without a legend. */
export const TIER_LABELS: Record<string, string> = {
  discounted: 'Zľava',
  low_price: 'Nízka cena',
  bundle: 'Balík',
};

export const ROLE_LABELS: Record<string, string> = {
  ingredient: 'Surovina',
  snack: 'Snack',
  drink: 'Nápoj',
  ready_meal: 'Hotové jedlo',
  nonfood: 'Nepotravina',
};

/** Suffix appended to a price — a pack price needs none. */
export const PRICE_UNIT_SUFFIX: Record<string, string> = {
  per_kg: '/kg',
  per_100g: '/100 g',
};

/**
 * Formats an epoch-seconds value as DD.MM.YYYY, in UTC.
 *
 * Product validity windows are stored as UTC midnight of the Slovak calendar
 * day (see `scripts/catalog/normalize-products.ts`) — reading them back with
 * UTC getters is what keeps this correct regardless of the viewer's own
 * timezone, instead of drifting a day depending on where they are.
 */
export const formatDate = (epochSeconds: number | null): string => {
  if (!epochSeconds) return '—';
  const date = new Date(epochSeconds * 1000);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getUTCFullYear()}`;
};

/** Day and month only (`05.10`) — the year is always the current flyer's, so it is just noise. */
export const formatShortDate = (epochSeconds: number | null): string => {
  if (!epochSeconds) return '—';
  const date = new Date(epochSeconds * 1000);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
};

export const formatValidity = (validFrom: number | null, validUntil: number | null): string =>
  `${formatShortDate(validFrom)} – ${formatShortDate(validUntil)}`;

/** `1.49 €`, `4.59 €/kg` — or null when the flyer prints no price ("Cena v predajni"). */
export const formatPrice = (product: Product): string | null => {
  if (product.price <= 0) return null;
  const unitSuffix = product.pricingUnit ? (PRICE_UNIT_SUFFIX[product.pricingUnit] ?? '') : '';
  return `${product.price.toFixed(2)} €${unitSuffix}`;
};

/** Discount in whole percent, or null when there is no honest original price to compare against. */
export const getDiscountPercent = (product: Product): number | null => {
  if (product.oldPrice === null || product.oldPrice <= product.price || product.price <= 0) return null;
  return Math.round((1 - product.price / product.oldPrice) * 100);
};

/** Hash prefix recipes link with: `/catalog#product-<id>`. */
export const PRODUCT_HASH_PREFIX = '#product-';
