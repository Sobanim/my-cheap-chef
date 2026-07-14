"use client";

import { useEffect, useState } from "react";
import styles from "./DevThemePanel.module.scss";

const SCHEMES = [
  { id: "green", color: "#00e676", label: "Зеленый (Стандарт)" },
  { id: "orange", color: "#ff6d00", label: "Оранжевый (Аппетитная сделка)" },
  { id: "berry", color: "#d81b60", label: "Ягодный (Умный гурман)" },
  { id: "red", color: "#ff1744", label: "Красный (Жгучий контраст)" },
] as const;

export const DevThemePanel = () => {
  const [active, setActive] = useState<string>("orange");

  useEffect(() => {
    // Apply scheme on mount and when changed
    document.documentElement.setAttribute("data-scheme", active);
  }, [active]);

  return (
    <div className={styles.panel}>
      <span className={styles.label}>Палитра (Dev):</span>
      <div className={styles.selector}>
        {SCHEMES.map((s) => (
          <button
            key={s.id}
            className={`${styles.btn} ${active === s.id ? styles.active : ""}`}
            style={{ backgroundColor: s.color }}
            title={s.label}
            onClick={() => setActive(s.id)}
            aria-label={s.label}
          />
        ))}
      </div>
    </div>
  );
};
