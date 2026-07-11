import type { Product } from "@/lib/types";

export type DishCategory = "soup" | "pan" | "bake" | "salad" | "grill";

export interface MenuIngredient {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string;
  packInfo: string;
}

export interface MenuRecipe {
  id: string;
  title: string;
  category: DishCategory;
  time: string;
  savings: number;
  ingredients: MenuIngredient[];
}

export interface GreetingInfo {
  /** e.g. "Dobré ráno!" */
  greeting: string;
  /** Small emoji accent used in the greeting line */
  emoji: string;
  /** Slovak weekday name, e.g. "pondelok" */
  dayName: string;
  /** Full descriptive body text about current availability */
  body: string;
}

const DAY_NAMES_SK = [
  "nedeľa",
  "pondelok",
  "utorok",
  "streda",
  "štvrtok",
  "piatok",
  "sobota",
];

/**
 * Time-of-day greeting in Slovak.
 */
const getTimeGreeting = (hour: number): { greeting: string; emoji: string } => {
  if (hour < 10) return { greeting: "Dobré ráno!", emoji: "☀️" };
  if (hour < 18) return { greeting: "Dobrý deň!", emoji: "🍽️" };
  return { greeting: "Dobrý večer!", emoji: "🌙" };
};

/**
 * Builds the dynamic greeting message. Lidl discount calendar:
 *  - Mon–Wed (category A): first half-week discounts.
 *  - Thu–Sun (category B/C): second half-week discounts.
 */
export const buildGreeting = (
  now: Date,
  activeCount: number,
): GreetingInfo => {
  const day = now.getDay();
  const { greeting, emoji } = getTimeGreeting(now.getHours());
  const dayName = DAY_NAMES_SK[day];

  const isFirstHalf = day >= 1 && day <= 3; // Mon–Wed
  const recipeCount = Math.max(1, Math.min(2, Math.ceil(activeCount / 3) || 2));

  let body: string;
  if (isFirstHalf) {
    body = `Dnes je ${dayName}. V letáku sú aktuálne zľavy od pondelka do stredy, preto sme pre vás vybrali ${recipeCount} najlepšie recepty. Ďalšie jedlá odomkneme vo štvrtok s novými akciami!`;
  } else {
    body = `Dnes je ${dayName}. Bežia druhopolčasové zľavy (štvrtok–nedeľa), tak sme pre vás pripravili ${recipeCount} recepty z čerstvých akcií. Nové menu odomkneme v pondelok!`;
  }

  return { greeting, emoji, dayName, body };
};

/**
 * Slovak weekday name for a given day index (0 = Sunday).
 */
export const getSlovakDayName = (day: number): string =>
  DAY_NAMES_SK[day] ?? "";

/* === Recipe generation from real discounted products === */

interface RecipeTemplate {
  title: string;
  category: DishCategory;
  time: string;
  /** Keywords used to match real discounted products. */
  match: string[];
}

const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    title: "Cesnaková krémová polievka",
    category: "soup",
    time: "30 min",
    match: ["cesnak", "smotan", "zemiak", "cibuľ", "chlieb", "syr"],
  },
  {
    title: "Kuracie stir-fry so zeleninou",
    category: "pan",
    time: "25 min",
    match: ["kur", "ryž", "paprik", "zelenin", "mrkv", "cibuľ", "olej"],
  },
  {
    title: "Zapekané cestoviny s paradajkami",
    category: "bake",
    time: "40 min",
    match: ["cestovin", "paradaj", "syr", "smotan", "mlet", "šunk"],
  },
  {
    title: "Sviežy záhradný šalát",
    category: "salad",
    time: "15 min",
    match: ["šalát", "paradaj", "uhork", "syr", "olivov", "zelenin"],
  },
  {
    title: "Grilované mäso s prílohou",
    category: "grill",
    time: "35 min",
    match: ["brav", "hovädz", "mäso", "klobás", "zemiak", "grilov"],
  },
];

const toIngredient = (p: Product): MenuIngredient => ({
  id: p.id,
  name: p.name,
  price: p.price,
  oldPrice: p.oldPrice,
  imageUrl: p.imageUrl,
  packInfo: p.packInfo,
});

const productMatchesKeywords = (name: string, keywords: string[]): boolean => {
  const lower = name.toLowerCase();
  return keywords.some((k) => lower.includes(k));
};

const computeSavings = (ingredients: MenuIngredient[]): number =>
  ingredients.reduce((sum, ing) => {
    if (ing.oldPrice && ing.oldPrice > ing.price) {
      return sum + (ing.oldPrice - ing.price);
    }
    return sum;
  }, 0);

/**
 * Builds up to `limit` recipe cards from real discounted products.
 * Each recipe pulls matching products; if a template has too few matches,
 * it is topped up with other available discounted items.
 */
export const buildMenu = (products: Product[], limit = 2): MenuRecipe[] => {
  const usable = products.filter((p) => p.price > 0 && p.imageUrl);
  if (usable.length === 0) return [];

  const recipes: MenuRecipe[] = [];
  const usedIds = new Set<string>();

  for (const template of RECIPE_TEMPLATES) {
    if (recipes.length >= limit) break;

    const matched = usable.filter(
      (p) => !usedIds.has(p.id) && productMatchesKeywords(p.name, template.match),
    );

    const picks = matched.slice(0, 4);

    // Top up with any remaining discounted items so every card has ingredients.
    if (picks.length < 3) {
      const fillers = usable.filter(
        (p) => !usedIds.has(p.id) && !picks.some((m) => m.id === p.id),
      );
      picks.push(...fillers.slice(0, 3 - picks.length));
    }

    if (picks.length === 0) continue;

    picks.forEach((p) => usedIds.add(p.id));
    const ingredients = picks.map(toIngredient);

    recipes.push({
      id: `${template.category}-${recipes.length}`,
      title: template.title,
      category: template.category,
      time: template.time,
      savings: computeSavings(ingredients),
      ingredients,
    });
  }

  return recipes;
};
