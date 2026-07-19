import styles from "./DishScene.module.scss";
import type { RecipeCategory } from "@/lib/types/recipe";

type DishSceneProps = {
  category: RecipeCategory;
  className?: string;
};

/*
 * Hand-drawn animated illustration per dish category — the deliberate
 * alternative to AI-generated dish photos. One scene per canonical
 * RecipeCategory (meat | pasta | soup | salad | baked | dessert).
 *
 * The vessel outline is `currentColor` (theme-driven); food fills are
 * literal mid-tones tuned to read on both the light and dark surfaces.
 * Animated parts carry a module class (steam / sway / bob).
 */
const SCENES: Record<RecipeCategory, React.ReactNode> = {
  meat: (
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
  ),
  pasta: (
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
  ),
  soup: (
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
  ),
  salad: (
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
  ),
  baked: (
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
  ),
  dessert: (
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
  ),
};

export const DishScene = ({ category, className }: Readonly<DishSceneProps>) => {
  return (
    <div className={`${styles.scene} ${className ?? ""}`.trim()}>
      <svg
        className={styles.svg}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
      >
        {SCENES[category]}
      </svg>
    </div>
  );
};
