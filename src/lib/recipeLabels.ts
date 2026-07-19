import type {
  IngredientSource,
  RecipeCategory,
  RecipeDifficulty,
} from '@/lib/types/recipe';

/** Slovak display names for the canonical dish categories. */
export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  meat: 'Mäso',
  pasta: 'Cestoviny',
  soup: 'Polievka',
  salad: 'Šalát',
  baked: 'Pečené',
  dessert: 'Dezert',
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
