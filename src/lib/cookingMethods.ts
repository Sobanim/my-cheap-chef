/**
 * The category × method matrix — single source of truth for which combinations
 * are meaningful, shared by the generator (validation) and the UI (scene lookup).
 *
 * Background: `category` used to be the only axis, so it had to answer two
 * unrelated questions at once — what the dish is, and how it's cooked. That's why
 * oven-roasted meat was drawn in a frying pan: `meat` mapped to exactly one scene.
 * Splitting the axes means a scene is picked by the pair, not by the category.
 *
 * Most of the 24 combinations are nonsense (raw pasta, soup in a frying pan), so
 * the valid ones are enumerated by hand rather than generated.
 */

import type { CookingMethod, RecipeCategory } from '@/lib/types/recipe';

/** A `category:method` key, e.g. `"meat:oven"`. */
export type DishKey = `${RecipeCategory}:${CookingMethod}`;

/**
 * Method to assume when a recipe has none (generated before the field existed)
 * or carries a combination that isn't in `VALID_DISH_KEYS`.
 *
 * Doubles as the render fallback, so every value here MUST have a drawn scene —
 * see SCENES in DishScene.tsx. `pasta` defaults to `pan` rather than `pot` for the
 * same reason the model is told to: pasta is boiled but *finishes* in the pan with
 * its sauce, and the final vessel is what counts.
 */
export const DEFAULT_METHOD_BY_CATEGORY: Record<RecipeCategory, CookingMethod> = {
  meat: 'pan',
  pasta: 'pan',
  soup: 'pot',
  veggie: 'oven',
  dessert: 'raw',
};

/**
 * The 14 combinations we consider real food. Excluded on purpose:
 *  - `meat:raw` — tartare is not what this app is for;
 *  - `pasta:raw` — uncooked pasta isn't a dish;
 *  - `soup` anywhere but a pot;
 *  - `dessert:pot`.
 *
 * `veggie:raw` is what used to be its own `salad` category.
 *
 * This list governs which recipes may be GENERATED. Which pairs have a drawn
 * scene is a separate question — see SCENES in DishScene.tsx. A valid pair with
 * no scene simply falls back; do not delete a pair from here just because its
 * picture isn't ready, or the model stops proposing that kind of food.
 */
export const VALID_DISH_KEYS: readonly DishKey[] = [
  'meat:pan',
  'meat:oven',
  'meat:pot',
  'pasta:pan',
  'pasta:oven',
  'pasta:pot',
  'soup:pot',
  'veggie:pan',
  'veggie:oven',
  'veggie:pot',
  'veggie:raw',
  'dessert:pan',
  'dessert:oven',
  'dessert:raw',
] as const;

const VALID_KEY_SET = new Set<string>(VALID_DISH_KEYS);

export const isValidDishPair = (category: RecipeCategory, method: CookingMethod): boolean =>
  VALID_KEY_SET.has(`${category}:${method}`);

/**
 * `data/recipe.json` is parsed with a blind cast in loadRecipeData, so a recipe
 * written before a category was retired still reaches us. Anything unrecognised
 * becomes `veggie` — the catch-all that absorbed both `baked` and `salad`.
 */
const isKnownCategory = (category: string): category is RecipeCategory =>
  category in DEFAULT_METHOD_BY_CATEGORY;

/**
 * Resolves the pair to render for a recipe: falls back to the category's default
 * method when the recipe has no method or an impossible one, so the UI always has
 * a scene to draw.
 */
export const resolveDishKey = (category: RecipeCategory, method?: CookingMethod): DishKey => {
  const safeCategory = isKnownCategory(category) ? category : 'veggie';
  if (method && isValidDishPair(safeCategory, method)) return `${safeCategory}:${method}`;
  return `${safeCategory}:${DEFAULT_METHOD_BY_CATEGORY[safeCategory]}`;
};
