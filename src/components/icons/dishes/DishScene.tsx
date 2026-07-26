import styles from "./DishScene.module.scss";
import type { CookingMethod, RecipeCategory } from "@/lib/types/recipe";
import { resolveDishKey, type DishKey } from "@/lib/cookingMethods";
import {
  MeatPanScene,
  MeatOvenScene,
  MeatPotScene,
  PastaPanScene,
  PastaOvenScene,
  PastaPotScene,
  SoupPotScene,
  VeggiePanScene,
  VeggieOvenScene,
  VeggiePotScene,
  VeggieRawScene,
  DessertPanScene,
  DessertOvenScene,
  DessertRawScene,
} from "./scenes";

type DishSceneProps = {
  category: RecipeCategory;
  cookingMethod?: CookingMethod;
  className?: string;
};

/*
 * Hand-drawn animated illustration per dish — the deliberate alternative to
 * AI-generated dish photos.
 *
 * A scene is picked by the PAIR (category, cookingMethod), not by category alone:
 * `meat` used to map to a single scene, so oven-roasted meat was drawn in a frying
 * pan. The valid pairs live in @/lib/cookingMethods.
 *
 * Every pair in VALID_DISH_KEYS now has a scene. The map stays Partial because the
 * two lists answer different questions — VALID_DISH_KEYS says which dishes may be
 * generated, this says which are drawn — and a pair may lose its picture without
 * the food itself becoming invalid. Anything missing falls back to the category's
 * default scene, so nothing ever renders blank.
 */
const SCENES: Partial<Record<DishKey, React.ReactNode>> = {
  "meat:pan": <MeatPanScene />,
  "meat:oven": <MeatOvenScene />,
  "meat:pot": <MeatPotScene />,
  "pasta:pan": <PastaPanScene />,
  "pasta:oven": <PastaOvenScene />,
  "pasta:pot": <PastaPotScene />,
  "soup:pot": <SoupPotScene />,
  "veggie:pan": <VeggiePanScene />,
  "veggie:oven": <VeggieOvenScene />,
  "veggie:pot": <VeggiePotScene />,
  "veggie:raw": <VeggieRawScene />,
  "dessert:pan": <DessertPanScene />,
  "dessert:oven": <DessertOvenScene />,
  "dessert:raw": <DessertRawScene />,
};

export const DishScene = ({
  category,
  cookingMethod,
  className,
}: Readonly<DishSceneProps>) => {
  // Calling resolveDishKey without a method yields the category's default pair,
  // which is guaranteed to be drawn — that's the fallback for pairs still missing.
  const scene =
    SCENES[resolveDishKey(category, cookingMethod)] ??
    SCENES[resolveDishKey(category)];

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
        {scene}
      </svg>
    </div>
  );
};
