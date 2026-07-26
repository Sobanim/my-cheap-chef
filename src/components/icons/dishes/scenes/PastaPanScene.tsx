import styles from "../DishScene.module.scss";
import { PanFrame } from "../parts/PanFrame";

/*
 * Pasta finishing in the pan with its sauce — the common pasta case, not an exotic
 * one: pasta is boiled, drained, then brought together with the sauce in a pan, so
 * under the "final vessel wins" rule most pasta dishes are `pan` rather than `pot`.
 *
 * Drawn in an actual frying pan. It used to be a shallow bowl, which left the pan
 * column showing three pans and one piece of serving crockery.
 */
export const PastaPanScene = () => (
  <>
    <path
      className={styles.steamA}
      d="M8.5 4.6c-.8.8-.8 1.6 0 2.4"
      stroke="#ffd600"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamB}
      d="M12 4.1c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <PanFrame>
      <path
        d="M6.6 14.8c1.3-.9 2.6-.9 3.9 0s2.6.9 3.9 0"
        stroke="#ef9f27"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 12.5c1.2-.8 2.3-.8 3.5 0s2.3.8 3.5 0"
        stroke="#ba7517"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </PanFrame>
  </>
);
