import { GreetingCard, RecipeFeed, UpcomingTeaser } from "@/components";
import { countActiveOffers, loadCatalogData } from "@/lib/catalogData";
import { buildGreeting } from "@/lib/menuLogic";
import { loadRecipeData } from "@/lib/recipeData";
import { splitRecipesByAvailability } from "@/lib/recipeAvailability";

// Which recipes are unlocked depends on the weekday, so the page must not be
// cached indefinitely.
export const revalidate = 3600;

export default async function Home() {
  const now = new Date();

  const [{ recipes }, catalog] = await Promise.all([loadRecipeData(), loadCatalogData()]);
  const { unlocked, locked } = splitRecipesByAvailability(recipes, now);

  const greeting = buildGreeting(now, unlocked.length, locked.length);

  return (
      <>
        <GreetingCard greeting={greeting} activeCount={countActiveOffers(catalog.products, now)} />

        <RecipeFeed recipes={unlocked} />

        <UpcomingTeaser recipes={locked} />
      </>
  );
}
