/**
 * generate-recipe.ts
 *
 * Generates the weekly recipes from the current Lidl discounts.
 *
 * Flow:
 * 1. Fetches the live product list via fetchActiveProducts() (same source as the web app).
 * 2. Splits products into promo baskets A/B/C (see docs/RECIPE_SYSTEM.md).
 * 3. For each phase (A / A+B / A+B+C) asks Gemini for 2 recipes (Slovak).
 * 4. Validates the AI response with zod (fail-fast on garbage).
 * 5. Computes savings / cost in code from productId + packFraction.
 * 6. Saves everything to data/recipe.json.
 *
 * Run: npm run recipe:generate  (requires GEMINI_API_KEY in .env)
 *
 * See docs/RECIPE_GENERATION.md for the design decisions behind this script.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fetchActiveProducts } from '@/lib/services/lidlService';
import { getBasketForProduct, type BasketType } from '@/lib/baskets';
import type { Product, Recipe, RecipeData, RecipeIngredient } from '@/lib/types';
import { generateJson } from './lib/gemini-client';
import { buildRecipePrompt } from './lib/recipe-prompt';
import { geminiRecipeResponseSchema, modelResponseSchema, type ModelRecipe } from './lib/recipe-schema';

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'recipe.json');

// We always cook for two portions — matches typical Lidl pack sizes.
const SERVINGS = 2;

// Each phase can only use products from the baskets active at that point in the week.
type Phase = {
  basket: BasketType;
  label: string;
  baskets: BasketType[];
};

const PHASES: Phase[] = [
  { basket: 'A', label: 'Celý týždeň (od pondelka)', baskets: ['A'] },
  { basket: 'B', label: 'Od štvrtka', baskets: ['A', 'B'] },
  { basket: 'C', label: 'Víkendový špeciál (od soboty)', baskets: ['A', 'B', 'C'] },
];

/** Rounds a euro amount to 2 decimal places. */
const round2 = (value: number): number => Math.round(value * 100) / 100;

type IngredientMoney = { cost: number; savings: number };

/** Computes cost and savings contributed by a single sale ingredient. */
const priceIngredient = (ingredient: ModelRecipe['ingredients'][number], productMap: Map<string, Product>): IngredientMoney => {
  if (ingredient.source !== 'sale' || !ingredient.productId) return { cost: 0, savings: 0 };

  const product = productMap.get(ingredient.productId);
  if (!product || product.price <= 0) return { cost: 0, savings: 0 };

  const fraction = ingredient.packFraction ?? 1;
  const cost = product.price * fraction;
  const hasDiscount = product.oldPrice != null && product.oldPrice > product.price;
  const savings = hasDiscount ? (product.oldPrice! - product.price) * fraction : 0;

  return { cost, savings };
};

/** Converts a raw model recipe into a final Recipe, computing money fields in code. */
const buildRecipe = (modelRecipe: ModelRecipe, phase: Phase, index: number, productMap: Map<string, Product>): Recipe => {
  let totalCost = 0;
  let totalSavings = 0;

  const ingredients: RecipeIngredient[] = modelRecipe.ingredients.map((ingredient) => {
    const { cost, savings } = priceIngredient(ingredient, productMap);
    totalCost += cost;
    totalSavings += savings;

    return {
      name: ingredient.name,
      amount: ingredient.amount,
      source: ingredient.source,
      ...(ingredient.source === 'sale' && ingredient.productId ? { productId: ingredient.productId } : {}),
      ...(ingredient.source === 'sale' ? { savings: round2(savings) } : {}),
    };
  });

  return {
    id: `recipe-${phase.basket.toLowerCase()}${index + 1}`,
    basket: phase.basket,
    basketLabel: phase.label,
    title: modelRecipe.title,
    description: modelRecipe.description,
    category: modelRecipe.category,
    servings: SERVINGS,
    estimatedTime: modelRecipe.estimatedTime,
    difficulty: modelRecipe.difficulty,
    ingredients,
    steps: modelRecipe.steps,
    approxCost: round2(totalCost),
    totalSavings: round2(totalSavings),
  };
};

/** Generates the 2 recipes for a single phase. */
const generatePhaseRecipes = async (
  phase: Phase,
  newProducts: Product[],
  carriedProducts: Product[],
  productMap: Map<string, Product>,
  previousDishes: string[],
): Promise<Recipe[]> => {
  console.log(`   Requesting 2 recipes from Gemini...`);
  const prompt = buildRecipePrompt({ phaseLabel: phase.label, newProducts, carriedProducts, previousDishes });
  const raw = await generateJson(prompt, geminiRecipeResponseSchema);

  const parsed = modelResponseSchema.parse(raw);
  console.log(`   ✅ Received & validated ${parsed.recipes.length} recipes.`);

  return parsed.recipes.map((recipe, index) => buildRecipe(recipe, phase, index, productMap));
};

const generateRecipes = async (): Promise<void> => {
  console.log('🍳 Generating weekly recipes from Lidl discounts...');

  const products = await fetchActiveProducts();
  const cookable = products.filter((product) => product.price > 0);
  console.log(`📦 Fetched ${products.length} products (${cookable.length} with a valid price).`);

  const productMap = new Map(cookable.map((product) => [product.id, product]));
  const basketOf = (product: Product): BasketType => getBasketForProduct(product.validFrom, product.validUntil);

  const allRecipes: Recipe[] = [];
  // Concepts already generated, passed to later phases so they don't repeat the same dish.
  const generatedDishes: string[] = [];

  for (const phase of PHASES) {
    const newProducts = cookable.filter((product) => basketOf(product) === phase.basket);
    const carriedProducts = cookable.filter((product) => {
      const basket = basketOf(product);
      return basket !== phase.basket && phase.baskets.includes(basket);
    });
    console.log(`\n🧺 Phase ${phase.basket} (${phase.label}): ${newProducts.length} new + ${carriedProducts.length} carried products.`);

    if (newProducts.length + carriedProducts.length === 0) {
      console.warn(`⚠️  No products for phase ${phase.basket}, skipping.`);
      continue;
    }

    const recipes = await generatePhaseRecipes(phase, newProducts, carriedProducts, productMap, generatedDishes);
    allRecipes.push(...recipes);
    recipes.forEach((recipe) => generatedDishes.push(`${recipe.title} — ${recipe.description}`));
  }

  const output: RecipeData = {
    generatedAt: new Date().toISOString(),
    recipes: allRecipes,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n📂 Wrote ${allRecipes.length} recipes to ${path.relative(process.cwd(), OUTPUT_FILE)}`);
};

generateRecipes().catch((error) => {
  console.error('❌ Recipe generation failed:', error);
  process.exit(1);
});
