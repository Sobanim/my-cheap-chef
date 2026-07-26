import Link from "next/link";
import styles from "./RecipeDetail.module.scss";
import { DishScene } from "@/components";
import { BackArrowIcon, ChefHatIcon, ClockIcon } from "../icons";
import {
  getCategoryLabel,
  DIFFICULTY_LABELS,
  SOURCE_LABELS,
  formatServings,
  getShoppingNote,
} from "@/lib/recipeLabels";
import { getBuyIngredientLabels, getRecipeMoney } from "@/lib/recipeMoney";
import type { Recipe } from "@/lib/types/recipe";

type RecipeDetailProps = {
  recipe: Recipe;
};

export const RecipeDetail = ({ recipe }: Readonly<RecipeDetailProps>) => {
  const money = getRecipeMoney(recipe);
  const shoppingNote = getShoppingNote(getBuyIngredientLabels(recipe));

  return (
    <article className={styles.page}>
      <Link href="/recipes" className={styles.back}>
        <BackArrowIcon />
        Späť na recepty
      </Link>

      <header className={styles.hero}>
        <div className={styles.sceneWrap}>
          <DishScene category={recipe.category} cookingMethod={recipe.cookingMethod} />
        </div>

        <div className={styles.heroText}>
          <span className={styles.category}>{getCategoryLabel(recipe.category, recipe.cookingMethod)}</span>
          <h1 className={styles.title}>{recipe.title}</h1>
          <p className={styles.description}>{recipe.description}</p>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <ClockIcon />
              </span>
              <span className={styles.metaValue}>{recipe.estimatedTime}</span>
              <span className={styles.metaLabel}>Čas</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>
                <ChefHatIcon />
              </span>
              <span className={styles.metaValue}>
                {DIFFICULTY_LABELS[recipe.difficulty]}
              </span>
              <span className={styles.metaLabel}>Náročnosť</span>
            </div>
          </div>

          {/* Scoped to the sale ingredients on purpose — `buy` items stay unpriced. */}
          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>Cena akciových surovín</span>
            <span className={styles.priceValues}>
              <span className={styles.priceNow}>{money.cost.toFixed(2)} €</span>
              {money.showComparison && (
                <>
                  <span className={styles.priceWas}>
                    {money.regularCost.toFixed(2)} €
                  </span>
                  <span className={styles.pricePercent}>−{money.percent} %</span>
                </>
              )}
            </span>
            <span className={styles.priceServings}>
              {formatServings(recipe.servings)}
            </span>
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Suroviny</h2>
        <ul className={styles.ingredients}>
          {recipe.ingredients.map((ing, i) => (
            <li key={`${ing.name}-${i}`} className={styles.ingredient}>
              <span className={styles.ingredientName}>{ing.name}</span>
              <span className={styles.ingredientAmount}>{ing.amount}</span>
              <span
                className={`${styles.sourceTag} ${
                  ing.source === "sale" ? styles.sourceSale : ""
                }`}
              >
                {SOURCE_LABELS[ing.source]}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.shoppingNote}>{shoppingNote}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Postup</h2>
        <ol className={styles.steps}>
          {recipe.steps.map((step, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <span className={styles.stepText}>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
};
