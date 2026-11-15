import type { MetadataRoute } from "next";
import { loadRecipeData } from "@/lib/recipeData";
import { isRecipeAvailable } from "@/lib/recipeAvailability";
import { absoluteUrl } from "@/lib/site";

// Recipes unlock through the week, so the list of URLs changes with the day.
export const revalidate = 3600;

// Served as /sitemap.xml. Lists only what a visitor can open right now:
// locked and expired recipes return 404 and must not be advertised to crawlers.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { recipes, generatedAt } = await loadRecipeData();
  const lastModified = generatedAt ? new Date(generatedAt) : now;

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/recipes"), lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/catalog"), lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/o-aplikacii"), changeFrequency: "monthly", priority: 0.7 },
  ];

  const recipePages: MetadataRoute.Sitemap = recipes
    .filter((recipe) => isRecipeAvailable(recipe, now))
    .map((recipe) => ({
      url: absoluteUrl(`/recipe/${recipe.id}`),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticPages, ...recipePages];
}
