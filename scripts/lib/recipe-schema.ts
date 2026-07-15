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

export const RECIPE_CATEGORIES = ['meat', 'pasta', 'soup', 'salad', 'baked', 'dessert'] as const;
export const RECIPE_DIFFICULTIES = ['easy', 'medium'] as const;
export const INGREDIENT_SOURCES = ['sale', 'pantry', 'buy'] as const;

// --- Runtime validation (zod) ---

const modelIngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().min(1),
  source: z.enum(INGREDIENT_SOURCES),
  /** Present for `sale` items — id of the referenced discounted product. */
  productId: z.string().optional(),
  /** Present for `sale` items — fraction (0..1) of the sold unit used in the dish. */
  packFraction: z.number().min(0).max(1).optional(),
});

const modelRecipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(RECIPE_CATEGORIES),
  estimatedTime: z.string().min(1),
  difficulty: z.enum(RECIPE_DIFFICULTIES),
  ingredients: z.array(modelIngredientSchema).min(1),
  steps: z.array(z.string().min(1)).min(1),
});

export const modelResponseSchema = z.object({
  recipes: z.array(modelRecipeSchema).length(2),
});

export type ModelRecipe = z.infer<typeof modelRecipeSchema>;
export type ModelResponse = z.infer<typeof modelResponseSchema>;

// --- Gemini structured-output schema (mirrors the zod schema above) ---

export const geminiRecipeResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      minItems: '2',
      maxItems: '2',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING, enum: [...RECIPE_CATEGORIES] },
          estimatedTime: { type: Type.STRING },
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
        required: ['title', 'description', 'category', 'estimatedTime', 'difficulty', 'ingredients', 'steps'],
        propertyOrdering: ['title', 'description', 'category', 'estimatedTime', 'difficulty', 'ingredients', 'steps'],
      },
    },
  },
  required: ['recipes'],
};
