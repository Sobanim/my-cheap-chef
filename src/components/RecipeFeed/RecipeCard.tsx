import Link from "next/link";
import styles from "./RecipeCard.module.scss";
import { DishScene } from "@/components";
import { ChefHatIcon, ClockIcon, LockIcon, TagIcon } from "../icons";
import { getBasketUnlockCopy } from "@/lib/recipeAvailability";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  pluralizeSaleIngredients,
} from "@/lib/recipeLabels";
import type { Recipe } from "@/lib/types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
};

const countSaleIngredients = (recipe: Recipe): number =>
  recipe.ingredients.filter((ing) => ing.source === "sale").length;

/**
 * A fully available recipe — the whole card links to its detail page.
 */
export const RecipeCard = ({ recipe }: Readonly<RecipeCardProps>) => {
  const saleCount = countSaleIngredients(recipe);

  return (
    <Link href={`/recipe/${recipe.id}`} className={styles.card}>
      <div className={styles.scene}>
        <DishScene category={recipe.category} />
        {recipe.totalSavings > 0 && (
          <span className={styles.savingsBadge}>
            Ušetríte {recipe.totalSavings.toFixed(2)} €
          </span>
        )}
      </div>

      <div className={styles.body}>
        <span className={styles.category}>
          {CATEGORY_LABELS[recipe.category]}
        </span>
        <h3 className={styles.title}>{recipe.title}</h3>
        <p className={styles.description}>{recipe.description}</p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}>
              <ClockIcon />
            </span>
            {recipe.estimatedTime}
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaIcon}>
              <ChefHatIcon />
            </span>
            {DIFFICULTY_LABELS[recipe.difficulty]}
          </span>
          {saleCount > 0 && (
            <span className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <TagIcon />
              </span>
              {saleCount} {pluralizeSaleIngredients(saleCount)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

/**
 * A recipe from a basket that has not started yet. The dish illustration and
 * category stay visible as a hint, but the title and details are withheld
 * until the matching Lidl discounts go live.
 */
export const LockedRecipeCard = ({ recipe }: Readonly<RecipeCardProps>) => {
  const { badge, sentence } = getBasketUnlockCopy(recipe.basket);

  return (
    <article
      className={`${styles.card} ${styles.cardLocked}`}
      aria-label={`Zamknutý recept, ${badge.toLowerCase()}`}
    >
      <div className={styles.scene}>
        <DishScene category={recipe.category} />
        <span className={styles.lockBadge}>
          <span className={styles.lockIcon}>
            <LockIcon />
          </span>
          {badge}
        </span>
      </div>

      <div className={styles.body}>
        <span className={styles.category}>
          {CATEGORY_LABELS[recipe.category]}
        </span>

        {/* Title placeholder — the dish name stays a surprise until unlock. */}
        <div className={styles.hiddenTitle} aria-hidden="true">
          <span className={styles.bar} />
          <span className={styles.barShort} />
        </div>

        <p className={styles.lockedText}>{sentence}</p>
      </div>
    </article>
  );
};
