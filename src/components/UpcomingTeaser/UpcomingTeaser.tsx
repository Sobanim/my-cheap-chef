import styles from "./UpcomingTeaser.module.scss";

type UpcomingTeaserProps = {
  /** Slovak preposition phrase for the next drop, e.g. "od štvrtka" */
  fromPhrase: string;
  recipeCount: number;
};

export const UpcomingTeaser = ({
  fromPhrase,
  recipeCount,
}: Readonly<UpcomingTeaserProps>) => {
  return (
    <section className={styles.section} aria-labelledby="upcoming-heading">
      <div className={styles.headingRow}>
        <h2 id="upcoming-heading" className={styles.heading}>
          Čo navaríme najbližšie?
        </h2>
      </div>

      <div className={styles.card}>
        <div className={styles.lockRow} aria-hidden="true">
          {Array.from({ length: recipeCount }).map((_, i) => (
            <div key={i} className={styles.lockedItem}>
              <span className={styles.lockIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className={styles.lockBars}>
                <span className={styles.bar} />
                <span className={styles.barShort} />
              </span>
            </div>
          ))}
        </div>

        <div className={styles.text}>
          <p className={styles.title}>
            {fromPhrase}: Nové zľavy a {recipeCount} ďalšie recepty
          </p>
          <p className={styles.subtitle}>
            Odomkneme, keď Lidl spustí ďalšiu vlnu akcií.
          </p>
        </div>
      </div>
    </section>
  );
};
