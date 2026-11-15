import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd, RecipeDetail } from "@/components";
import { loadRecipeData } from "@/lib/recipeData";
import { isRecipeAvailable } from "@/lib/recipeAvailability";
import { BASE_OPEN_GRAPH } from "@/lib/site";
import { buildBreadcrumbJsonLd, buildRecipeJsonLd } from "@/lib/structuredData";
import type { Recipe } from "@/lib/types/recipe";

// A recipe becomes reachable only once its promo basket starts — see page.tsx.
export const revalidate = 3600;

type RecipePageProps = {
  params: Promise<{ id: string }>;
};

type AvailableRecipe = {
  recipe: Recipe;
  /** When the week's recipes were generated — the recipe's publication date. */
  generatedAt: string;
};

/**
 * The recipe behind the URL, or `null` when it must not be shown: unknown id,
 * a basket that has not started yet, or discounts that have already ended.
 * Guessing a locked recipe's URL must not reveal it ahead of its discounts —
 * that goes for the page title as much as for the page itself.
 */
const findAvailableRecipe = async (id: string): Promise<AvailableRecipe | null> => {
  const { recipes, generatedAt } = await loadRecipeData();
  const recipe = recipes.find((r) => r.id === id);

  return recipe && isRecipeAvailable(recipe, new Date()) ? { recipe, generatedAt } : null;
};

export const generateMetadata = async ({ params }: Readonly<RecipePageProps>): Promise<Metadata> => {
  const { id } = await params;
  const found = await findAvailableRecipe(id);

  // Fall back to the site-wide title from the root layout.
  if (!found) return {};

  const { recipe } = found;
  const path = `/recipe/${recipe.id}`;

  return {
    title: recipe.title,
    description: recipe.description,
    alternates: { canonical: path },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      type: "article",
      url: path,
      // The recipe's own preview (./opengraph-image.tsx) instead of the site-wide one.
      images: [{ url: `${path}/opengraph-image`, width: 1200, height: 630, alt: recipe.title }],
    },
  };
};

export default async function RecipePage({ params }: Readonly<RecipePageProps>) {
  const { id } = await params;
  const found = await findAvailableRecipe(id);

  if (!found) notFound();

  const { recipe, generatedAt } = found;

  return (
    <>
      <JsonLd
        data={[
          buildRecipeJsonLd(recipe, generatedAt),
          buildBreadcrumbJsonLd([
            { name: "Recepty", path: "/recipes" },
            { name: recipe.title, path: `/recipe/${recipe.id}` },
          ]),
        ]}
      />
      <RecipeDetail recipe={recipe} />
    </>
  );
}
