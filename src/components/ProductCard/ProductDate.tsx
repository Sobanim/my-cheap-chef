import styles from './ProductCard.module.scss';
import { CalendarIcon } from '../icons';

type ProductDateProps = {
  dateLabel?: string;
};

export const ProductDate = ({ dateLabel }: Readonly<ProductDateProps>) => {
  if (!dateLabel) return null;

  return (
    <div className={styles.dateRow}>
      <CalendarIcon className={styles.calendarIcon} />
      <span className={styles.dateText}>Platí: {dateLabel}</span>
    </div>
  );
};
