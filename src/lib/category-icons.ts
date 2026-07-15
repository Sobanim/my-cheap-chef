/**
 * Maps a recipe category to the name of its animated SVG icon.
 *
 * We don't generate dish photos (unpredictable, often ugly). Instead each dish
 * category has one pre-made animated icon. The actual SVG assets are added
 * separately; this map is the single source of truth for which icon to use.
 */

import type { RecipeCategory } from '@/lib/types';

/** Icon used when a category is unknown or an asset is missing. */
export const FALLBACK_CATEGORY_ICON = 'plate';

const CATEGORY_ICONS: Record<RecipeCategory, string> = {
  meat: 'meat',
  pasta: 'pasta',
  soup: 'soup',
  salad: 'salad',
  baked: 'baked',
  dessert: 'dessert',
};

/** Returns the icon name for a recipe category, with a safe fallback. */
export const getCategoryIcon = (category: RecipeCategory): string => {
  return CATEGORY_ICONS[category] ?? FALLBACK_CATEGORY_ICON;
};
