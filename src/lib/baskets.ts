/**
 * Promo basket logic.
 *
 * Lidl discounts overlap in time (whole-week, from-Thursday, weekend-only).
 * We split products into three baskets by when their discount starts, so recipes
 * can be generated per phase. See docs/RECIPE_SYSTEM.md for the rationale.
 */

import { getBratislavaDateKeyFromEpoch, getBratislavaDay } from '@/lib/bratislavaTime';

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

// Lidl's promo dates are anchored to Slovak local time, so the weekday is derived
// in Europe/Bratislava rather than the host's timezone (UTC on GitHub Actions),
// which could shift a Thursday/Saturday start into the previous day and
// misclassify the basket.
const getDayOfWeekInBratislava = (epochSeconds: number): number => getBratislavaDay(new Date(epochSeconds * 1000));

/**
 * Whether a discount lasts through the Sunday of the week it starts in.
 *
 * A recipe stays on the site from the day its basket unlocks until the end of
 * the week, so every product it is built on has to stay discounted that long.
 * The flyer also carries one-day specials (e.g. a Monday-only price): they start
 * on a basket day like any other offer, but a recipe built on one would
 * advertise a saving that ended days ago. Products failing this check must not
 * reach the recipe generator.
 *
 * Missing dates pass — same "assume a whole-week deal" fallback as the baskets.
 */
export const coversRestOfWeek = (validFrom: number | null, validUntil: number | null): boolean => {
  if (!validFrom || !validUntil) return true;

  const daysUntilSunday = (7 - getDayOfWeekInBratislava(validFrom)) % 7;
  const sundayKey = getBratislavaDateKeyFromEpoch(validFrom + daysUntilSunday * SECONDS_PER_DAY);

  return getBratislavaDateKeyFromEpoch(validUntil) >= sundayKey;
};
