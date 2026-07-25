import styles from "../DishScene.module.scss";

export const MeatScene = () => (
  <>
    <path
      className={styles.steamA}
      d="M9 5c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamB}
      d="M12.5 4.5c-.8.8-.8 1.6 0 2.4"
      stroke="#ffd600"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <circle cx="10.5" cy="14" r="6.6" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M17.1 14h5.4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <ellipse cx="10.5" cy="14.3" rx="3.4" ry="2.6" fill="#d85a30" />
    <path
      d="M8.7 13.6l3.6 1.4"
      stroke="#4a1b0c"
      strokeWidth="0.9"
      strokeLinecap="round"
    />
  </>
);
