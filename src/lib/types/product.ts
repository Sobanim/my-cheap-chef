/** Продукт со скидкой */
export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  packInfo: string;
  imageUrl: string;
  category: string;
}

