import type { Metadata } from "next";
import { RecipeFeed, UpcomingTeaser } from "@/components";
import { loadRecipeData } from "@/lib/recipeData";
import { splitRecipesByAvailability } from "@/lib/recipeAvailability";
import { BASE_OPEN_GRAPH } from "@/lib/site";
import styles from "./page.module.scss";

// Availability depends on the weekday — see the note in src/app/page.tsx.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Recepty z akciového letáku Lidl na tento týždeň",
  description:
    "Všetky recepty tohto týždňa, ktoré uvaríte z potravín v akcii v Lidli — lacné jedlá s cenou za 2 porcie, úsporou a presným postupom.",
  alternates: { canonical: "/recipes" },
  openGraph: { ...BASE_OPEN_GRAPH, url: "/recipes" },
};

export default async function RecipesPage() {
  const now = new Date();
  const { recipes } = await loadRecipeData();
  const { unlocked, locked } = splitRecipesByAvailability(recipes, now);

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Recepty</h1>
        <p className={styles.pageDescription}>
          Jedlá tohto týždňa poskladané z aktuálnych akcií. Nové recepty
          odomykáme spolu s každou vlnou zliav.
        </p>
      </header>

      <RecipeFeed
        recipes={unlocked}
        heading="Dostupné teraz"
        emptyText="Momentálne nie sú dostupné žiadne akciové recepty. Vráťte sa čoskoro!"
      />

      <UpcomingTeaser recipes={locked} />
    </>
  );
}
