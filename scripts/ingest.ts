import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { LidlSearchResponse } from "./types";

const LIDL_DATA_URL = 'https://www.lidl.sk/q/api/search?fetchsize=50&locale=sk_SK&assortment=SK&version=2.1.0&category.id=10068374';

// const RAW_FILE_PATH = path.join(__dirname, 'raw', 'lidl.txt');
const OUTPUT_FILE_PATH = path.join(__dirname, '..', 'data', 'products.json');

async function processLidlData() {
    try {
        // 1. Fetch data
        // const rawData = fs.readFileSync(RAW_FILE_PATH, 'utf-8');
        // const json = JSON.parse(rawData);

        const response = await axios.get(LIDL_DATA_URL);
        const data: LidlSearchResponse = response.data;

        const items = data.items || [];
        const cleanedProducts = [];

        // 2. Iterate and filter
        for (const item of items) {
            const gridData = item.gridbox?.data; // The data path we need
            const priceInfo = item.gridbox.data.price;

            // Filter: Food and Fruits/Vegetables only
            const category = gridData?.category;
            if (category !== 'Food' && category !== 'OG') {
                continue;
            }

            // Determine price source: main price or Lidl Plus fallback
            const lidlPlusOffer = gridData?.lidlPlus?.[0];
            const hasMainPrice = typeof priceInfo?.price === 'number' && priceInfo.price > 0;
            const hasLidlPlusPrice = !hasMainPrice && lidlPlusOffer && typeof lidlPlusOffer.price?.price === 'number';

            let price: number;
            let oldPrice: number | null;
            let isLidlPlus = false;
            let lidlPlusLabel: string | undefined;

            if (hasMainPrice) {
                // Regular priced product (may also have a regular discount)
                price = priceInfo.price!;
                oldPrice = priceInfo.oldPrice ?? null;
            } else if (hasLidlPlusPrice) {
                // Lidl Plus-only discount — use loyalty card pricing
                price = lidlPlusOffer.price.price;
                oldPrice = lidlPlusOffer.price.oldPrice ?? null;
                isLidlPlus = true;
                lidlPlusLabel = lidlPlusOffer.highlightText || lidlPlusOffer.lidlPlusText || undefined;
            } else {
                // No price at all — skip or set to 0
                price = 0;
                oldPrice = null;
            }

            // Extract validity dates
            const stockAvail = gridData?.stockAvailability;
            const badgeV2 = stockAvail?.badgeInfoV2?.[0];
            const badgeText = stockAvail?.badgeInfo?.badges?.[0]?.text || '';

            const validFrom = badgeV2?.validFrom || null;
            const validUntil = badgeV2?.validUntil || null;

            // Clean up label: extract "DD.MM. - DD.MM." or "od DD.MM. - DD.MM." from the badge text
            let dateLabel: string | null = null;
            if (badgeText) {
                // Matches patterns like "25.06. - 28.06." or "od 01.06. - 30.06."
                const dateMatch = badgeText.match(/(?:od\s+)?\d{2}\.\d{2}\.\s*-\s*\d{2}\.\d{2}\./);
                dateLabel = dateMatch ? dateMatch[0] : badgeText;
            }

            // Form clean object
            const product = {
                id: item.code,
                name: gridData?.fullTitle || item.label || 'Neznámy produkt',
                price,
                oldPrice,
                packInfo: gridData?.keyfacts.supplementalDescription || '',
                imageUrl: gridData?.image || '',
                category: category,
                isLidlPlus,
                ...(lidlPlusLabel && { lidlPlusLabel }),
                validFrom,
                validUntil,
                dateLabel,
            };

            cleanedProducts.push(product);
        }

        // 3. Save the result
        // Create data directory if it doesn't exist
        const dir = path.dirname(OUTPUT_FILE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);

        fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(cleanedProducts, null, 2));

        console.log(`✅ Success! Processed products: ${cleanedProducts.length}`);
        console.log(`📂 Result saved to: data/products.json`);

    } catch (error) {
        console.error('❌ Error processing file:', error);
    }
}

processLidlData();