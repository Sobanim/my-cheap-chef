/**
 * ingest-catalog.ts
 *
 * Скрипт для извлечения продуктов из картинок каталога через Vision AI.
 *
 * Поток:
 * 1. Читает картинки из data/catalog-images/lidl/<дата>/
 * 2. Отправляет каждую картинку в Vision AI
 * 3. Получает структурированный JSON с продуктами
 * 4. Объединяет результаты, убирает дубли
 * 5. Сохраняет в data/products.json
 *
 * Запуск: npm run catalog:ingest
 *
 * TODO:
 * - [ ] Выбрать AI-провайдера (OpenAI GPT-4o / Apify / другой)
 * - [ ] Добавить API-ключ в .env
 * - [ ] Реализовать отправку изображений
 * - [ ] Реализовать парсинг ответа AI в структуру Product[]
 */

import fs from 'fs';
import path from 'path';

const CATALOG_DIR = path.join(__dirname, '..', 'data', 'catalog-images', 'lidl');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'products.json');

async function ingestCatalog() {
  console.log('🖼️  Парсинг каталога через Vision AI...');

  // Ищем последнюю папку с картинками
  if (!fs.existsSync(CATALOG_DIR)) {
    console.error('❌ Папка с картинками не найдена:', CATALOG_DIR);
    console.log('   Создай папку и положи туда картинки каталога:');
    console.log('   data/catalog-images/lidl/YYYY-MM-DD/page-01.jpg');
    process.exit(1);
  }

  const dateFolders = fs.readdirSync(CATALOG_DIR)
    .filter(f => fs.statSync(path.join(CATALOG_DIR, f)).isDirectory())
    .sort()
    .reverse();

  if (dateFolders.length === 0) {
    console.error('❌ Нет папок с датами в', CATALOG_DIR);
    process.exit(1);
  }

  const latestFolder = path.join(CATALOG_DIR, dateFolders[0]);
  const images = fs.readdirSync(latestFolder)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();

  console.log(`📂 Папка: ${dateFolders[0]}`);
  console.log(`🖼️  Найдено картинок: ${images.length}`);

  if (images.length === 0) {
    console.error('❌ Нет картинок в папке', latestFolder);
    process.exit(1);
  }

  // TODO: Реализовать отправку в Vision AI
  console.log('');
  console.log('⚠️  Vision AI провайдер ещё не настроен.');
  console.log('   Нужно:');
  console.log('   1. Выбрать провайдера (OpenAI / Apify / другой)');
  console.log('   2. Добавить API-ключ в .env');
  console.log('   3. Реализовать логику отправки и парсинга');
}

ingestCatalog();

