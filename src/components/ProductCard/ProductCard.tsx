import Image from 'next/image';
import styles from './ProductCard.module.css';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: Readonly<ProductCardProps>) {
  const hasDiscount = product.oldPrice !== null && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice!) * 100)
    : null;

  return (
    <article className={styles.card}>
      {discountPercent && (
        <span className={styles.badge}>-{discountPercent}%</span>
      )}

      <div className={styles.imageWrapper}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={427}
          height={320}
          className={styles.image}
        />
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.packInfo}>{product.packInfo}</p>

        <div className={styles.priceRow}>
          {product.price > 0 ? (
            <>
              <span className={styles.price}>
                {product.price.toFixed(2)} €
              </span>
              {hasDiscount && (
                <span className={styles.oldPrice}>
                  {product.oldPrice!.toFixed(2)} €
                </span>
              )}
            </>
          ) : (
            <span className={styles.priceInStore}>Cena v predajni</span>
          )}
        </div>
      </div>
    </article>
  );
}

