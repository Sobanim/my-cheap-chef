import Link from "next/link";
import styles from "./RecipeCard.module.scss";
import { DishScene } from "@/components";
import { ChefHatIcon, ClockIcon, LockIcon } from "../icons";
import { getBasketUnlockCopy } from "@/lib/recipeAvailability";
import {
  getCategoryLabel,
  DIFFICULTY_LABELS,
  formatServings,
  getBuyChipLabel,
} from "@/lib/recipeLabels";
import { getRecipeMoney } from "@/lib/recipeMoney";
import type { Recipe } from "@/lib/types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
};

/**
 * A fully available recipe — the whole card links to its detail page.
 */
export const RecipeCard = ({ recipe }: Readonly<RecipeCardProps>) => {
  const money = getRecipeMoney(recipe);

  return (
    <Link href={`/recipe/${recipe.id}`} className={styles.card}>
      <div className={styles.scene}>
        <DishScene category={recipe.category} cookingMethod={recipe.cookingMethod} />
        {/* Percent, not euros: it's the only figure comparable between cards at a glance. */}
        {money.showComparison && (
          <span className={styles.savingsBadge}>−{money.percent} %</span>
        )}
      </div>

      <div className={styles.body}>
        <span className={styles.category}>
          {getCategoryLabel(recipe.category, recipe.cookingMethod)}
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
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>
            <span className={styles.priceNow}>{money.cost.toFixed(2)} €</span>
            {money.showComparison && (
              <span className={styles.priceWas}>{money.regularCost.toFixed(2)} €</span>
            )}
            {/* The total is meaningless without saying who it feeds. */}
            <span className={styles.priceServings}>{formatServings(recipe.servings)}</span>
          </span>
          <span
            className={`${styles.buyChip} ${
              money.buyCount === 0 ? styles.buyChipClear : ""
            }`}
          >
            {getBuyChipLabel(money.buyCount)}
          </span>
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
        <DishScene category={recipe.category} cookingMethod={recipe.cookingMethod} />
        <span className={styles.lockBadge}>
          <span className={styles.lockIcon}>
            <LockIcon />
          </span>
          {badge}
        </span>
      </div>

      <div className={styles.body}>
        <span className={styles.category}>
          {getCategoryLabel(recipe.category, recipe.cookingMethod)}
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
