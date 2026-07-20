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

  const startDay = getDayOfWeekInBratislava(validFrom);
  if (startDay === THURSDAY) return 'B';
  if (startDay === SATURDAY || startDay === SUNDAY) return 'C';

  return 'A';
};

// Lidl's promo dates are anchored to Slovak local time. Deriving the weekday with
// Date.getDay() would use the host's timezone instead (e.g. UTC on GitHub Actions),
// which can shift a Thursday/Saturday start into the previous day and misclassify
// the basket. Intl with an explicit timeZone sidesteps the host timezone entirely.
const bratislavaWeekdayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Bratislava',
  weekday: 'short',
});

const WEEKDAY_TO_DAY_NUMBER: Record<string, number> = {
  Sun: SUNDAY,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: THURSDAY,
  Fri: 5,
  Sat: SATURDAY,
};

const getDayOfWeekInBratislava = (epochSeconds: number): number => {
  const weekday = bratislavaWeekdayFormatter.format(new Date(epochSeconds * 1000));
  return WEEKDAY_TO_DAY_NUMBER[weekday];
};
