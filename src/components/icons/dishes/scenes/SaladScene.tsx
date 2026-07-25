import styles from "../DishScene.module.scss";

export const SaladScene = () => (
  <>
    <path
      className={styles.leaf}
      d="M9 14c-.5-2.5.8-4.4 2.5-5.2-.3 2 .2 3.6-.5 5.2"
      stroke="#639922"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#3b6d11"
      fillOpacity="0.5"
    />
    <path
      className={styles.leaf2}
      d="M14.5 14c1-2.2 2.8-3 4.4-2.6-1.2 1.4-1.6 2.9-2.9 3.6"
      stroke="#97c459"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#639922"
      fillOpacity="0.45"
    />
    <circle cx="12.5" cy="13" r="1.6" fill="#e24b4a" />
    <path
      d="M4 13.5h16a8 8 0 0 1-16 0Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </>
);
