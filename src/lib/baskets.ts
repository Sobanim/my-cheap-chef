/**
 * Promo basket logic.
 *
 * Lidl discounts overlap in time (whole-week, from-Thursday, weekend-only).
 * We split products into three baskets by when their discount starts, so recipes
 * can be generated per phase. See docs/RECIPE_SYSTEM.md for the rationale.
 */

/** Which promo phase a product belongs to. */
export type BasketType = 'A' | 'B' | 'C';

// Day-of-week values as returned by Date.getDay() (0 = Sunday, 1 = Monday, ...).
const THURSDAY = 4;
const SATURDAY = 6;
const SUNDAY = 0;

// A promo lasting longer than this is treated as a whole-week / monthly deal (basket A).
const LONG_PROMO_DAYS = 6;

const SECONDS_PER_DAY = 24 * 3600;

/**
 * Assigns a product to a promo basket (A/B/C) based on its validity window.
 * Falls back to basket A when dates are missing or don't match a known pattern.
 */
export const getBasketForProduct = (
  validFrom: number | null,
  validUntil: number | null,
): BasketType => {
  if (!validFrom || !validUntil) return 'A';

  const durationDays = (validUntil - validFrom) / SECONDS_PER_DAY;
  if (durationDays > LONG_PROMO_DAYS) return 'A';

  const startDay = new Date(validFrom * 1000).getDay();
  if (startDay === THURSDAY) return 'B';
  if (startDay === SATURDAY || startDay === SUNDAY) return 'C';

  return 'A';
};
