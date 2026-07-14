import Image from "next/image";
import styles from "./RecipeCard.module.scss";
import { DishIcon } from "./DishIcon";
import type { MenuRecipe } from "@/lib/menuLogic";

type RecipeCardProps = {
  recipe: MenuRecipe;
};

const CATEGORY_LABELS: Record<MenuRecipe["category"], string> = {
  soup: "Polievka",
  pan: "Na panvici",
  bake: "Zapekané",
  salad: "Šalát",
  grill: "Grilované",
};

export const RecipeCard = ({ recipe }: Readonly<RecipeCardProps>) => {
  const savingsLabel = recipe.savings > 0 ? recipe.savings.toFixed(2) : "1.00";

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.categoryTag}>
          <DishIcon category={recipe.category} className={styles.categoryIcon} />
          <span>{CATEGORY_LABELS[recipe.category]}</span>
        </div>
        <span className={styles.savingsBadge}>
          Ušetríte {savingsLabel} €
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{recipe.title}</h3>
        <p className={styles.meta}>
          {recipe.ingredients.length} akciových surovín · {recipe.time}
        </p>

        <div className={`${styles.carousel} hideScrollbar`}>
          {recipe.ingredients.map((ing) => {
            const hasDiscount = ing.oldPrice !== null && ing.oldPrice > ing.price;
            return (
              <div key={ing.id} className={styles.ingredient}>
                <div className={styles.thumbWrapper}>
                  {ing.imageUrl ? (
                    <Image
                      src={ing.imageUrl}
                      alt={ing.name}
                      width={120}
                      height={120}
                      className={styles.thumb}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.thumbFallback} aria-hidden="true" />
                  )}
                  <span className={styles.lidlTag}>Lidl · Akcia</span>
                </div>
                <p className={styles.ingredientName} title={ing.name}>
                  {ing.name}
                </p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>{ing.price.toFixed(2)} €</span>
                  {hasDiscount && (
                    <span className={styles.oldPrice}>
                      {ing.oldPrice!.toFixed(2)} €
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
};
