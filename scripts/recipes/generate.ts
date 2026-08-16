/**
 * Step 5 — turn a product catalog into the week's recipes.
 *
 * Takes products from whoever calls it: normally the parsed flyer catalog
 * (~700 items), or the live Lidl API (~44) when the catalog pipeline failed.
 * Everything below is source-agnostic on purpose.
 */

import fs from 'fs';
import path from 'path';
import { getBasketForProduct, type BasketType } from '@/lib/baskets';
import type { CookingMethod, Product, Recipe, RecipeData, RecipeIngredient } from '@/lib/types';
import { generateJson } from '../lib/gemini';
import { buildRecipePrompt } from './prompt';
import { buildEditorPrompt } from './editor-prompt';
import { geminiRecipeResponseSchema, modelResponseSchema, RECIPES_PER_PHASE, type ModelRecipe, type ModelResponse } from './schema';
import { priceIngredient, round2 } from './money';
import { linkRelatedRecipes } from './related';
import {
  MAX_PRODUCT_USES,
  maxMeatRecipesFor,
  normalizeCookingMethod,
  runSanityChecks,
  warnAboutMealBalance,
  warnAboutOverusedProducts,
} from './checks';

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

/** How many recipes the whole week holds — what the prompt's weekly quotas are stated against. */
const WEEKLY_RECIPE_TOTAL = RECIPES_PER_PHASE * PHASES.length;

/** productId -> number of recipes (across all phases so far) that used it as a `sale` ingredient. */
type ProductUsage = Map<string, number>;

/**
 * Narrows the catalog to things a person cooks with.
 *
 * `foodRole` comes from flyer parsing; live-API products don't have it and are
 * all kept, which is why the check is written as "not a known non-ingredient"
 * rather than "is an ingredient".
 */
const isCookable = (product: Product): boolean => {
  if (product.price <= 0) return false;
  if (!product.foodRole) return true;
  return product.foodRole === 'ingredient';
};

/**
 * Drops products already used the maximum number of times from the carried-over pool
 * (they must not be offered again), and flags products used exactly once so the prompt
 * can mark them "already used" and steer the model toward finishing what it opened.
 */
const partitionCarriedProducts = (
  carriedProducts: Product[],
  usage: ProductUsage,
): { eligible: Product[]; usedOnceIds: Set<string> } => {
  const eligible = carriedProducts.filter((product) => (usage.get(product.id) ?? 0) < MAX_PRODUCT_USES);
  const usedOnceIds = new Set(eligible.filter((product) => (usage.get(product.id) ?? 0) === 1).map((product) => product.id));
  return { eligible, usedOnceIds };
};

/** Converts a raw model recipe into a final Recipe, computing money fields in code. */
const buildRecipe = (modelRecipe: ModelRecipe, phase: Phase, index: number, productMap: Map<string, Product>): Recipe => {
  let totalDishCost = 0;
  let totalCheckoutCost = 0;
  let totalSavings = 0;

  const ingredients: RecipeIngredient[] = modelRecipe.ingredients.map((ingredient) => {
    const { dishCost, checkoutCost, savings } = priceIngredient(ingredient, productMap);
    totalDishCost += dishCost;
    totalCheckoutCost += checkoutCost;
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
    cookingMethod: normalizeCookingMethod(modelRecipe) as CookingMethod,
    servings: SERVINGS,
    estimatedTime: modelRecipe.estimatedTime,
    activeTime: modelRecipe.activeTime,
    difficulty: modelRecipe.difficulty,
    ingredients,
    steps: modelRecipe.steps,
    approxCost: round2(totalDishCost),
    checkoutCost: round2(totalCheckoutCost),
    totalSavings: round2(totalSavings),
  };
};

/**
 * Second AI pass: reviews draft recipes for culinary logic (cooking order,
 * realistic times, name honesty). Falls back to the draft if the pass fails.
 */
const runEditorPass = async (draft: ModelResponse): Promise<ModelResponse> => {
  console.log('   Running culinary editor pass...');
  try {
    const editedRaw = await generateJson(buildEditorPrompt(JSON.stringify(draft, null, 2)), geminiRecipeResponseSchema);
    const edited = modelResponseSchema.parse(editedRaw);
    console.log('   ✅ Editor pass applied.');
    return edited;
  } catch (error) {
    console.warn('   ⚠️  Editor pass failed, keeping the draft version:', error);
    return draft;
  }
};

/** Generates one phase's batch of recipes. */
const generatePhaseRecipes = async (
  phase: Phase,
  newProducts: Product[],
  carriedProducts: Product[],
  productMap: Map<string, Product>,
  previousDishes: string[],
  usedOnceProductIds: Set<string>,
  mealBalance: { totalSoFar: number; meatSoFar: number },
): Promise<Recipe[]> => {
  console.log(`   Requesting ${RECIPES_PER_PHASE} recipes from Gemini...`);
  const prompt = buildRecipePrompt({
    phaseLabel: phase.label,
    newProducts,
    carriedProducts,
    previousDishes,
    usedOnceProductIds,
    mealBalance,
    weeklyTotal: WEEKLY_RECIPE_TOTAL,
    maxMeatRecipes: maxMeatRecipesFor(WEEKLY_RECIPE_TOTAL),
  });
  const raw = await generateJson(prompt, geminiRecipeResponseSchema);

  const draft = modelResponseSchema.parse(raw);
  console.log(`   ✅ Received & validated ${draft.recipes.length} draft recipes.`);

  const reviewed = await runEditorPass(draft);

  return reviewed.recipes.map((recipe, index) => buildRecipe(recipe, phase, index, productMap));
};

/**
 * Generates the whole week: one batch of recipes per promo phase, then cross-links them.
 */
export const generateWeeklyRecipes = async (products: Product[]): Promise<Recipe[]> => {
  const cookable = products.filter(isCookable);
  console.log(`📦 ${products.length} products in, ${cookable.length} usable as ingredients.`);

  const productMap = new Map(cookable.map((product) => [product.id, product]));
  const basketOf = (product: Product): BasketType => getBasketForProduct(product.validFrom, product.validUntil);

  const allRecipes: Recipe[] = [];
  // Concepts already generated, passed to later phases so they don't repeat the same dish.
  const generatedDishes: string[] = [];
  // How many recipes each sale product has headlined so far, to enforce the weekly reuse cap.
  const productUsage: ProductUsage = new Map();

  for (const phase of PHASES) {
    const newProducts = cookable.filter((product) => basketOf(product) === phase.basket);
    const rawCarried = cookable.filter((product) => {
      const basket = basketOf(product);
      return basket !== phase.basket && phase.baskets.includes(basket);
    });
    const { eligible: carriedProducts, usedOnceIds } = partitionCarriedProducts(rawCarried, productUsage);
    console.log(`\n🧺 Phase ${phase.basket} (${phase.label}): ${newProducts.length} new + ${carriedProducts.length} carried products.`);

    if (newProducts.length + carriedProducts.length === 0) {
      console.warn(`⚠️  No products for phase ${phase.basket}, skipping.`);
      continue;
    }

    const mealBalance = { totalSoFar: allRecipes.length, meatSoFar: allRecipes.filter((r) => r.category === 'meat').length };
    const recipes = await generatePhaseRecipes(phase, newProducts, carriedProducts, productMap, generatedDishes, usedOnceIds, mealBalance);
    recipes.forEach((recipe) => runSanityChecks(recipe, productMap));

    allRecipes.push(...recipes);
    recipes.forEach((recipe) => generatedDishes.push(`${recipe.title} — ${recipe.description}`));
    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients) {
        if (ingredient.source === 'sale' && ingredient.productId) {
          productUsage.set(ingredient.productId, (productUsage.get(ingredient.productId) ?? 0) + 1);
        }
      }
    }
  }

  warnAboutOverusedProducts(allRecipes);
  warnAboutMealBalance(allRecipes);

  return linkRelatedRecipes(allRecipes);
};

const OUTPUT_FILE = path.join(__dirname, '..', '..', 'data', 'recipe.json');

/** Writes the week's recipes to `data/recipe.json` — the file the web app reads. */
export const writeRecipeData = (recipes: Recipe[]): void => {
  const output: RecipeData = {
    generatedAt: new Date().toISOString(),
    recipes,
  };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n📂 Wrote ${recipes.length} recipes to ${path.relative(process.cwd(), OUTPUT_FILE)}`);
};
