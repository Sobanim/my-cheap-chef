/**
 * Links recipes that share a discounted product.
 *
 * The point is leftovers: a pack opened for one dish is rarely finished by it,
 * and the honest answer to "what do I do with the rest" is another recipe from
 * the same week that uses it.
 *
 * Done here, after generation, rather than by asking the model to plan across
 * recipes. Cross-recipe planning is a poor fit for an LLM and would be one more
 * constraint on an already dense prompt — while the overlap it would be planning
 * already exists, because `MAX_PRODUCT_USES` lets a product headline two
 * recipes. This step only makes that overlap visible, and costs no API call.
 *
 * TODO — this is currently computed and stored, but nothing displays it yet.
 * The idea it is waiting on:
 *
 *   Show "z týchto surovín uvaríš aj…" on the recipe detail page, listing the
 *   recipes in `relatedRecipeIds`. That turns leftovers from a hidden cost into
 *   a next step — and it is the intended answer to the "€4 dinner, €20 basket"
 *   problem, which we are deliberately NOT solving by constraining generation
 *   (an earlier prompt rule capping basket size was removed on purpose: it made
 *   the model pick worse recipes). Instead of forcing each recipe to be cheap to
 *   shop for, we let the basket be shared: the pack you open on Monday gets
 *   finished on Thursday by a recipe we suggest, so its real cost is split
 *   across several dinners rather than charged to one.
 *
 * A later refinement, once `packInfo` is parsed into `{quantity, unit}` (also
 * needed for `checkoutCost`): state the actual remainder — "ostane ~300 g
 * mletého mäsa" — computed as `ceil(Σ packFraction) − Σ packFraction` across the
 * linked recipes. Still no model involvement.
 *
 * Note the linking is left to emerge on its own: no prompt rule pushes the model
 * to share products between recipes. Overlap should happen naturally in later
 * phases, where basket B and C recipes draw on products carried over from A.
 * Whether it happens often enough to be useful is the open question — check a
 * few real weeks before adding any nudge back to the prompt.
 */

import type { Recipe } from '@/lib/types';

/** The `sale` productIds a recipe depends on. */
const saleProductIds = (recipe: Recipe): string[] =>
  recipe.ingredients
    .filter((ingredient) => ingredient.source === 'sale' && ingredient.productId)
    .map((ingredient) => ingredient.productId!);

/**
 * Fills in `relatedRecipeIds` on every recipe, in place of the given list.
 *
 * Returns new recipe objects rather than mutating, so the caller's array stays
 * the single source of what gets written to disk.
 */
export const linkRelatedRecipes = (recipes: Recipe[]): Recipe[] => {
  const idsByRecipe = new Map(recipes.map((recipe) => [recipe.id, new Set(saleProductIds(recipe))]));

  const linked = recipes.map((recipe) => {
    const own = idsByRecipe.get(recipe.id)!;

    const related = recipes
      .filter((other) => other.id !== recipe.id)
      .filter((other) => [...idsByRecipe.get(other.id)!].some((productId) => own.has(productId)))
      .map((other) => other.id);

    return related.length > 0 ? { ...recipe, relatedRecipeIds: related } : recipe;
  });

  const linkedCount = linked.filter((recipe) => recipe.relatedRecipeIds?.length).length;
  console.log(`🔗 Linked ${linkedCount}/${linked.length} recipes by shared products.`);

  return linked;
};
