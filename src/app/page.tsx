import { ProductCatalog, EmptyState } from "@/components";
import { fetchActiveProducts } from "@/lib/services/lidlService";
import type { Product } from "@/lib/types";
import styles from "./page.module.scss";

export default async function Home() {
  "use no memo";
  let products: Product[] = [];
  const serverTime = Math.floor(Date.now() / 1000);

  try {
    products = await fetchActiveProducts();
  } catch (error) {
    console.error("Failed to fetch products dynamically:", error);
  }


  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🍳 Varím zo zliav</h1>
        <p className={styles.subtitle}>
          Akciové produkty tento týždeň — Lidl Slovensko
        </p>
      </header>

      <main>
        {products.length > 0 ? (
          <ProductCatalog products={products} serverTime={serverTime} />
        ) : (
          <EmptyState />
        )}
      </main>

      <footer className={styles.footer}>
        <button className={styles.magicButton} disabled>
          ✨ Čo uvariť? (čoskoro)
        </button>
      </footer>
    </div>
  );
}
