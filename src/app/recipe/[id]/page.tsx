import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components";
import { loadRecipeData } from "@/lib/recipeData";
import { isRecipeAvailable } from "@/lib/recipeAvailability";
import type { Recipe } from "@/lib/types/recipe";

// A recipe becomes reachable only once its promo basket starts — see page.tsx.
export const revalidate = 3600;

type RecipePageProps = {
  params: Promise<{ id: string }>;
};

/**
 * The recipe behind the URL, or `null` when it must not be shown: unknown id,
 * a basket that has not started yet, or discounts that have already ended.
 * Guessing a locked recipe's URL must not reveal it ahead of its discounts —
 * that goes for the page title as much as for the page itself.
 */
const findAvailableRecipe = async (id: string): Promise<Recipe | null> => {
  const { recipes } = await loadRecipeData();
  const recipe = recipes.find((r) => r.id === id);

  return recipe && isRecipeAvailable(recipe, new Date()) ? recipe : null;
};

export const generateMetadata = async ({ params }: Readonly<RecipePageProps>): Promise<Metadata> => {
  const { id } = await params;
  const recipe = await findAvailableRecipe(id);

  // Fall back to the site-wide title from the root layout.
  if (!recipe) return {};

  return {
    title: `${recipe.title} — My Cheap Chef`,
    description: recipe.description,
  };
};

export default async function RecipePage({ params }: Readonly<RecipePageProps>) {
  const { id } = await params;
  const recipe = await findAvailableRecipe(id);

  if (!recipe) notFound();

  return <RecipeDetail recipe={recipe} />;
}
