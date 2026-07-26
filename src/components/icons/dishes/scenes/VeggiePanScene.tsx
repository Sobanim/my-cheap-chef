import styles from "../DishScene.module.scss";
import { PanFrame } from "../parts/PanFrame";

/*
 * A warm vegetable dish in the pan — leaves plus one red accent, the same
 * generalised "vegetables" image as VeggieRawScene, but hot: steam, and the
 * leaves sit in a pan instead of on a plate.
 */
export const VeggiePanScene = () => (
  <>
    <path
      className={styles.steamA}
      d="M8 4.6c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamB}
      d="M12 4.1c-.8.8-.8 1.6 0 2.4"
      stroke="#ffd600"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <PanFrame>
      <path
        className={styles.leaf}
        d="M7.6 15.4c-.5-2.4.8-4.2 2.4-5-.3 1.9.2 3.5-.5 5"
        stroke="#639922"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#3b6d11"
        fillOpacity="0.5"
      />
      <path
        className={styles.leaf2}
        d="M12.2 15.5c.9-2 2.5-2.7 3.9-2.3-1 1.2-1.4 2.6-2.5 3.2"
        stroke="#97c459"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#639922"
        fillOpacity="0.45"
      />
      <circle cx="10.8" cy="14.4" r="1.5" fill="#e24b4a" />
    </PanFrame>
  </>
);
