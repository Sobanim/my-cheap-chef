import styles from "./UpcomingTeaser.module.scss";
import { LockedRecipeCard } from "../RecipeFeed/RecipeCard";
import { pluralizeRecipes } from "@/lib/recipeLabels";
import type { Recipe } from "@/lib/types/recipe";

type UpcomingTeaserProps = {
  /** Recipes whose promo basket has not started yet. */
  recipes: Recipe[];
};

export const UpcomingTeaser = ({ recipes }: Readonly<UpcomingTeaserProps>) => {
  // Everything is already unlocked (weekend) — nothing left to tease.
  if (recipes.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="upcoming-heading">
      <div className={styles.headingRow}>
        <h2 id="upcoming-heading" className={styles.heading}>
          Čo navaríme najbližšie?
        </h2>
        <span className={styles.count}>
          {recipes.length} {pluralizeRecipes(recipes.length)}
        </span>
      </div>

      <p className={styles.intro}>
        Tieto jedlá odomkneme, keď Lidl spustí ďalšiu vlnu akcií.
      </p>

      <div className={styles.feed}>
        {recipes.map((recipe) => (
          <LockedRecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
};
