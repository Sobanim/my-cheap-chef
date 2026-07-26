import styles from "../DishScene.module.scss";
import { PanFrame } from "../parts/PanFrame";

/*
 * A pancake in the pan. The weakest scene in the set: a golden disc on a pan
 * reads just as easily as an omelette, so the berry is doing the work of saying
 * "sweet" — without it the picture is ambiguous.
 *
 * Kept because `dessert:pan` is a real thing the generator may produce
 * (caramelised fruit, palacinky). If it stops convincing, delete this file and
 * drop the entry from SCENES — the pair then falls back to DessertRawScene,
 * which is a safe picture. Do NOT remove the pair from VALID_DISH_KEYS: that
 * would stop the model proposing such dishes at all.
 */
export const DessertPanScene = () => (
  <>
    <path
      className={styles.steamA}
      d="M9 4.6c-.8.8-.8 1.6 0 2.4"
      stroke="#ffd600"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamB}
      d="M12.5 4.1c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <PanFrame>
      <ellipse
        cx="10.5"
        cy="14.3"
        rx="4.2"
        ry="2.5"
        fill="#ef9f27"
        stroke="#ba7517"
        strokeWidth="1.1"
      />
      <circle className={styles.bob} cx="10.5" cy="13.4" r="1" fill="#e24b4a" />
    </PanFrame>
  </>
);
