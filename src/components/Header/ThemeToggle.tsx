"use client";

import { useTheme } from "../ThemeProvider/ThemeProvider";
import { SunIcon, MoonIcon } from "../icons";
import styles from "./ThemeToggle.module.scss";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? "Prepnúť na svetlý režim" : "Prepnúť na tmavý režim"}
      title={isDark ? "Svetlý režim" : "Tmavý režim"}
    >
      <span className={styles.iconWrap} data-visible={isDark}>
        <MoonIcon className={styles.icon} />
      </span>
      <span className={styles.iconWrap} data-visible={!isDark}>
        <SunIcon className={styles.icon} />
      </span>
    </button>
  );
};
