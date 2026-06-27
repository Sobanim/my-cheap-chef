import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Product } from '@/lib/types';

/**
 * GET /api/products
 * Returns the current list of discounted products from data/products.json
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const products: Product[] = JSON.parse(raw);

    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json(
      { error: 'Products are not loaded yet', err },
      { status: 404 }
    );
  }
}

