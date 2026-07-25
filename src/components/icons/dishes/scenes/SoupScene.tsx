import styles from "../DishScene.module.scss";

export const SoupScene = () => (
  <>
    <path
      className={styles.steamA}
      d="M9 4c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamB}
      d="M12 3.5c-.8.8-.8 1.6 0 2.4"
      stroke="#ffd600"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamC}
      d="M15 4c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 13.5h15"
      stroke="#ff6d00"
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.7"
    />
    <circle className={styles.bob} cx="10" cy="15" r="1.1" fill="#ef9f27" />
    <circle
      className={styles.bobDelayed}
      cx="14"
      cy="14.5"
      r="0.9"
      fill="#d85a30"
    />
  </>
);
