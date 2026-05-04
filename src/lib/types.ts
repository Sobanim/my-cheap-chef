/**
 * Общие типы данных приложения "Готовь из скидок"
 * Используются как на клиенте, так и на сервере / в скриптах.
 */

/** Продукт со скидкой */
export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  packInfo: string;
  imageUrl: string;
  category: string;
}

/** Рецепт, сгенерированный AI */
export interface Recipe {
  title: string;
  ingredients: string[];
  ingredientsFromSale: string[];
  steps: string[];
  estimatedTime: string;
  totalSavings?: string;
}

/** Структура файла data/recipe.json */
export interface RecipeData {
  generatedAt: string;
  recipes: Recipe[];
}

/** Базовые продукты, которые предполагаются у пользователя дома */
export const BASE_PANTRY_ITEMS = [
  'soľ',
  'čierny korenie',
  'cukor',
  'rastlinný olej',
  'voda',
] as const;

