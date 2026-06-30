import styles from './ProductCard.module.css';
import type { Product } from '@/lib/types';
import { ProductImage } from './ProductImage';
import { ProductDate } from './ProductDate';
import { ProductPrice } from './ProductPrice';
import { getSlovakPrepPhrase } from '@/lib/dateUtils';

type ProductCardProps = {
  product: Product;
  isUpcoming?: boolean;
};

type DiscountInfo = {
  hasDiscount: boolean;
  discountPercent: number | null;
};

const getDiscountInfo = (price: number, oldPrice: number | null): DiscountInfo => {
  const hasDiscount = oldPrice !== null && oldPrice > price;
  const discountPercent = hasDiscount
    ? Math.round((1 - price / oldPrice!) * 100)
    : null;
  return { hasDiscount, discountPercent };
};

export const ProductCard = ({ product, isUpcoming }: Readonly<ProductCardProps>) => {
  const { hasDiscount, discountPercent } = getDiscountInfo(product.price, product.oldPrice);

  const dayOfWeek = product.validFrom ? new Date(product.validFrom * 1000).getDay() : null;
  const upcomingLabel = dayOfWeek !== null ? getSlovakPrepPhrase(dayOfWeek) : '';

  return (
    <article className={`${styles.card} ${isUpcoming ? styles.cardUpcoming : ''}`}>
      {product.isLidlPlus && (
        <span className={styles.lidlPlusBadge}>Lidl Plus</span>
      )}

      <div className={styles.badgeContainer}>
        {isUpcoming && upcomingLabel && (
          <span className={styles.upcomingBadge}>
            Pripravované {upcomingLabel}
          </span>
        )}
        {!product.isLidlPlus && discountPercent && (
          <span className={styles.badge}>-{discountPercent}%</span>
        )}
      </div>

      <ProductImage imageUrl={product.imageUrl} name={product.name} />

      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.packInfo}>{product.packInfo}</p>

        {product.isLidlPlus && product.lidlPlusLabel && (
          <p className={styles.lidlPlusLabel}>{product.lidlPlusLabel}</p>
        )}

        <ProductDate dateLabel={product.dateLabel?.toString()} />

        <ProductPrice
          price={product.price}
          oldPrice={product.oldPrice}
          isLidlPlus={product.isLidlPlus}
          discountPercent={discountPercent}
          hasDiscount={hasDiscount}
        />
      </div>
    </article>
  );
};

