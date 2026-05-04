import styles from './ProductGrid.module.css';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: Readonly<ProductGridProps>) {
  return (
    <section className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
