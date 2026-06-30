import { NextResponse } from 'next/server';
import { fetchActiveProducts } from '@/lib/services/lidlService';

/**
 * GET /api/products
 * Returns the current list of discounted products dynamically from Lidl API
 */
export async function GET() {
  try {
    const products = await fetchActiveProducts();
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch products dynamically', err: String(err) },
      { status: 500 }
    );
  }
}


