/**
 * Общие типы данных приложения "Готовь из скидок"
 * Реэкспорт из src/lib/types/ для обратной совместимости.
 */
export type { Product } from './types/product';
export type { Recipe, RecipeData } from './types/recipe';

/** Базовые продукты, которые предполагаются у пользователя дома */
export const BASE_PANTRY_ITEMS = [
  'soľ',
  'čierny korenie',
  'cukor',
  'rastlinný olej',
  'voda',
] as const;
