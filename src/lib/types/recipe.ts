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

