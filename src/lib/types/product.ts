/** Discounted product */
export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  packInfo: string;
  imageUrl: string;
  category: string;
  /** true when the price comes from a Lidl Plus card-only offer */
  isLidlPlus: boolean;
  /** Optional promo label, e.g. "4 + 2 ZADARMO", "pri kúpe od 6 kusov" */
  lidlPlusLabel?: string;
  /** Unix timestamp in seconds */
  validFrom: number | null;
  /** Unix timestamp in seconds */
  validUntil: number | null;
  /** Cleaned date label (e.g. "25.06. - 28.06.") */
  dateLabel: string | null;
};

