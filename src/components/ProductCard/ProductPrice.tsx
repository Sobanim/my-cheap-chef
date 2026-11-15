import styles from './ProductCard.module.scss';
import { formatEuro } from '@/lib/format';

type ProductPriceProps = {
  price: number;
  oldPrice: number | null;
  isLidlPlus: boolean;
  discountPercent: number | null;
  hasDiscount: boolean;
};

export const ProductPrice = ({
  price,
  oldPrice,
  isLidlPlus,
  discountPercent,
  hasDiscount,
}: Readonly<ProductPriceProps>) => {
  if (price <= 0) {
    return (
      <div className={styles.priceRow}>
        <span className={styles.priceInStore}>Cena v predajni</span>
      </div>
    );
  }

  return (
    <div className={styles.priceRow}>
      <span className={isLidlPlus ? styles.priceLidlPlus : styles.price}>
        {formatEuro(price)}
      </span>
      {hasDiscount && oldPrice !== null && (
        <span className={styles.oldPrice}>
          {formatEuro(oldPrice)}
        </span>
      )}
      {isLidlPlus && discountPercent && (
        <span className={styles.discountTag}>-{discountPercent}%</span>
      )}
    </div>
  );
};
