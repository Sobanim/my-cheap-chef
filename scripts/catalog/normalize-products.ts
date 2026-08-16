/**
 * Step 3 — turn raw per-page extractions into the product catalog.
 *
 * This is where the flyer's messiness is absorbed: inconsistent date formats,
 * per-kilogram vs per-pack pricing, promo badges that mean different things, and
 * the same product printed on several pages.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { FoodRole, PriceTier, PricingUnit, Product } from '@/lib/types';
import type { Flyer } from './flyer-api';
import { parseIsoDate } from './flyer-api';
import type { PageResult, RawProduct } from './parse-pages';
import { normalizeName } from './normalize-name';

const CATALOG_FILE = path.join(__dirname, '..', '..', 'data', 'catalog.json');

/** Badge texts that mark a multi-buy offer. */
const BUNDLE_PATTERN = /\d\s*\+\s*\d|zadarmo/i;

/**
 * Decides the price tier.
 *
 * Order matters: a genuine struck-through price wins over whatever the badge
 * says. The live probe returned `priceLabel: "Dlhodobo zlacnené"` alongside a
 * real `oldPrice` — a label-first rule would have thrown that discount away.
 */
const derivePriceTier = (raw: RawProduct): PriceTier => {
  if (raw.oldPrice > raw.price) return 'discounted';
  if (BUNDLE_PATTERN.test(raw.priceLabel)) return 'bundle';
  return 'low_price';
};

/**
 * Decides whether the price buys a pack or a unit of weight.
 *
 * The distinction is carried by the words "cena za" ("price per"): "cena za 1 kg"
 * is per-kilogram meat, while a bare "1 kg" is a one-kilogram pack.
 */
const derivePricingUnit = (packInfo: string): PricingUnit => {
  if (/cena\s+za\s*100\s*g/i.test(packInfo)) return 'per_100g';
  if (/cena\s+za\s*(1\s*)?kg/i.test(packInfo)) return 'per_kg';
  return 'pack';
};

/**
 * Parses a page banner date ("20.08.", "22.8.") into epoch seconds.
 *
 * The flyer prints day and month only, so the year comes from the flyer's own
 * offer window. Around New Year the banner month can belong to the next year,
 * which the month comparison below picks up.
 */
const parseBannerDate = (banner: string, flyerStart: Date): number | null => {
  const match = banner.match(/(\d{1,2})\s*\.\s*(\d{1,2})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;

  const year =
    month < flyerStart.getUTCMonth() + 1 - 6
      ? flyerStart.getUTCFullYear() + 1 // banner rolled over into January
      : flyerStart.getUTCFullYear();

  return Date.UTC(year, month - 1, day) / 1000;
};

/**
 * Resolves a product's validity window.
 *
 * A page-level banner ("od štvrtka 20. 8. do 23. 8.") is the source of truth —
 * it is what separates the Thursday and weekend baskets from the whole-week one.
 * Pages without a banner inherit the flyer's own window.
 *
 * Dates are UTC midnight of the Slovak calendar day, which is what
 * `getBasketForProduct()` expects: it derives the weekday in Europe/Bratislava,
 * so a bare date must not be shifted by the runner's timezone.
 */
const resolveValidity = (
  page: PageResult,
  flyerStart: Date,
  flyerEnd: Date,
): { validFrom: number; validUntil: number; dateLabel: string | null } => {
  const bannerFrom = parseBannerDate(page.validFrom, flyerStart);
  const bannerTo = parseBannerDate(page.validTo, flyerStart);

  if (bannerFrom && bannerTo) {
    return {
      validFrom: bannerFrom,
      validUntil: bannerTo,
      dateLabel: `${page.validFrom.replace(/\.$/, '')}. - ${page.validTo.replace(/\.$/, '')}.`,
    };
  }

  return {
    validFrom: flyerStart.getTime() / 1000,
    validUntil: flyerEnd.getTime() / 1000,
    dateLabel: null,
  };
};

/**
 * Builds the product id.
 *
 * Assigned from the dedup key rather than the page it was found on, so a product
 * printed on two pages gets ONE id. That identity is what lets recipes be linked
 * to each other later ("this recipe finishes the pack that one opened") — an id
 * derived from page position would silently break it.
 *
 * It only has to be stable within a single run; matching a product across weeks
 * is a harder problem and belongs to the price-history step.
 */
const buildProductId = (dedupeKey: string): string =>
  `f-${crypto.createHash('sha1').update(dedupeKey).digest('hex').slice(0, 10)}`;

/** Merges a duplicate sighting into the product already kept. */
const mergeDuplicate = (kept: Product, incoming: Product): Product => ({
  ...kept,
  // A real reference price beats none, whichever page happened to print it.
  oldPrice: kept.oldPrice ?? incoming.oldPrice,
  priceTier: kept.priceTier === 'discounted' ? kept.priceTier : incoming.priceTier,
  // The offer starts on the earliest day any page advertises it.
  validFrom: Math.min(kept.validFrom ?? Infinity, incoming.validFrom ?? Infinity),
  validUntil: Math.max(kept.validUntil ?? 0, incoming.validUntil ?? 0),
});

const toProduct = (
  raw: RawProduct,
  validity: ReturnType<typeof resolveValidity>,
  dedupeKey: string,
): Product => {
  const tier = derivePriceTier(raw);

  return {
    id: buildProductId(dedupeKey),
    name: raw.name.trim(),
    price: raw.price,
    // Only a genuinely printed original price is kept; anything else stays null
    // so no downstream code can mistake it for a real comparison.
    oldPrice: tier === 'discounted' ? raw.oldPrice : null,
    packInfo: raw.packInfo.trim(),
    // Flyer items have no product photo. Nothing in the recipe UI shows one, so
    // this stays empty rather than inviting a fuzzy match against the live API.
    imageUrl: '',
    category: 'Food',
    isLidlPlus: raw.isLidlPlus,
    ...(raw.priceLabel ? { promoNote: raw.priceLabel } : {}),
    priceTier: tier,
    pricingUnit: derivePricingUnit(raw.packInfo),
    foodRole: raw.foodRole as FoodRole,
    validFrom: validity.validFrom,
    validUntil: validity.validUntil,
    dateLabel: validity.dateLabel,
  };
};

/**
 * Converts raw page extractions into the deduplicated product catalog.
 */
export const normalizeProducts = (pages: PageResult[], flyer: Flyer): Product[] => {
  const flyerStart = parseIsoDate(flyer.offerStartDate);
  const flyerEnd = parseIsoDate(flyer.offerEndDate);

  const byKey = new Map<string, Product>();
  let dropped = 0;

  for (const page of pages) {
    const validity = resolveValidity(page, flyerStart, flyerEnd);

    for (const raw of page.products) {
      // Non-food is out, and so is a missing price: the vision pass occasionally
      // returns 0 for a coupon-only offer with no printed number, and a product
      // with no price can neither be cooked with nor costed.
      if (!raw.isFood || raw.foodRole === 'nonfood' || raw.price <= 0) {
        dropped++;
        continue;
      }

      const dedupeKey = `${normalizeName(raw.name)}|${raw.price.toFixed(2)}`;
      const product = toProduct(raw, validity, dedupeKey);
      const existing = byKey.get(dedupeKey);

      byKey.set(dedupeKey, existing ? mergeDuplicate(existing, product) : product);
    }
  }

  const products = [...byKey.values()];
  const roleCounts = products.reduce<Record<string, number>>((counts, product) => {
    counts[product.foodRole ?? 'unknown'] = (counts[product.foodRole ?? 'unknown'] ?? 0) + 1;
    return counts;
  }, {});
  const tierCounts = products.reduce<Record<string, number>>((counts, product) => {
    counts[product.priceTier ?? 'unknown'] = (counts[product.priceTier ?? 'unknown'] ?? 0) + 1;
    return counts;
  }, {});

  console.log(`🧹 Normalized ${products.length} products (dropped ${dropped} non-food/priceless).`);
  console.log(`   By role: ${JSON.stringify(roleCounts)}`);
  console.log(`   By tier: ${JSON.stringify(tierCounts)}`);

  return products;
};

/** Writes the catalog. Committed to git — it shows exactly what the model chose from. */
export const saveCatalog = (products: Product[], flyer: Flyer): void => {
  const payload = {
    flyerIdentifier: flyer.identifier,
    offerStartDate: flyer.offerStartDate,
    offerEndDate: flyer.offerEndDate,
    generatedAt: new Date().toISOString(),
    products,
  };
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(payload, null, 2));
  console.log(`   Catalog: ${path.relative(process.cwd(), CATALOG_FILE)}`);
};

/** Reads the saved catalog, so recipe generation can run without re-parsing. */
export const readCatalog = (): { products: Product[]; flyerIdentifier: string } | null => {
  if (!fs.existsSync(CATALOG_FILE)) return null;
  const payload = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf-8')) as {
    flyerIdentifier: string;
    products: Product[];
  };
  return { products: payload.products, flyerIdentifier: payload.flyerIdentifier };
};
