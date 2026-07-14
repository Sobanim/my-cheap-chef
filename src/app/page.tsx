import { Header, GreetingCard, RecipeFeed, UpcomingTeaser, Footer } from "@/components";
import { fetchActiveProducts } from "@/lib/services/lidlService";
import { isProductActive } from "@/lib/dateUtils";
import { buildGreeting, buildMenu } from "@/lib/menuLogic";
import type { Product } from "@/lib/types";
import styles from "./page.module.scss";

export default async function Home() {
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

  // Next discount drop: Mon–Wed → Thursday, otherwise → Monday.
  const day = now.getDay();
  const isFirstHalf = day >= 1 && day <= 3;
  const fromPhrase = isFirstHalf ? "Od štvrtka" : "Od pondelka";

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <GreetingCard greeting={greeting} activeCount={activeProducts.length} />

        <RecipeFeed recipes={recipes} />

        <UpcomingTeaser fromPhrase={fromPhrase} recipeCount={2} />
      </main>
      
      <Footer />
    </div>
  );
}
