'use client';

import { useState } from 'react';
import { ProductGrid } from '../ProductGrid/ProductGrid';
import { isProductActive, isProductUpcoming } from '@/lib/dateUtils';
import type { Product } from '@/lib/types';
import styles from './ProductCatalog.module.css';

type ProductCatalogProps = {
  products: Product[];
  serverTime: number;
};

type TabType = 'active' | 'upcoming' | 'all';

export const ProductCatalog = ({ products, serverTime }: Readonly<ProductCatalogProps>) => {
  const [activeTab, setActiveTab] = useState<TabType>('active');

  // Categorize products based on serverTime reference
  const activeProducts = products.filter((p) =>
    isProductActive(p.validFrom, p.validUntil, serverTime)
  );
  const upcomingProducts = products.filter((p) =>
    isProductUpcoming(p.validFrom, serverTime)
  );

  const getFilteredProducts = (): Product[] => {
    switch (activeTab) {
      case 'active':
        return activeProducts;
      case 'upcoming':
        return upcomingProducts;
      case 'all':
      default:
        return products;
    }
  };

  const filteredProducts = getFilteredProducts();

  const getEmptyStateMessage = (): string => {
    switch (activeTab) {
      case 'active':
        return 'Momentálne nie sú žiadne aktívne zľavy.';
      case 'upcoming':
        return 'Na zvyšok týždňa zatiaľ nie sú naplánované žiadne nové zľavy.';
      case 'all':
      default:
        return 'Nenašli sa žiadne produkty.';
    }
  };

  return (
    <div className={styles.catalog}>
      <div className={styles.tabWrapper}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <span className={styles.tabText}>Aktuálne zľavy</span>
            <span className={styles.countBadge}>{activeProducts.length}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.active : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <span className={styles.tabText}>Pripravované</span>
            <span className={styles.countBadge}>{upcomingProducts.length}</span>
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span className={styles.tabText}>Všetky</span>
            <span className={styles.countBadge}>{products.length}</span>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} serverTime={serverTime} />
        ) : (
          <div className={styles.emptyTabState}>
            <div className={styles.emptyIcon}>🔍</div>
            <p className={styles.emptyText}>{getEmptyStateMessage()}</p>
          </div>
        )}
      </div>
    </div>
  );
};
