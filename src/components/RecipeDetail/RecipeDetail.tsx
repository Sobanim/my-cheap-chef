import Link from "next/link";
import styles from "./RecipeDetail.module.scss";
import { DishScene } from "../DishScene/DishScene";
import { ChefHatIcon, ClockIcon, TagIcon } from "../icons/RecipeIcons";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  SOURCE_LABELS,
} from "@/lib/recipeLabels";
import type { Recipe } from "@/lib/types/recipe";

type RecipeDetailProps = {
  recipe: Recipe;
};

export const RecipeDetail = ({ recipe }: Readonly<RecipeDetailProps>) => {
  const savingsLabel =
    recipe.totalSavings > 0 ? `${recipe.totalSavings.toFixed(2)} €` : "—";

  return (
    <article className={styles.page}>
      <Link href="/recipes" className={styles.back}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18">
          <path
            d="M14 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Späť na recepty
      </Link>

      <header className={styles.hero}>
        <div className={styles.sceneWrap}>
          <DishScene category={recipe.category} />
        </div>

        <div className={styles.heroText}>
          <span className={styles.category}>{CATEGORY_LABELS[recipe.category]}</span>
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
            <div className={`${styles.metaItem} ${styles.metaItemAccent}`}>
              <span className={styles.metaIcon}>
                <TagIcon />
              </span>
              <span className={styles.metaValue}>{savingsLabel}</span>
              <span className={styles.metaLabel}>Úspora</span>
            </div>
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
