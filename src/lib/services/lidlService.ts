import type { Product, LidlSearchResponse, ProductItem } from '@/lib/types';

type PriceDetails = {
    price: number;
    oldPrice: number | null;
    isLidlPlus: boolean;
    lidlPlusLabel?: string;
};

type DateDetails = {
    validFrom: number | null;
    validUntil: number | null;
    dateLabel: string | null;
};

const LIDL_DATA_URL = 'https://www.lidl.sk/q/api/search?fetchsize=50&locale=sk_SK&assortment=SK&version=2.1.0&category.id=10068374';

/**
 * Helper to determine if a product belongs to target food categories.
 */
const isFoodCategory = (category?: string): boolean => {
    return category === 'Food' || category === 'OG';
};

/**
 * Extracts price, oldPrice, and Lidl Plus loyalty information from a product item.
 */
const extractPriceInfo = (item: ProductItem): PriceDetails => {
    const gridData = item.gridbox?.data;
    const priceInfo = gridData?.price;
    const lidlPlusOffer = gridData?.lidlPlus?.[0];

    const hasMainPrice = typeof priceInfo?.price === 'number' && priceInfo.price > 0;
    const hasLidlPlusPrice = !hasMainPrice && lidlPlusOffer && typeof lidlPlusOffer.price?.price === 'number';

    if (hasMainPrice) {
        return {
            price: priceInfo.price!,
            oldPrice: priceInfo.oldPrice ?? null,
            isLidlPlus: false,
        };
    }

    if (hasLidlPlusPrice) {
        return {
            price: lidlPlusOffer.price.price,
            oldPrice: lidlPlusOffer.price.oldPrice ?? null,
            isLidlPlus: true,
            lidlPlusLabel: lidlPlusOffer.highlightText || lidlPlusOffer.lidlPlusText || undefined,
        };
    }

    return {
        price: 0,
        oldPrice: null,
        isLidlPlus: false,
    };
};

/**
 * Extracts and cleans validity dates and labels.
 */
const extractDateInfo = (item: ProductItem): DateDetails => {
    const gridData = item.gridbox?.data;
    const stockAvail = gridData?.stockAvailability;
    const badgeV2 = stockAvail?.badgeInfoV2?.[0];
    const badgeText = stockAvail?.badgeInfo?.badges?.[0]?.text || '';

    const validFrom = badgeV2?.validFrom || null;
    const validUntil = badgeV2?.validUntil || null;

    let dateLabel: string | null = null;
    if (badgeText) {
        // Matches patterns like "25.06. - 28.06." or "od 01.06. - 30.06."
        const dateMatch = badgeText.match(/(?:od\s+)?\d{2}\.\d{2}\.\s*-\s*\d{2}\.\d{2}\./);
        dateLabel = dateMatch ? dateMatch[0] : badgeText;
    }

    return {
        validFrom,
        validUntil,
        dateLabel,
    };
};

/**
 * Transforms a raw ProductItem into a clean Product structure.
 * Returns null if the item does not belong to the target categories.
 */
const parseProduct = (item: ProductItem): Product | null => {
    const gridData = item.gridbox?.data;
    const category = gridData?.category;

    if (!isFoodCategory(category)) {
        return null;
    }

    const { price, oldPrice, isLidlPlus, lidlPlusLabel } = extractPriceInfo(item);
    const { validFrom, validUntil, dateLabel } = extractDateInfo(item);

    return {
        id: item.code,
        name: gridData?.fullTitle || item.label || 'Neznámy produkt',
        price,
        oldPrice,
        packInfo: gridData?.keyfacts?.supplementalDescription || '',
        imageUrl: gridData?.image || '',
        category: category || '',
        isLidlPlus,
        ...(lidlPlusLabel && { lidlPlusLabel }),
        validFrom,
        validUntil,
        dateLabel,
    };
};

/**
 * Fetches raw product items from the Lidl Search API and parses them.
 * In Next.js, this call is cached for 1 hour (revalidate: 3600).
 */
export const fetchActiveProducts = async (): Promise<Product[]> => {
    try {
        // TODO: harden the live Lidl API request:
        //  - AbortController with ~8s timeout (a Lidl hang must not freeze the page)
        //  - explicit User-Agent header (avoid being blocked as a bot)
        //  - 1 retry on 5xx / network errors
        const response = await fetch(LIDL_DATA_URL, {
            next: { revalidate: 3600 },
        } as RequestInit & { next?: { revalidate?: number | false } });

        if (!response.ok) {
            throw new Error(`Lidl API responded with status ${response.status}`);
        }

        const data: LidlSearchResponse = await response.json();
        const items = data.items || [];
        
        const cleanedProducts: Product[] = [];
        for (const item of items) {
            const product = parseProduct(item);
            if (product) {
                cleanedProducts.push(product);
            }
        }
        return cleanedProducts;
    } catch (error) {
        console.error('Error fetching/parsing Lidl products:', error);
        throw error;
    }
};
