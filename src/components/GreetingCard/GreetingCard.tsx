import styles from "./GreetingCard.module.scss";
import type { GreetingInfo } from "@/lib/menuLogic";

type GreetingCardProps = {
  greeting: GreetingInfo;
  activeCount: number;
};

export const GreetingCard = ({ greeting, activeCount }: Readonly<GreetingCardProps>) => {
  return (
    <section className={styles.card} aria-labelledby="greeting-heading">
      <div className={styles.glow} aria-hidden="true" />
      <p className={styles.eyebrow}>Dnešný prehľad</p>
      <h2 id="greeting-heading" className={styles.heading}>
        {greeting.greeting} <span className={styles.emoji}>{greeting.emoji}</span>
      </h2>
      <p className={styles.body}>{greeting.body}</p>

      <div className={styles.stats}>
        <span className={styles.stat}>
          <span className={styles.statValue}>{activeCount}</span>
          <span className={styles.statLabel}>aktívnych zliav</span>
        </span>
        <span className={styles.divider} aria-hidden="true" />
        <span className={styles.stat}>
          <span className={styles.statValue}>Lidl</span>
          <span className={styles.statLabel}>zdroj akcií</span>
        </span>
      </div>
    </section>
  );
};
