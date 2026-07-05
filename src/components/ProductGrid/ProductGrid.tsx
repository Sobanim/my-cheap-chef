import styles from './ProductGrid.module.scss';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import type { Product } from '@/lib/types';
import { isProductUpcoming } from '@/lib/dateUtils';

type ProductGridProps = {
  products: Product[];
  serverTime: number;
};

export const ProductGrid = ({ products, serverTime }: Readonly<ProductGridProps>) => {
  return (
    <section className={styles.grid}>
      {products.map((product) => {
        const isUpcoming = isProductUpcoming(product.validFrom, serverTime);
        return (
          <ProductCard
            key={product.id}
            product={product}
            isUpcoming={isUpcoming}
          />
        );
      })}
    </section>
  );
};
