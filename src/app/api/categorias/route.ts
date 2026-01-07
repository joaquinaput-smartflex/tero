import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Categoria, ApiResponse } from '@/types';

// GET /api/categorias - List all categories
export async function GET() {
  try {
    const categorias = await query<Categoria[]>(
      'SELECT * FROM categorias ORDER BY orden'
    );

    return NextResponse.json<ApiResponse<Categoria[]>>({
      success: true,
      data: categorias,
    });
  } catch (error) {
    console.error('Error fetching categorias:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener categorías',
    }, { status: 500 });
  }
}
