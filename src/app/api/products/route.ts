import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Product } from '@/lib/types';

/**
 * GET /api/products
 * Возвращает текущий список продуктов по скидке из data/products.json
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const products: Product[] = JSON.parse(raw);

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Продукты пока не загружены' },
      { status: 404 }
    );
  }
}

