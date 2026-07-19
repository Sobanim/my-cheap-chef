import type { BasketType } from '@/lib/baskets';
import type { Recipe } from '@/lib/types/recipe';

/**
 * Which promo baskets are already live on a given weekday.
 *
 * Mirrors how Lidl releases its discounts (see `getBasketForProduct` in baskets.ts):
 *  - basket A — whole-week deals, live from Monday
 *  - basket B — deals starting Thursday
 *  - basket C — weekend-only deals, live from Saturday
 *
 * Keys are `Date.getDay()` values (0 = Sunday).
 */
const UNLOCKED_BASKETS_BY_DAY: Record<number, BasketType[]> = {
  0: ['A', 'B', 'C'], // nedeľa
  1: ['A'], // pondelok
  2: ['A'], // utorok
  3: ['A'], // streda
  4: ['A', 'B'], // štvrtok
  5: ['A', 'B'], // piatok
  6: ['A', 'B', 'C'], // sobota
};

/** Baskets whose recipes may be shown in full at the given moment. */
export const getUnlockedBaskets = (now: Date): BasketType[] =>
  UNLOCKED_BASKETS_BY_DAY[now.getDay()] ?? ['A'];

type UnlockCopy = {
  /** Short badge text, e.g. "Od štvrtka" */
  badge: string;
  /** Full sentence shown on a locked teaser card */
  sentence: string;
};

const BASKET_UNLOCK_COPY: Record<BasketType, UnlockCopy> = {
  A: {
    badge: 'Od pondelka',
    sentence: 'Odomkneme v pondelok s novým letákom.',
  },
  B: {
    badge: 'Od štvrtka',
    sentence: 'Odomkneme vo štvrtok s novými akciami.',
  },
  C: {
    badge: 'Od soboty',
    sentence: 'Odomkneme v sobotu s víkendovými akciami.',
  },
};

export const getBasketUnlockCopy = (basket: BasketType): UnlockCopy =>
  BASKET_UNLOCK_COPY[basket];

export type SplitRecipes = {
  /** Recipes whose basket is already live — shown in full. */
  unlocked: Recipe[];
  /** Recipes from a future basket — shown as blurred teasers. */
  locked: Recipe[];
};

/**
 * Splits generated recipes into what the visitor may see today and what is
 * still to come, based on the Lidl discount calendar.
 */
export const splitRecipesByAvailability = (
  recipes: Recipe[],
  now: Date,
): SplitRecipes => {
  const unlockedBaskets = getUnlockedBaskets(now);
  const unlocked: Recipe[] = [];
  const locked: Recipe[] = [];

  for (const recipe of recipes) {
    if (unlockedBaskets.includes(recipe.basket)) {
      unlocked.push(recipe);
    } else {
      locked.push(recipe);
    }
  }

  return { unlocked, locked };
};
