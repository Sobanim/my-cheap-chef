import fs from 'fs';
import path from 'path';
import { fetchActiveProducts } from '../src/lib/services/lidlService';

const OUTPUT_FILE_PATH = path.join(__dirname, '..', 'data', 'products.json');

/**
 * Main ingestion orchestrator.
 */
const processLidlData = async () => {
    try {
        console.log('📡 Fetching data from Lidl API...');
        const products = await fetchActiveProducts();
        
        const dir = path.dirname(OUTPUT_FILE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(products, null, 2));

        console.log(`✅ Success! Processed products: ${products.length}`);
        console.log(`📂 Result saved to: ${path.relative(process.cwd(), OUTPUT_FILE_PATH)}`);
    } catch (error) {
        console.error('❌ Error processing Lidl data:', error);
    }
};

// Run the script
processLidlData();