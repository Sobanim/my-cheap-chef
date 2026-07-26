/**
 * Common data types for the "Cook from Discounts" (Varím zo zliav) application
 * Re-export from src/lib/types/ for backward compatibility.
 */
export type { Product } from './types/product';
export type {
  Recipe,
  RecipeData,
  RecipeIngredient,
  RecipeCategory,
  CookingMethod,
  RecipeDifficulty,
  IngredientSource,
} from './types/recipe';
export type { LidlSearchResponse, ProductItem } from './types/lidl';

/** Basic pantry items assumed to be available at the user's home */
export const BASE_PANTRY_ITEMS = [
  'soľ',
  'čierne korenie',
  'cukor',
  'rastlinný olej',
  'voda',
  'vajcia',
] as const;

