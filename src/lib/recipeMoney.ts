import type { Recipe } from '@/lib/types/recipe';

/**
 * Minimum discount (%) worth putting a price comparison on screen.
 *
 * Below it the card shows the plain cost and nothing else. A "−3 %" next to a
 * struck-through 4.12 € reads as us stretching a deal that isn't there, and that
 * costs more trust than staying quiet about a weak week.
 */
export const SAVINGS_MIN_PERCENT = 15;

export type RecipeMoney = {
  /** What the sale ingredients cost at the promo price (€). */
  cost: number;
  /** What the same sale ingredients cost outside the promo (€). */
  regularCost: number;
  /** `regularCost − cost` (€). */
  savings: number;
  /** Discount off `regularCost`, whole percent. */
  percent: number;
  /** Whether `regularCost` and `percent` are strong enough to show. */
  showComparison: boolean;
  /** Ingredients to buy outside the promo — `pantry` doesn't count. */
  buyCount: number;
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Derives every money figure the UI shows from fields `data/recipe.json` already
 * carries, so recipes generated before this existed render identically and no
 * regeneration is needed.
 *
 * `regularCost` works out because both stored fields cover exactly the `sale`
 * ingredients: `approxCost` sums their promo prices, `totalSavings` sums the
 * discounts, so together they are what those ingredients cost at full price —
 * and both numbers are Lidl's own (`price` vs `oldPrice`), not our estimate.
 *
 * `buy` items are deliberately left unpriced (see docs/RECIPE_GENERATION.md §6),
 * which is why every figure here is scoped to the sale ingredients and the UI
 * must say so wherever it prints one.
 */
export const getRecipeMoney = (recipe: Recipe): RecipeMoney => {
  const cost = recipe.approxCost;
  const savings = recipe.totalSavings;
  const regularCost = round2(cost + savings);
  const percent = regularCost > 0 ? Math.round((savings / regularCost) * 100) : 0;

  return {
    cost,
    regularCost,
    savings,
    percent,
    showComparison: savings > 0 && percent >= SAVINGS_MIN_PERCENT,
    buyCount: recipe.ingredients.filter((ingredient) => ingredient.source === 'buy').length,
  };
};

/** Names + amounts of the ingredients that fall outside the promo, for the shopping note. */
export const getBuyIngredientLabels = (recipe: Recipe): string[] =>
  recipe.ingredients
    .filter((ingredient) => ingredient.source === 'buy')
    .map((ingredient) => `${ingredient.name.toLowerCase()} (${ingredient.amount})`);
