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

/** Slovak plural for "porcia", in the accusative case that follows "za". */
export const formatServings = (count: number): string => {
  if (count === 1) return 'za 1 porciu';
  if (count >= 2 && count <= 4) return `za ${count} porcie`;
  return `za ${count} porcií`;
};

/**
 * The chip that answers "do I have to shop beyond the discounts?" before the
 * user opens the recipe — the strongest signal we have, so it sits on the card.
 */
export const getBuyChipLabel = (buyCount: number): string =>
  buyCount === 0 ? 'Bez dokupovania' : `+${buyCount} na dokúpenie`;

/**
 * Note under the ingredient list. States the scope of the prices in the one place
 * where the list it refers to is visible; the card carries the chip instead.
 */
export const getShoppingNote = (buyLabels: string[]): string =>
  buyLabels.length === 0
    ? 'Netreba nič dokupovať — okrem špajze je všetko v akcii.'
    : `Ceny platia pre akciové suroviny. Navyše dokúp: ${buyLabels.join(', ')}.`;
