import { GreetingCard, RecipeFeed, UpcomingTeaser } from "@/components";
import { fetchActiveProducts } from "@/lib/services/lidlService";
import { isProductActive } from "@/lib/dateUtils";
import { buildGreeting } from "@/lib/menuLogic";
import { loadRecipeData } from "@/lib/recipeData";
import { splitRecipesByAvailability } from "@/lib/recipeAvailability";
import type { Product } from "@/lib/types";

// Which recipes are unlocked depends on the weekday, so the page must not be
// cached indefinitely. Matches the 1h revalidate of the Lidl product fetch.
export const revalidate = 3600;

export default async function Home() {
  // TODO: opt-out from React Compiler memoization. Revisit why it was needed
  // for this async Server Component and remove this directive if no longer required.
  "use no memo";
  let products: Product[] = [];
  const serverTime = Math.floor(Date.now() / 1000);
  const now = new Date();

  try {
    products = await fetchActiveProducts();
  } catch (error) {
    console.error("Failed to fetch products dynamically:", error);
  }

  const activeProducts = products.filter((p) =>
    isProductActive(p.validFrom, p.validUntil, serverTime),
  );

  const { recipes } = await loadRecipeData();
  const { unlocked, locked } = splitRecipesByAvailability(recipes, now);

  const greeting = buildGreeting(now, unlocked.length, locked.length);

  return (
      <>
        <GreetingCard greeting={greeting} activeCount={activeProducts.length} />

        <RecipeFeed recipes={unlocked} />

        <UpcomingTeaser recipes={locked} />
      </>
  );
}
