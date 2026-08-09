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
import { BASE_PANTRY_ITEMS, type CookingMethod, type Product, type Recipe, type RecipeData, type RecipeIngredient } from '@/lib/types';
import { DEFAULT_METHOD_BY_CATEGORY, isValidDishPair } from '@/lib/cookingMethods';
import { getRecipeMoney, SAVINGS_MIN_PERCENT } from '@/lib/recipeMoney';
import { generateJson } from './lib/gemini-client';
import { buildRecipePrompt } from './lib/recipe-prompt';
import { buildEditorPrompt } from './lib/editor-prompt';
import { geminiRecipeResponseSchema, modelResponseSchema, type ModelRecipe, type ModelResponse } from './lib/recipe-schema';

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

/** How many recipes a single product may headline as a `sale` ingredient across the whole week. */
const MAX_PRODUCT_USES = 2;

/** productId -> number of recipes (across all phases so far) that used it as a `sale` ingredient. */
type ProductUsage = Map<string, number>;

/**
 * Drops products already used the maximum number of times from the carried-over pool
 * (they must not be offered again), and flags products used exactly once so the prompt
 * can mark them "already used" and steer the model toward fresh alternatives.
 */
const partitionCarriedProducts = (
  carriedProducts: Product[],
  usage: ProductUsage,
): { eligible: Product[]; usedOnceIds: Set<string> } => {
  const eligible = carriedProducts.filter((product) => (usage.get(product.id) ?? 0) < MAX_PRODUCT_USES);
  const usedOnceIds = new Set(eligible.filter((product) => (usage.get(product.id) ?? 0) === 1).map((product) => product.id));
  return { eligible, usedOnceIds };
};

// Vague quantities the prompt forbids but the model may still slip in.
// Note: no \b around words with Slovak diacritics — JS word boundaries are ASCII-only,
// so \bštipk would never match (š is not a \w character).
const VAGUE_AMOUNT_PATTERNS = [/trochou/i, /podľa potreby/i, /podľa chuti/i, /štipk/i, /hrs[ťt]/i, /kúsok/i];

/**
 * Flags steps that still contain vague, number-free amounts (e.g. "trochou vody").
 * Logs a warning only — the prompt rule catches most cases, this is a safety net.
 */
const warnAboutVagueSteps = (recipe: Recipe): void => {
  const vagueSteps = recipe.steps.filter((step) => VAGUE_AMOUNT_PATTERNS.some((pattern) => pattern.test(step)));
  if (vagueSteps.length > 0) {
    console.warn(`   ⚠️  "${recipe.title}" has vague amounts in steps: ${vagueSteps.join(' | ')}`);
  }
};

/**
 * Flags the oven-preheat step when it's missing a °C value, or any step with a
 * duration ("minút") without a leading digit — signs of a missing number.
 * Only the preheat step itself is checked for temperature: later steps that merely
 * reference the (already preheated) oven don't need to restate it.
 */
const warnAboutMissingTimings = (recipe: Recipe): void => {
  const flagged = recipe.steps.filter((step) => {
    const mentionsPreheatWithoutTemp = /predhrej/i.test(step) && !/°c/i.test(step);
    const mentionsMinutesWithoutDigit = /minút/i.test(step) && !/\d/.test(step);
    return mentionsPreheatWithoutTemp || mentionsMinutesWithoutDigit;
  });
  if (flagged.length > 0) {
    console.warn(`   ⚠️  "${recipe.title}" has steps missing a temperature/duration number: ${flagged.join(' | ')}`);
  }
};

/**
 * Flags ingredients marked as `pantry` that aren't in BASE_PANTRY_ITEMS —
 * they belong in the shopping list as `buy` (e.g. onion, garlic, pasta).
 */
const warnAboutFakePantryItems = (recipe: Recipe): void => {
  const fake = recipe.ingredients.filter((ingredient) => {
    if (ingredient.source !== 'pantry') return false;
    const name = ingredient.name.toLowerCase();
    return !BASE_PANTRY_ITEMS.some((item) => name.includes(item) || item.includes(name));
  });
  if (fake.length > 0) {
    console.warn(`   ⚠️  "${recipe.title}" marks non-pantry items as pantry (should be "buy"): ${fake.map((i) => i.name).join(', ')}`);
  }
};

/** Flags sale ingredients whose productId doesn't exist in the phase's product pool. */
const warnAboutUnknownProductIds = (recipe: Recipe, productMap: Map<string, Product>): void => {
  const unknown = recipe.ingredients.filter((ingredient) => ingredient.source === 'sale' && ingredient.productId && !productMap.has(ingredient.productId));
  if (unknown.length > 0) {
    console.warn(`   ⚠️  "${recipe.title}" references unknown productId(s): ${unknown.map((i) => i.productId).join(', ')}`);
  }
};

/**
 * Keeps the category × method pair inside the matrix the UI can actually draw.
 * The prompt lists the forbidden pairs, but the model can still ignore it, and a
 * bad pair must not cost us the whole batch — so we log and fall back rather than throw.
 */
const normalizeCookingMethod = (modelRecipe: ModelRecipe): CookingMethod => {
  if (isValidDishPair(modelRecipe.category, modelRecipe.cookingMethod)) {
    return modelRecipe.cookingMethod;
  }
  const fallback = DEFAULT_METHOD_BY_CATEGORY[modelRecipe.category];
  console.warn(
    `   ⚠️  "${modelRecipe.title}" has an impossible pair ${modelRecipe.category}+${modelRecipe.cookingMethod}, falling back to ${fallback}`,
  );
  return fallback;
};

/**
 * Flags a cookingMethod that the steps contradict — e.g. "oven" with no mention of
 * a rúra/pekáč. Catches the case the pair matrix can't: a valid pair that is simply
 * the wrong one for this dish, which is what made the icons wrong in the first place.
 */
const warnAboutMethodMismatch = (recipe: Recipe): void => {
  const steps = recipe.steps.join(' ').toLowerCase();
  const evidence: Record<CookingMethod, RegExp> = {
    pan: /panvic/,
    oven: /rúr|pekáč|plech/,
    pot: /hrnc|hrniec|varíme|uvaríme|dusíme/,
    raw: /.^/, // raw has no positive marker — checked by absence below
  };
  if (recipe.cookingMethod === 'raw') {
    if (/panvic|rúr|pekáč|hrnc|hrniec/.test(steps)) {
      console.warn(`   ⚠️  "${recipe.title}" is marked "raw" but the steps mention cookware`);
    }
    return;
  }
  if (recipe.cookingMethod && !evidence[recipe.cookingMethod].test(steps)) {
    console.warn(`   ⚠️  "${recipe.title}" is marked "${recipe.cookingMethod}" but no step mentions it`);
  }
};

/**
 * Flags recipes that ask the cook to shop beyond the promo. The prompt allows at
 * most one `buy` item; more than that means the dish isn't really built on the
 * discounts, which is the whole premise.
 */
const warnAboutBuyItems = (recipe: Recipe): void => {
  const buys = recipe.ingredients.filter((ingredient) => ingredient.source === 'buy');
  if (buys.length > 1) {
    console.warn(`   ⚠️  "${recipe.title}" needs ${buys.length} extra purchases (max 1): ${buys.map((i) => i.name).join(', ')}`);
  }
};

/**
 * Flags a discount too small for the UI to show a price comparison — the recipe
 * still ships, but a whole batch of these means the week's promos were weak.
 */
const warnAboutWeakSavings = (recipe: Recipe): void => {
  const { percent, showComparison } = getRecipeMoney(recipe);
  if (!showComparison) {
    console.warn(`   ⚠️  "${recipe.title}" saves only ${percent} % (below ${SAVINGS_MIN_PERCENT} %) — the card will hide the price comparison`);
  }
};

/** Runs all cheap sanity checks on a generated recipe and logs any issues found. */
const runSanityChecks = (recipe: Recipe, productMap: Map<string, Product>): void => {
  warnAboutVagueSteps(recipe);
  warnAboutMissingTimings(recipe);
  warnAboutFakePantryItems(recipe);
  warnAboutUnknownProductIds(recipe, productMap);
  warnAboutMethodMismatch(recipe);
  warnAboutBuyItems(recipe);
  warnAboutWeakSavings(recipe);
};

/**
 * Flags a `sale` product reused as a main ingredient in more recipes than the prompt's
 * weekly quota allows. The prompt drops overused products from the pool and marks
 * single-use ones, but this is a whole-week check the model itself can't see.
 */
const warnAboutOverusedProducts = (recipes: Recipe[]): void => {
  const counts = new Map<string, { count: number; name: string }>();
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      if (ingredient.source !== 'sale' || !ingredient.productId) continue;
      const entry = counts.get(ingredient.productId) ?? { count: 0, name: ingredient.name };
      entry.count += 1;
      counts.set(ingredient.productId, entry);
    }
  }
  for (const [productId, { count, name }] of counts) {
    if (count > MAX_PRODUCT_USES) {
      console.warn(`⚠️  Product ${productId} (${name}) used as a sale ingredient in ${count} recipes this week (max ${MAX_PRODUCT_USES}).`);
    }
  }
};

/** Flags a week where more than 4 of the 6 recipes ended up in the "meat" category. */
const MAX_MEAT_RECIPES = 4;
const warnAboutMealBalance = (recipes: Recipe[]): void => {
  const meatCount = recipes.filter((recipe) => recipe.category === 'meat').length;
  if (meatCount > MAX_MEAT_RECIPES) {
    console.warn(`⚠️  ${meatCount}/${recipes.length} recipes this week are "meat" (cap is ${MAX_MEAT_RECIPES}).`);
  }
};

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
    cookingMethod: normalizeCookingMethod(modelRecipe),
    servings: SERVINGS,
    estimatedTime: modelRecipe.estimatedTime,
    activeTime: modelRecipe.activeTime,
    difficulty: modelRecipe.difficulty,
    ingredients,
    steps: modelRecipe.steps,
    approxCost: round2(totalCost),
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

/** Generates the 2 recipes for a single phase. */
const generatePhaseRecipes = async (
  phase: Phase,
  newProducts: Product[],
  carriedProducts: Product[],
  productMap: Map<string, Product>,
  previousDishes: string[],
  usedOnceProductIds: Set<string>,
  mealBalance: { totalSoFar: number; meatSoFar: number },
): Promise<Recipe[]> => {
  console.log(`   Requesting 2 recipes from Gemini...`);
  const prompt = buildRecipePrompt({
    phaseLabel: phase.label,
    newProducts,
    carriedProducts,
    previousDishes,
    usedOnceProductIds,
    mealBalance,
  });
  const raw = await generateJson(prompt, geminiRecipeResponseSchema);

  const draft = modelResponseSchema.parse(raw);
  console.log(`   ✅ Received & validated ${draft.recipes.length} draft recipes.`);

  const reviewed = await runEditorPass(draft);

  return reviewed.recipes.map((recipe, index) => buildRecipe(recipe, phase, index, productMap));
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
