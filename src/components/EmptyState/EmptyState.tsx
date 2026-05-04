import styles from './EmptyState.module.css';

export function EmptyState() {
  return (
    <div className={styles.container}>
      <div className={styles.emoji}>🛒</div>
      <h2 className={styles.title}>Zatiaľ žiadne produkty</h2>
      <p className={styles.description}>
        Nový katalóg ešte nebol spracovaný. 🧑‍🍳
        <br />
        Vráť sa neskôr — čoskoro tu budú čerstvé zľavy!
      </p>
      <div className={styles.hint}>
        💡 Katalógy sa aktualizujú každý týždeň
      </div>
    </div>
  );
}

