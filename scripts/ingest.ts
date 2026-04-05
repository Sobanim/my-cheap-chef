import fs from 'fs';
import path from 'path';
import axios from 'axios';
import {LidlSearchResponse} from "./types";

const LIDL_DATA_URL = 'https://www.lidl.sk/q/api/search?locale=sk_SK&assortment=SK&version=2.1.0&category.id=10068374';

// const RAW_FILE_PATH = path.join(__dirname, 'raw', 'lidl.txt');
const OUTPUT_FILE_PATH = path.join(__dirname, '..', 'data', 'products.json');

async function processLidlData() {
    try {
        // 1. Читаем data
        // const rawData = fs.readFileSync(RAW_FILE_PATH, 'utf-8');
        // const json = JSON.parse(rawData);

        const response = await axios.get(LIDL_DATA_URL);
        const data:LidlSearchResponse = response.data;

        const items = data.items || [];
        const cleanedProducts = [];

        // 2. Итерируемся и фильтруем
        for (const item of items) {
            const gridData = item.gridbox?.data; // Тот самый путь, о котором ты говорил
            const priceInfo = item.gridbox.data.price;

            // Фильтр: только Еда и Овощи/Фрукты
            const category = gridData?.category;
            if (category !== 'Food' && category !== 'OG') {
                continue;
            }

            // Формируем чистый объект
            const product = {
                id: item.code,
                // Берем название из gridbox.data
                name: gridData?.fullTitle || item.label || 'Neznámy produkt',
                price: priceInfo?.price || 0,
                oldPrice: priceInfo?.oldPrice || null,
                // Вес/упаковка тоже лежит в gridData
                packInfo: gridData?.keyfacts.supplementalDescription || '',
                imageUrl: gridData?.image || '',
                category: category
            };

            cleanedProducts.push(product);
        }

        // 3. Сохраняем результат
        // Создаем папку data, если её нет
        const dir = path.dirname(OUTPUT_FILE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);

        fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(cleanedProducts, null, 2));

        console.log(`✅ Успех! Обработано продуктов: ${cleanedProducts.length}`);
        console.log(`📂 Результат сохранен в: data/products.json`);

    } catch (error) {
        console.error('❌ Ошибка при обработке файла:', error);
    }
}

processLidlData();