import { formatEuro } from "@/lib/format";
import { loadRecipeData } from "@/lib/recipeData";
import { isRecipeAvailable } from "@/lib/recipeAvailability";
import { formatServings, getCategoryLabel } from "@/lib/recipeLabels";
import { getRecipeMoney } from "@/lib/recipeMoney";
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE, renderOgImage } from "../../_og/renderOgImage";

export const alt = "Recept z akciového letáku Lidl — My Cheap Chef";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

// The preview shown when a recipe link is shared: dish name, price and saving.
export default async function RecipeOpenGraphImage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const { recipes } = await loadRecipeData();
  const recipe = recipes.find((r) => r.id === id);

  // A locked or expired recipe must not leak through its preview image either.
  if (!recipe || !isRecipeAvailable(recipe, new Date())) {
    return renderOgImage({
      eyebrow: "Každý týždeň nové recepty",
      title: "Čo variť z akciového letáku Lidl",
    });
  }

  const money = getRecipeMoney(recipe);

  return renderOgImage({
    eyebrow: getCategoryLabel(recipe.category, recipe.cookingMethod),
    title: recipe.title,
    subtitle: `${formatEuro(money.cost)} ${formatServings(recipe.servings)} · ${recipe.estimatedTime}`,
    badge: money.showComparison ? `−${money.percent} %` : undefined,
  });
}
