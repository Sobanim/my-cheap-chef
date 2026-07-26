import styles from "../DishScene.module.scss";
import { PotFrame } from "../parts/PotFrame";

/*
 * Soup simmering in the pot — golden broth with a couple of bits bobbing in it.
 *
 * Drawn in a pot, not the serving bowl this scene used to be. The `pot` column
 * shows what a dish is COOKED in, and a bowl is what it's served in — the same
 * category of mistake this whole two-axis split exists to remove, only in the
 * vessel rather than in the method.
 */
export const SoupPotScene = () => (
  <PotFrame>
    <ellipse cx="12" cy="11.3" rx="6.1" ry="1.4" fill="#ef9f27" />
    <circle className={styles.bob} cx="10.1" cy="11.1" r="0.72" fill="#d85a30" />
    <circle
      className={styles.bobDelayed}
      cx="13.7"
      cy="11.4"
      r="0.62"
      fill="#639922"
    />
  </PotFrame>
);
