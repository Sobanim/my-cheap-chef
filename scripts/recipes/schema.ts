/**
 * Schema for the raw recipe payload returned by Gemini.
 *
 * Two representations, kept side by side on purpose:
 *  - `geminiRecipeResponseSchema` — passed to the model as `responseSchema` so it
 *    is nudged to emit the right shape.
 *  - `modelResponseSchema` (zod) — validates what actually comes back at runtime,
 *    because the model can still ignore the schema on long responses.
 *
 * Note: this is the *model* shape, not the final `Recipe`. Money fields
 * (savings, approxCost) are computed in code from `productId` + `packFraction`.
 */

import { Type, type Schema } from '@google/genai';
import { z } from 'zod';

/**
 * How many recipes the model returns for one promo phase.
 *
 * Raised from 2 to 4 once the flyer catalog replaced the live API: with ~128
 * cookable products per week instead of ~44, there is enough variety to fill
 * more slots without repeating ingredients or scraping the bottom of the pool.
 *
 * Single source of truth — the response schema, the prompt's instructions and
 * the weekly quotas all derive from it.
 */
export const RECIPES_PER_PHASE = 4;

export const RECIPE_CATEGORIES = ['meat', 'pasta', 'soup', 'veggie', 'dessert'] as const;
export const COOKING_METHODS = ['pan', 'oven', 'pot', 'raw'] as const;
export const RECIPE_DIFFICULTIES = ['easy', 'medium'] as const;
export const INGREDIENT_SOURCES = ['sale', 'pantry', 'buy'] as const;

// --- Runtime validation (zod) ---

const modelIngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().min(1),
  source: z.enum(INGREDIENT_SOURCES),
  /** Present for `sale` items — id of the referenced discounted product. */
  productId: z.string().optional(),
  /**
   * Present for `sale` items — how many sold units the dish uses.
   * 0.5 = half a pack, 2 = two whole packs (e.g. two corn cobs sold per piece).
   */
  packFraction: z.number().min(0).max(10).optional(),
});

const modelRecipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(RECIPE_CATEGORIES),
  /** Required here even though it's optional on `Recipe` — new output must carry it. */
  cookingMethod: z.enum(COOKING_METHODS),
  estimatedTime: z.string().min(1),
  activeTime: z.string().min(1),
  difficulty: z.enum(RECIPE_DIFFICULTIES),
  ingredients: z.array(modelIngredientSchema).min(1),
  steps: z.array(z.string().min(1)).min(1),
});

export const modelResponseSchema = z.object({
  recipes: z.array(modelRecipeSchema).length(RECIPES_PER_PHASE),
});

export type ModelRecipe = z.infer<typeof modelRecipeSchema>;
export type ModelResponse = z.infer<typeof modelResponseSchema>;

// --- Gemini structured-output schema (mirrors the zod schema above) ---

export const geminiRecipeResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      minItems: String(RECIPES_PER_PHASE),
      maxItems: String(RECIPES_PER_PHASE),
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING, enum: [...RECIPE_CATEGORIES] },
          cookingMethod: { type: Type.STRING, enum: [...COOKING_METHODS] },
          estimatedTime: { type: Type.STRING },
          activeTime: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: [...RECIPE_DIFFICULTIES] },
          ingredients: {
            type: Type.ARRAY,
            minItems: '1',
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING },
                source: { type: Type.STRING, enum: [...INGREDIENT_SOURCES] },
                productId: { type: Type.STRING },
                packFraction: { type: Type.NUMBER },
              },
              required: ['name', 'amount', 'source'],
              propertyOrdering: ['name', 'amount', 'source', 'productId', 'packFraction'],
            },
          },
          steps: { type: Type.ARRAY, minItems: '1', items: { type: Type.STRING } },
        },
        required: ['title', 'description', 'category', 'cookingMethod', 'estimatedTime', 'activeTime', 'difficulty', 'ingredients', 'steps'],
        propertyOrdering: ['title', 'description', 'category', 'cookingMethod', 'estimatedTime', 'activeTime', 'difficulty', 'ingredients', 'steps'],
      },
    },
  },
  required: ['recipes'],
};
