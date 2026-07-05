import styles from './ProductCard.module.scss';

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
        {price.toFixed(2)} €
      </span>
      {hasDiscount && oldPrice !== null && (
        <span className={styles.oldPrice}>
          {oldPrice.toFixed(2)} €
        </span>
      )}
      {isLidlPlus && discountPercent && (
        <span className={styles.discountTag}>-{discountPercent}%</span>
      )}
    </div>
  );
};
