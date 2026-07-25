import styles from "../DishScene.module.scss";

export const BakedScene = () => (
  <>
    <path
      className={styles.steamA}
      d="M8 4.5c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamB}
      d="M12 4c-.8.8-.8 1.6 0 2.4"
      stroke="#ffd600"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M5 18c-.6-4 1.8-8 7-8s7.6 4 7 8Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      fill="#ba7517"
      fillOpacity="0.35"
    />
    <path
      d="M9 12l1.5 2M12 11.5l1.5 2M15 12l1.5 2"
      stroke="#854f0b"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </>
);
