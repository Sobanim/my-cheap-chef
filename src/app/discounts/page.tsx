import { ProductCatalog } from '@/components';
import { fetchActiveProducts } from '@/lib/services/lidlService';
import type { Product } from '@/lib/types';
import styles from './page.module.scss';

export default async function DiscountsPage() {
    let products: Product[] = [];
    const serverTime = Math.floor(Date.now() / 1000);

    try {
        products = await fetchActiveProducts();
    } catch (error) {
        console.error("Failed to fetch products for discounts page:", error);
    }

    return (
        <>
            <header className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Všetky zľavy</h1>
                <p className={styles.pageDescription}>Prezrite si všetky aktuálne aj pripravované akcie a zľavy.</p>
            </header>
            <ProductCatalog products={products} serverTime={serverTime} />
        </>
    );
}
