/**
 * Cheap sanity checks over generated recipes.
 *
 * All of these warn rather than throw. This runs in cron: one bad recipe must
 * not cost the whole batch, and a warning in the Actions log is what tells us a
 * prompt rule has stopped landing.
 */

import type { CookingMethod, Product, Recipe } from '@/lib/types';
import { BASE_PANTRY_ITEMS } from '@/lib/types';
import { DEFAULT_METHOD_BY_CATEGORY, isValidDishPair } from '@/lib/cookingMethods';
import { getRecipeMoney, SAVINGS_MIN_PERCENT } from '@/lib/recipeMoney';
import type { ModelRecipe } from './schema';

/** How many recipes a single product may headline as a `sale` ingredient across the week. */
export const MAX_PRODUCT_USES = 2;

/**
 * Above this, a "cheap dinner" stops being cheap at the till (2 servings, €).
 *
 * The dish itself can cost €4 while the shopping needed to cook it costs far
 * more, because packs are bought whole. This is the check that catches it.
 */
export const CHECKOUT_COST_WARN = 12;

/** Flags a recipe whose shopping basket is out of proportion to the food it makes. */
export const warnAboutCheckoutCost = (recipe: Recipe): void => {
  const checkout = recipe.checkoutCost ?? recipe.approxCost;
  if (checkout > CHECKOUT_COST_WARN) {
    console.warn(
      `   ⚠️  "${recipe.title}" needs ${checkout.toFixed(2)} € of shopping for a ${recipe.approxCost.toFixed(2)} € dish (cap ${CHECKOUT_COST_WARN} €)`,
    );
  }
};

// Vague quantities the prompt forbids but the model may still slip in.
// Note: no \b around words with Slovak diacritics — JS word boundaries are ASCII-only,
// so \bštipk would never match (š is not a \w character).
const VAGUE_AMOUNT_PATTERNS = [/trochou/i, /podľa potreby/i, /podľa chuti/i, /štipk/i, /hrs[ťt]/i, /kúsok/i];

/**
 * Flags steps that still contain vague, number-free amounts (e.g. "trochou vody").
 * Logs a warning only — the prompt rule catches most cases, this is a safety net.
 */
export const warnAboutVagueSteps = (recipe: Recipe): void => {
  const vagueSteps = recipe.steps.filter((step) => VAGUE_AMOUNT_PATTERNS.some((pattern) => pattern.test(step)));
  if (vagueSteps.length > 0) {
    console.warn(`   ⚠️  "${recipe.title}" has vague amounts in steps: ${vagueSteps.join(' | ')}`);
  }
};

/**
 * Flags the oven-preheat step when it's missing a °C value, or any step with a
 * duration ("minút") without a leading digit — signs of a missing number.
 * Only the preheat step itself is checked for temperature: later steps that merely
 * reference the (already preheated) oven don't need to restate it.
 */
export const warnAboutMissingTimings = (recipe: Recipe): void => {
  const flagged = recipe.steps.filter((step) => {
    const mentionsPreheatWithoutTemp = /predhrej/i.test(step) && !/°c/i.test(step);
    const mentionsMinutesWithoutDigit = /minút/i.test(step) && !/\d/.test(step);
    return mentionsPreheatWithoutTemp || mentionsMinutesWithoutDigit;
  });
  if (flagged.length > 0) {
    console.warn(`   ⚠️  "${recipe.title}" has steps missing a temperature/duration number: ${flagged.join(' | ')}`);
  }
};

/**
 * Flags ingredients marked as `pantry` that aren't in BASE_PANTRY_ITEMS —
 * they belong in the shopping list as `buy` (e.g. onion, garlic, pasta).
 */
export const warnAboutFakePantryItems = (recipe: Recipe): void => {
  const fake = recipe.ingredients.filter((ingredient) => {
    if (ingredient.source !== 'pantry') return false;
    const name = ingredient.name.toLowerCase();
    return !BASE_PANTRY_ITEMS.some((item) => name.includes(item) || item.includes(name));
  });
  if (fake.length > 0) {
    console.warn(`   ⚠️  "${recipe.title}" marks non-pantry items as pantry (should be "buy"): ${fake.map((i) => i.name).join(', ')}`);
  }
};

/** Flags sale ingredients whose productId doesn't exist in the phase's product pool. */
export const warnAboutUnknownProductIds = (recipe: Recipe, productMap: Map<string, Product>): void => {
  const unknown = recipe.ingredients.filter((ingredient) => ingredient.source === 'sale' && ingredient.productId && !productMap.has(ingredient.productId));
  if (unknown.length > 0) {
    console.warn(`   ⚠️  "${recipe.title}" references unknown productId(s): ${unknown.map((i) => i.productId).join(', ')}`);
  }
};

/**
 * Keeps the category × method pair inside the matrix the UI can actually draw.
 * The prompt lists the forbidden pairs, but the model can still ignore it, and a
 * bad pair must not cost us the whole batch — so we log and fall back rather than throw.
 */
export const normalizeCookingMethod = (modelRecipe: ModelRecipe): CookingMethod => {
  if (isValidDishPair(modelRecipe.category, modelRecipe.cookingMethod)) {
    return modelRecipe.cookingMethod;
  }
  const fallback = DEFAULT_METHOD_BY_CATEGORY[modelRecipe.category];
  console.warn(
    `   ⚠️  "${modelRecipe.title}" has an impossible pair ${modelRecipe.category}+${modelRecipe.cookingMethod}, falling back to ${fallback}`,
  );
  return fallback;
};

/**
 * Flags a cookingMethod that the steps contradict — e.g. "oven" with no mention of
 * a rúra/pekáč. Catches the case the pair matrix can't: a valid pair that is simply
 * the wrong one for this dish, which is what made the icons wrong in the first place.
 */
export const warnAboutMethodMismatch = (recipe: Recipe): void => {
  const steps = recipe.steps.join(' ').toLowerCase();
  const evidence: Record<CookingMethod, RegExp> = {
    pan: /panvic/,
    oven: /rúr|pekáč|plech/,
    pot: /hrnc|hrniec|varíme|uvaríme|dusíme/,
    raw: /.^/, // raw has no positive marker — checked by absence below
  };
  if (recipe.cookingMethod === 'raw') {
    if (/panvic|rúr|pekáč|hrnc|hrniec/.test(steps)) {
      console.warn(`   ⚠️  "${recipe.title}" is marked "raw" but the steps mention cookware`);
    }
    return;
  }
  if (recipe.cookingMethod && !evidence[recipe.cookingMethod].test(steps)) {
    console.warn(`   ⚠️  "${recipe.title}" is marked "${recipe.cookingMethod}" but no step mentions it`);
  }
};

/**
 * Flags recipes that ask the cook to shop beyond the promo. The prompt allows at
 * most one `buy` item; more than that means the dish isn't really built on the
 * discounts, which is the whole premise.
 */
export const warnAboutBuyItems = (recipe: Recipe): void => {
  const buys = recipe.ingredients.filter((ingredient) => ingredient.source === 'buy');
  if (buys.length > 1) {
    console.warn(`   ⚠️  "${recipe.title}" needs ${buys.length} extra purchases (max 1): ${buys.map((i) => i.name).join(', ')}`);
  }
};

// Matches a starchy side ingredient by name — mirrors the prompt's own list
// ("KOMPLETNOSŤ JEDLA" in prompt.ts), so this check verifies the same rule it
// asks the model to follow, not a stricter or looser version of it.
const CARB_SIDE_PATTERN = /cestovin|špaget|ryž|zemiak|kuskus|bulgur|šošovic|fazu[ľl]|cícer|chlieb|baget/i;

/**
 * Flags a "meat"/"veggie" recipe with no starchy side — a protein or vegetable
 * on its own reads as an unfinished dinner (the "chicken with oranges, no side"
 * gap: real feedback from Max & Yulia, 2026-07-29). Exempts raw "veggie" dishes,
 * which are salads by the category rules and don't take a side.
 */
export const warnAboutMissingCarb = (recipe: Recipe): void => {
  const needsCarb = recipe.category === 'meat' || (recipe.category === 'veggie' && recipe.cookingMethod !== 'raw');
  if (!needsCarb) return;

  const hasCarb = recipe.ingredients.some((ingredient) => CARB_SIDE_PATTERN.test(ingredient.name));
  if (!hasCarb) {
    console.warn(`   ⚠️  "${recipe.title}" (${recipe.category}) has no carb/starch side — looks like an unfinished dinner`);
  }
};

/**
 * Flags a discount too small for the UI to show a price comparison — the recipe
 * still ships, but a whole batch of these means the week's promos were weak.
 */
export const warnAboutWeakSavings = (recipe: Recipe): void => {
  const { percent, showComparison } = getRecipeMoney(recipe);
  if (!showComparison) {
    console.warn(`   ⚠️  "${recipe.title}" saves only ${percent} % (below ${SAVINGS_MIN_PERCENT} %) — the card will hide the price comparison`);
  }
};

/** Runs all cheap sanity checks on a generated recipe and logs any issues found. */
export const runSanityChecks = (recipe: Recipe, productMap: Map<string, Product>): void => {
  warnAboutVagueSteps(recipe);
  warnAboutMissingTimings(recipe);
  warnAboutFakePantryItems(recipe);
  warnAboutUnknownProductIds(recipe, productMap);
  warnAboutMethodMismatch(recipe);
  warnAboutBuyItems(recipe);
  warnAboutWeakSavings(recipe);
  warnAboutCheckoutCost(recipe);
  warnAboutMissingCarb(recipe);
};

/**
 * Flags a `sale` product reused as a main ingredient in more recipes than the prompt's
 * weekly quota allows. The prompt drops overused products from the pool and marks
 * single-use ones, but this is a whole-week check the model itself can't see.
 */
export const warnAboutOverusedProducts = (recipes: Recipe[]): void => {
  const counts = new Map<string, { count: number; name: string }>();
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      if (ingredient.source !== 'sale' || !ingredient.productId) continue;
      const entry = counts.get(ingredient.productId) ?? { count: 0, name: ingredient.name };
      entry.count += 1;
      counts.set(ingredient.productId, entry);
    }
  }
  for (const [productId, { count, name }] of counts) {
    if (count > MAX_PRODUCT_USES) {
      console.warn(`⚠️  Product ${productId} (${name}) used as a sale ingredient in ${count} recipes this week (max ${MAX_PRODUCT_USES}).`);
    }
  }
};

/**
 * The largest share of a week's recipes that may be "meat".
 *
 * Expressed as a share rather than a count so it survives changing how many
 * recipes a phase produces — it was 4-of-6, it is 8-of-12 now, and neither
 * number is written down anywhere.
 */
const MAX_MEAT_SHARE = 2 / 3;

/** Returns the meat cap for a week of the given size. */
export const maxMeatRecipesFor = (totalRecipes: number): number => Math.floor(totalRecipes * MAX_MEAT_SHARE);

/** Flags a week that came out too meat-heavy. */
export const warnAboutMealBalance = (recipes: Recipe[]): void => {
  const meatCount = recipes.filter((recipe) => recipe.category === 'meat').length;
  const cap = maxMeatRecipesFor(recipes.length);
  if (meatCount > cap) {
    console.warn(`⚠️  ${meatCount}/${recipes.length} recipes this week are "meat" (cap is ${cap}).`);
  }
};

