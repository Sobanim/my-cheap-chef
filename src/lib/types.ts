/**
 * Common data types for the "Cook from Discounts" (Varím zo zliav) application
 * Re-export from src/lib/types/ for backward compatibility.
 */
export type { Product } from './types/product';
export type { Recipe, RecipeData } from './types/recipe';

/** Basic pantry items assumed to be available at the user's home */
export const BASE_PANTRY_ITEMS = [
  'soľ',
  'čierny korenie',
  'cukor',
  'rastlinný olej',
  'voda',
] as const;
