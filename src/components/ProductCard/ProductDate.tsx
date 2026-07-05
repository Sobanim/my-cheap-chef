import styles from './ProductCard.module.scss';

type ProductDateProps = {
  dateLabel?: string;
};

export const ProductDate = ({ dateLabel }: Readonly<ProductDateProps>) => {
  if (!dateLabel) return null;

  return (
    <div className={styles.dateRow}>
      <svg
        className={styles.calendarIcon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span className={styles.dateText}>Platí: {dateLabel}</span>
    </div>
  );
};
