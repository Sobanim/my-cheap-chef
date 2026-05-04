import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { RecipeData } from '@/lib/types';

/**
 * GET /api/recipe
 * Возвращает предгенерированный рецепт недели из data/recipe.json
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'recipe.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const data: RecipeData = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Рецепт ещё не сгенерирован' },
      { status: 404 }
    );
  }
}

