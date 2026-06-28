import styles from './ProductCard.module.css';

type ProductBadgeProps = {
  isLidlPlus: boolean;
  discountPercent: number | null;
};

export const ProductBadge = ({ isLidlPlus, discountPercent }: Readonly<ProductBadgeProps>) => {
  if (isLidlPlus) {
    return <span className={styles.lidlPlusBadge}>Lidl Plus</span>;
  }

  if (discountPercent) {
    return <span className={styles.badge}>-{discountPercent}%</span>;
  }

  return null;
};
