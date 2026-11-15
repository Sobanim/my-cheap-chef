import type { BasketType } from '@/lib/baskets';
import { getBratislavaDateKey, getBratislavaDateKeyFromEpoch, getBratislavaDay } from '@/lib/bratislavaTime';
import type { Recipe } from '@/lib/types/recipe';

/**
 * Which promo baskets are already live on a given weekday.
 *
 * Mirrors how Lidl releases its discounts (see `getBasketForProduct` in baskets.ts):
 *  - basket A — whole-week deals, live from Monday
 *  - basket B — deals starting Thursday
 *  - basket C — weekend-only deals, live from Saturday
 *
 * Keys are `Date.getDay()`-style values (0 = Sunday), read in Slovak time.
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
  UNLOCKED_BASKETS_BY_DAY[getBratislavaDay(now)] ?? ['A'];

/**
 * Whether the discounts a recipe is built on have run out.
 *
 * This is what keeps last week's recipes from being presented as current when
 * the weekly job is late or has failed: their `validUntil` is last Sunday, so
 * they drop out on Monday instead of advertising prices that no longer exist.
 * Recipes generated before `validUntil` existed never expire.
 */
export const isRecipeExpired = (recipe: Recipe, now: Date): boolean => {
  if (!recipe.validUntil) return false;
  return getBratislavaDateKey(now) > getBratislavaDateKeyFromEpoch(recipe.validUntil);
};

/** Whether a recipe may be opened in full right now: its basket is live and its discounts still hold. */
export const isRecipeAvailable = (recipe: Recipe, now: Date): boolean =>
  !isRecipeExpired(recipe, now) && getUnlockedBaskets(now).includes(recipe.basket);

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
 * still to come, based on the Lidl discount calendar. Recipes whose discounts
 * have already ended are left out of both lists.
 */
export const splitRecipesByAvailability = (
  recipes: Recipe[],
  now: Date,
): SplitRecipes => {
  const unlockedBaskets = getUnlockedBaskets(now);
  const unlocked: Recipe[] = [];
  const locked: Recipe[] = [];

  for (const recipe of recipes) {
    if (isRecipeExpired(recipe, now)) continue;

    if (unlockedBaskets.includes(recipe.basket)) {
      unlocked.push(recipe);
    } else {
      locked.push(recipe);
    }
  }

  return { unlocked, locked };
};
