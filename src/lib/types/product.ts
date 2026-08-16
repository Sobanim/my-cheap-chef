/**
 * How trustworthy the saving on a product is.
 *
 * Roughly a third of flyer offers advertise a promo price with no struck-through
 * original, so there is nothing honest to compare against — that is a gap in
 * Lidl's own data, not a parsing failure, and it must not be papered over with
 * an estimated original price.
 */
export type PriceTier =
  /** A real struck-through original price is printed — savings are computed from it. */
  | 'discounted'
  /** "Nová nižšia cena" / "Cenový trhák" style: cheap, but no reference price exists. */
  | 'low_price'
  /** "4+2 zadarmo" style: the unit price only holds if you buy the whole bundle. */
  | 'bundle';

/**
 * Whether `price` buys a pack or a unit of weight.
 *
 * Flyer meat and produce are priced "cena za 1 kg" — you take the weight you
 * need, so there is no whole pack to round up to when totalling a shopping
 * basket. Getting this wrong turns "500 g of pork" into "buy a whole kilo".
 */
export type PricingUnit = 'pack' | 'per_kg' | 'per_100g';

/** What role the item plays in cooking — drives which products reach the recipe prompt. */
export type FoodRole = 'ingredient' | 'snack' | 'drink' | 'ready_meal' | 'nonfood';

/** Discounted product */
export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  packInfo: string;
  imageUrl: string;
  category: string;
  /**
   * The three fields below come from flyer parsing. They are optional because
   * products fetched from the live Lidl API don't carry them, and both sources
   * feed the same recipe generator.
   */
  priceTier?: PriceTier;
  pricingUnit?: PricingUnit;
  foodRole?: FoodRole;
  /** Literal promo badge text, e.g. "4+2 ZADARMO" — shown, never counted as savings. */
  promoNote?: string;
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

