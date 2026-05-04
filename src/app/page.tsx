import { promises as fs } from "fs";
import path from "path";
import { ProductGrid, EmptyState } from "@/components";
import type { Product } from "@/lib/types";
import styles from "./page.module.css";

export default async function Home() {
  let products: Product[] = [];

  try {
    const filePath = path.join(process.cwd(), "data", "products.json");
    const raw = await fs.readFile(filePath, "utf-8");
    products = JSON.parse(raw);
  } catch {
    // Файл не найден — покажем EmptyState
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
          <ProductGrid products={products} />
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
