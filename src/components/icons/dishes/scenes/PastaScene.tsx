import styles from "../DishScene.module.scss";

export const PastaScene = () => (
  <>
    <path
      className={styles.steamA}
      d="M10 4.5c-.8.8-.8 1.6 0 2.4"
      stroke="#ffd600"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamB}
      d="M14 5c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M4 13h16a8 8 0 0 1-16 0Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M7 12.5c1.5-1 3-1 4.5 0s3 1 4.5 0"
      stroke="#ef9f27"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8 10.5c1.3-.8 2.7-.8 4 0s2.7.8 4 0"
      stroke="#ba7517"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </>
);
