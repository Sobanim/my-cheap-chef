import styles from "./RecipeFeed.module.scss";
import { RecipeCard } from "./RecipeCard";
import { pluralizeRecipes } from "@/lib/recipeLabels";
import type { Recipe } from "@/lib/types/recipe";

type RecipeFeedProps = {
  recipes: Recipe[];
  /** Section heading — differs between the home page and /recipes. */
  heading?: string;
  /** Shown instead of the feed when there is nothing to cook today. */
  emptyText?: string;
};

export const RecipeFeed = ({
  recipes,
  heading = "Dnešné menu",
  emptyText = "Momentálne nie sú dostupné žiadne akciové recepty. Vráť sa čoskoro!",
}: Readonly<RecipeFeedProps>) => {
  const headingId = "menu-heading";

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.headingRow}>
        <h2 id={headingId} className={styles.heading}>
          {heading}
        </h2>
        {recipes.length > 0 && (
          <span className={styles.count}>
            {recipes.length} {pluralizeRecipes(recipes.length)}
          </span>
        )}
      </div>

      {recipes.length === 0 ? (
        <div className={styles.empty}>
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className={styles.feed}>
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </section>
  );
};
