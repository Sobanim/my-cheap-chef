import styles from "./RecipeFeed.module.scss";
import { RecipeCard } from "./RecipeCard";
import type { MenuRecipe } from "@/lib/menuLogic";

type RecipeFeedProps = {
  recipes: MenuRecipe[];
};

export const RecipeFeed = ({ recipes }: Readonly<RecipeFeedProps>) => {
  if (recipes.length === 0) {
    return (
      <section className={styles.section} aria-labelledby="menu-heading">
        <div className={styles.headingRow}>
          <h2 id="menu-heading" className={styles.heading}>
            Dnešné menu
          </h2>
        </div>
        <div className={styles.empty}>
          <p>Momentálne nie sú dostupné žiadne akciové recepty. Vráť sa čoskoro!</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="menu-heading">
      <div className={styles.headingRow}>
        <h2 id="menu-heading" className={styles.heading}>
          Dnešné menu
        </h2>
        <span className={styles.count}>
          {recipes.length} {recipes.length === 1 ? "recept" : "recepty"}
        </span>
      </div>

      <div className={styles.feed}>
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
};
