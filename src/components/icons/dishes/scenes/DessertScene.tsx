import styles from "../DishScene.module.scss";

export const DessertScene = () => (
  <>
    <circle className={styles.bob} cx="12" cy="5.5" r="1.3" fill="#e24b4a" />
    <path
      className={styles.bob}
      d="M12 6.8V9"
      stroke="#3b6d11"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <path
      d="M7 12c0-2.8 2.2-4 5-4s5 1.2 5 4Z"
      fill="#ed93b1"
      stroke="#d4537e"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M8 12h8l-1 6.5a1 1 0 0 1-1 .9h-4a1 1 0 0 1-1-.9Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M10 14v3M12.7 14v3"
      stroke="var(--color-text-muted)"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </>
);
