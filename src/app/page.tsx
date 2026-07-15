import { GreetingCard, RecipeFeed, UpcomingTeaser } from "@/components";
import { fetchActiveProducts } from "@/lib/services/lidlService";
import { isProductActive, getDiscountCycle } from "@/lib/dateUtils";
import { buildGreeting, buildMenu } from "@/lib/menuLogic";
import type { Product } from "@/lib/types";

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

  const recipes = buildMenu(activeProducts, 2);
  const greeting = buildGreeting(now, activeProducts.length);

  // Next discount drop phrase (single source of truth in dateUtils).
  const { fromPhrase } = getDiscountCycle(now);

  return (
      <>
        <GreetingCard greeting={greeting} activeCount={activeProducts.length} />

        <RecipeFeed recipes={recipes} />

        <UpcomingTeaser fromPhrase={fromPhrase} recipeCount={2} />
      </>
  );
}
