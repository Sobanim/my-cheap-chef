import type {
  CookingMethod,
  IngredientSource,
  RecipeCategory,
  RecipeDifficulty,
} from '@/lib/types/recipe';

/** Slovak display names for the canonical dish categories. */
export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  meat: 'Mäso',
  pasta: 'Cestoviny',
  soup: 'Polievka',
  veggie: 'Zelenina',
  dessert: 'Dezert',
};

/** Slovak display names for the cooking methods. Not shown in the UI yet. */
export const METHOD_LABELS: Record<CookingMethod, string> = {
  pan: 'Na panvici',
  oven: 'V rúre',
  pot: 'V hrnci',
  raw: 'Bez varenia',
};

/**
 * Overrides for pairs whose category name alone would read wrong to a cook.
 * Only `veggie:raw` needs one: raw vegetables are a salad, and that used to be
 * its own category, so without this the feed would lose the word "Šalát".
 */
const PAIR_LABELS: Partial<Record<string, string>> = {
  'veggie:raw': 'Šalát',
};

/**
 * Display label for a recipe. Falls back to the category name when the recipe
 * has no method — recipes generated before `cookingMethod` existed.
 */
export const getCategoryLabel = (category: RecipeCategory, method?: CookingMethod): string => {
  const base = CATEGORY_LABELS[category] ?? CATEGORY_LABELS.veggie;
  if (!method) return base;
  return PAIR_LABELS[`${category}:${method}`] ?? base;
};

export const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  easy: 'Ľahké',
  medium: 'Stredné',
};

export const SOURCE_LABELS: Record<IngredientSource, string> = {
  sale: 'Akcia',
  pantry: 'Máte doma',
  buy: 'Dokúpiť',
};

/** Slovak plural for "recept": 1 → recept, 2–4 → recepty, 5+ → receptov. */
export const pluralizeRecipes = (count: number): string => {
  if (count === 1) return 'recept';
  if (count >= 2 && count <= 4) return 'recepty';
  return 'receptov';
};

/** Slovak plural for "akciová surovina" (a discounted ingredient). */
export const pluralizeSaleIngredients = (count: number): string => {
  if (count === 1) return 'akciová surovina';
  if (count >= 2 && count <= 4) return 'akciové suroviny';
  return 'akciových surovín';
};
