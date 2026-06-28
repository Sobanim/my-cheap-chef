import styles from './ProductCard.module.css';
import type { Product } from '@/lib/types';
import { ProductBadge } from './ProductBadge';
import { ProductImage } from './ProductImage';
import { ProductDate } from './ProductDate';
import { ProductPrice } from './ProductPrice';

type ProductCardProps = {
  product: Product;
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

export const ProductCard = ({ product }: Readonly<ProductCardProps>) => {
  const { hasDiscount, discountPercent } = getDiscountInfo(product.price, product.oldPrice);

  return (
    <article className={styles.card}>
      <ProductBadge
        isLidlPlus={product.isLidlPlus}
        discountPercent={discountPercent}
      />

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

