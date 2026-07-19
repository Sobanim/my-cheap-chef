import { promises as fs } from 'fs';
import path from 'path';
import type { RecipeData } from '@/lib/types/recipe';

const RECIPE_FILE = path.join(process.cwd(), 'data/recipe.json');

const EMPTY_DATA: RecipeData = { generatedAt: '', recipes: [] };

/**
 * Reads the weekly AI-generated recipes from `data/recipe.json`.
 *
 * Server-only (uses `fs`). Returns an empty set instead of throwing so a
 * missing or malformed file degrades to an empty feed rather than a 500.
 */
export const loadRecipeData = async (): Promise<RecipeData> => {
  try {
    const file = await fs.readFile(RECIPE_FILE, 'utf-8');
    return JSON.parse(file) as RecipeData;
  } catch (error) {
    console.error('Failed to read data/recipe.json:', error);
    return EMPTY_DATA;
  }
};
