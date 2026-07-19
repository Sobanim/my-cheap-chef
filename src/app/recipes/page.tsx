import type { Metadata } from "next";
import { RecipeFeed, UpcomingTeaser } from "@/components";
import { loadRecipeData } from "@/lib/recipeData";
import { splitRecipesByAvailability } from "@/lib/recipeAvailability";
import styles from "./page.module.scss";

// Availability depends on the weekday — see the note in src/app/page.tsx.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Recepty — My Cheap Chef",
  description:
    "Všetky recepty tohto týždňa, ktoré uvaríš z aktuálnych zliav v Lidli.",
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
        emptyText="Momentálne nie sú dostupné žiadne akciové recepty. Vráť sa čoskoro!"
      />

      <UpcomingTeaser recipes={locked} />
    </>
  );
}
