import styles from "./DishScene.module.scss";
import type { RecipeCategory } from "@/lib/types/recipe";
import {
  MeatScene,
  PastaScene,
  SoupScene,
  SaladScene,
  BakedScene,
  DessertScene,
} from "./scenes";

type DishSceneProps = {
  category: RecipeCategory;
  className?: string;
};

/*
 * Hand-drawn animated illustration per dish category — the deliberate
 * alternative to AI-generated dish photos. One scene per canonical
 * RecipeCategory (meat | pasta | soup | salad | baked | dessert).
 *
 * Each scene lives in its own file under ./scenes — add a category by
 * creating a new scene file and registering it below.
 */
const SCENES: Record<RecipeCategory, React.ReactNode> = {
  meat: <MeatScene />,
  pasta: <PastaScene />,
  soup: <SoupScene />,
  salad: <SaladScene />,
  baked: <BakedScene />,
  dessert: <DessertScene />,
};

export const DishScene = ({ category, className }: Readonly<DishSceneProps>) => {
  return (
    <div className={`${styles.scene} ${className ?? ""}`.trim()}>
      <svg
        className={styles.svg}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
      >
        {SCENES[category]}
      </svg>
    </div>
  );
};
