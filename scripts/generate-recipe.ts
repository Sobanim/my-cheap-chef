/**
 * generate-recipe.ts
 *
 * Скрипт для генерации рецептов из текущих продуктов по скидке.
 *
 * Поток:
 * 1. Читает data/products.json
 * 2. Фильтрует: убирает алкоголь, non-food, товары с price=0
 * 3. Формирует промпт с базовой корзиной (соль, перец и т.д.)
 * 4. Отправляет в Text AI (GPT)
 * 5. Получает 1-2 рецепта в формате JSON
 * 6. Сохраняет в data/recipe.json
 *
 * Запуск: npm run recipe:generate
 *
 * TODO:
 * - [ ] Выбрать AI-провайдера
 * - [ ] Добавить API-ключ в .env
 * - [ ] Реализовать генерацию промпта
 * - [ ] Реализовать парсинг ответа
 */

import fs from 'fs';
import path from 'path';
import type { Product, RecipeData } from '../src/lib/types';

const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'recipe.json');

// Базовые продукты, которые есть у каждого
const BASE_PANTRY = ['soľ', 'čierny korenie', 'cukor', 'rastlinný olej', 'voda'];

// Слова-маркеры алкоголя (для фильтрации)
const ALCOHOL_KEYWORDS = ['vodka', 'víno', 'pivo', 'prosecco', 'whisky', 'rum', 'gin', 'likér'];

async function generateRecipe() {
  console.log('🍳 Генерация рецепта из продуктов по скидке...');

  if (!fs.existsSync(PRODUCTS_FILE)) {
    console.error('❌ Файл products.json не найден. Сначала запусти парсинг каталога.');
    process.exit(1);
  }

  const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  const allProducts: Product[] = JSON.parse(raw);

  // Фильтруем: убираем алкоголь, товары без цены
  const cookingProducts = allProducts.filter(p => {
    if (p.price <= 0) return false;
    const nameLower = p.name.toLowerCase();
    return !ALCOHOL_KEYWORDS.some(kw => nameLower.includes(kw));
  });

  console.log(`📦 Всего продуктов: ${allProducts.length}`);
  console.log(`🥕 Подходят для готовки: ${cookingProducts.length}`);
  console.log('');
  console.log('Продукты для рецепта:');
  cookingProducts.forEach(p => {
    const discount = p.oldPrice ? ` (было ${p.oldPrice}€)` : '';
    console.log(`  - ${p.name}: ${p.price}€${discount} [${p.packInfo}]`);
  });

  // TODO: Реализовать отправку в AI
  console.log('');
  console.log('⚠️  AI провайдер ещё не настроен.');
  console.log('   Нужно:');
  console.log('   1. Выбрать провайдера (OpenAI / другой)');
  console.log('   2. Добавить API-ключ в .env');
  console.log('   3. Реализовать генерацию промпта и парсинг ответа');

  // Пример структуры, которая будет генерироваться:
  const placeholder: RecipeData = {
    generatedAt: new Date().toISOString(),
    recipes: [
      {
        title: '[Placeholder] Рецепт будет сгенерирован после подключения AI',
        ingredients: cookingProducts.map(p => p.name),
        ingredientsFromSale: cookingProducts.map(p => p.name),
        steps: ['Подключить AI провайдера', 'Запустить скрипт заново'],
        estimatedTime: '~30 мин',
      }
    ]
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(placeholder, null, 2));
  console.log(`\n📂 Placeholder сохранён: data/recipe.json`);
}

generateRecipe();

