import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components";
import { loadRecipeData } from "@/lib/recipeData";
import { getUnlockedBaskets } from "@/lib/recipeAvailability";

// A recipe becomes reachable only once its promo basket starts — see page.tsx.
export const revalidate = 3600;

export default async function RecipePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const { recipes } = await loadRecipeData();
  const recipe = recipes.find((r) => r.id === id);

  // Guessing a locked recipe's URL must not reveal it ahead of its discounts.
  if (!recipe || !getUnlockedBaskets(new Date()).includes(recipe.basket)) {
    notFound();
  }

  return <RecipeDetail recipe={recipe} />;
}
