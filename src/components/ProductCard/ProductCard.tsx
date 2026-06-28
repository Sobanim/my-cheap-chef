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
      {discountPercent && !product.isLidlPlus && (
        <span className={styles.badge}>-{discountPercent}%</span>
      )}

      {product.isLidlPlus && (
        <span className={styles.lidlPlusBadge}>
          Lidl Plus
        </span>
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

        {product.isLidlPlus && product.lidlPlusLabel && (
          <p className={styles.lidlPlusLabel}>{product.lidlPlusLabel}</p>
        )}

        {product.dateLabel && (
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
            <span className={styles.dateText}>Platí: {product.dateLabel}</span>
          </div>
        )}

        <div className={styles.priceRow}>
          {product.price > 0 ? (
            <>
              <span className={product.isLidlPlus ? styles.priceLidlPlus : styles.price}>
                {product.price.toFixed(2)} €
              </span>
              {hasDiscount && (
                <span className={styles.oldPrice}>
                  {product.oldPrice!.toFixed(2)} €
                </span>
              )}
              {product.isLidlPlus && discountPercent && (
                <span className={styles.discountTag}>-{discountPercent}%</span>
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

