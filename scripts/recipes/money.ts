/**
 * What a recipe costs, and what you actually pay for it.
 *
 * Two different numbers, and conflating them is how "a €4 dinner" turns into a
 * €20 shop: the food a dish consumes is not the same as the packs you carry to
 * the till.
 */

import type { Product } from '@/lib/types';
import type { ModelRecipe } from './schema';

/** Rounds a euro amount to 2 decimal places. */
export const round2 = (value: number): number => Math.round(value * 100) / 100;

export type IngredientMoney = {
  /** Cost of the portion the dish actually uses. */
  dishCost: number;
  /** Cost of what has to be bought to cook it — whole packs, where packs exist. */
  checkoutCost: number;
  /** Money saved against a genuinely printed original price. Never an estimate. */
  savings: number;
};

const ZERO: IngredientMoney = { dishCost: 0, checkoutCost: 0, savings: 0 };

/**
 * Prices one sale ingredient.
 *
 * `checkoutCost` rounds up to whole units only when the product is sold as a
 * pack. Meat and produce printed "cena za 1 kg" are priced by weight — you ask
 * for 500 g and pay for 500 g — so rounding those up to a whole kilo would
 * invent a cost the shopper never pays.
 */
export const priceIngredient = (
  ingredient: ModelRecipe['ingredients'][number],
  productMap: Map<string, Product>,
): IngredientMoney => {
  if (ingredient.source !== 'sale' || !ingredient.productId) return ZERO;

  const product = productMap.get(ingredient.productId);
  if (!product || product.price <= 0) return ZERO;

  const fraction = ingredient.packFraction ?? 1;
  const dishCost = product.price * fraction;

  const soldAsPack = (product.pricingUnit ?? 'pack') === 'pack';
  const checkoutCost = soldAsPack ? product.price * Math.ceil(fraction) : dishCost;

  // `oldPrice` is non-null only for the `discounted` tier — the normalizer drops
  // it for "super price" offers with no reference price and for bundle deals,
  // so an unearned saving cannot leak in here.
  const { oldPrice } = product;
  const hasRealDiscount = oldPrice != null && oldPrice > product.price;
  const savings = hasRealDiscount ? (oldPrice - product.price) * fraction : 0;

  return { dishCost, checkoutCost, savings };
};
